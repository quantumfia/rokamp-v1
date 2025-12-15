import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

interface MapViewProps {
  className?: string;
  onMarkerClick?: (unitId: string) => void;
}

// 전체 부대 데이터
const ALL_UNITS = [
  { id: '1', name: '제1사단', lat: 37.9, lng: 127.0, risk: 45, parent: 'hq' },
  { id: '2', name: '제2사단', lat: 37.7, lng: 127.1, risk: 32, parent: 'hq' },
  { id: '3', name: '제3사단', lat: 37.5, lng: 126.9, risk: 68, parent: 'hq' },
  { id: '4', name: '제5사단', lat: 37.6, lng: 127.2, risk: 22, parent: 'hq' },
  { id: '5', name: '제6사단', lat: 38.0, lng: 127.3, risk: 55, parent: 'hq' },
  { id: '6', name: '제7사단', lat: 37.8, lng: 127.5, risk: 78, parent: 'hq' },
];

// 사단급 예하 부대 (사단장이 볼 때)
const DIV_UNITS = [
  { id: 'reg-1', name: '11연대', lat: 37.92, lng: 127.05, risk: 52, parent: '1' },
  { id: 'reg-2', name: '12연대', lat: 37.88, lng: 126.95, risk: 38, parent: '1' },
  { id: 'reg-3', name: '15연대', lat: 37.85, lng: 127.08, risk: 61, parent: '1' },
];

// 대대급 (대대장이 볼 때)
const BN_UNITS = [
  { id: 'bn-1', name: '1대대', lat: 37.93, lng: 127.03, risk: 48, parent: 'reg-1' },
  { id: 'bn-2', name: '2대대', lat: 37.91, lng: 127.07, risk: 55, parent: 'reg-1' },
  { id: 'facility-1', name: '훈련장', lat: 37.90, lng: 127.10, risk: 35, parent: 'reg-1' },
];

const MAPBOX_TOKEN_KEY = 'mapbox_access_token';

export function MapView({ className, onMarkerClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { user } = useAuth();
  
  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem(MAPBOX_TOKEN_KEY) || ''
  );
  const [tokenInput, setTokenInput] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  // 권한별 표시할 부대 및 줌 레벨 결정 (MAIN-MAP)
  const getViewConfig = () => {
    switch (user?.role) {
      case 'ROLE_HQ':
        return { 
          units: ALL_UNITS, 
          center: [127.0, 37.5] as [number, number], 
          zoom: 7,
          title: '대한민국 전도' 
        };
      case 'ROLE_DIV':
        return { 
          units: DIV_UNITS, 
          center: [127.0, 37.9] as [number, number], 
          zoom: 10,
          title: '제1사단 작전구역' 
        };
      case 'ROLE_BN':
        return { 
          units: BN_UNITS, 
          center: [127.05, 37.92] as [number, number], 
          zoom: 12,
          title: '11연대 1대대 주둔지' 
        };
      default:
        return { 
          units: ALL_UNITS, 
          center: [127.0, 37.5] as [number, number], 
          zoom: 7,
          title: '대한민국 전도' 
        };
    }
  };

  const viewConfig = getViewConfig();

  const getRiskColor = (risk: number) => {
    if (risk < 25) return '#22c55e';
    if (risk < 50) return '#f59e0b';
    if (risk < 75) return '#f59e0b';
    return '#ef4444';
  };

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: viewConfig.center,
        zoom: viewConfig.zoom,
        pitch: 45,
        bearing: -10,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        }),
        'bottom-right'
      );

      map.current.on('load', () => {
        setIsMapReady(true);
        
        // Add 3D terrain if available
        if (map.current) {
          map.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
          
          map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
          
          // Add fog for atmospheric effect
          map.current.setFog({
            color: 'rgb(20, 20, 30)',
            'high-color': 'rgb(30, 40, 50)',
            'horizon-blend': 0.1,
            'star-intensity': 0.1
          });
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        const errorStatus = (e.error as { status?: number })?.status;
        if (errorStatus === 401) {
          localStorage.removeItem(MAPBOX_TOKEN_KEY);
          setMapboxToken('');
        }
      });

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
      setIsMapReady(false);
    };
  }, [mapboxToken]);

  // Update view when user role changes
  useEffect(() => {
    if (map.current && isMapReady) {
      map.current.flyTo({
        center: viewConfig.center,
        zoom: viewConfig.zoom,
        duration: 1500
      });
    }
  }, [user?.role, isMapReady]);

  // Add markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add unit markers
    viewConfig.units.forEach((unit) => {
      const color = getRiskColor(unit.risk);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'unit-marker';
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: ${color}20;
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 0 12px ${color}80;
          transition: transform 0.2s ease;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
          "></div>
        </div>
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      el.addEventListener('click', () => {
        onMarkerClick?.(unit.id);
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'military-popup'
      }).setHTML(`
        <div style="
          background: hsl(220, 13%, 10%);
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid hsl(220, 10%, 25%);
        ">
          <div style="
            font-size: 12px;
            font-weight: 600;
            color: hsl(0, 0%, 95%);
            margin-bottom: 4px;
          ">${unit.name}</div>
          <div style="
            font-size: 10px;
            color: ${color};
          ">위험도: ${unit.risk}%</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([unit.lng, unit.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

  }, [viewConfig.units, isMapReady, onMarkerClick]);

  // Token input UI when no token
  if (!mapboxToken) {
    return (
      <div className={cn('relative overflow-hidden flex items-center justify-center', className)}>
        <div className="bg-panel-dark/90 border border-sidebar-border rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-panel-dark-foreground">Mapbox API 키 필요</h3>
              <p className="text-xs text-panel-dark-foreground/60">지도 기능을 사용하려면 API 키가 필요합니다</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="pk.eyJ1Ijoi..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="bg-sidebar-bg border-sidebar-border text-sm"
            />
            <Button 
              onClick={handleSaveToken}
              disabled={!tokenInput.trim()}
              className="w-full"
              size="sm"
            >
              키 저장 및 지도 로드
            </Button>
            <p className="text-[10px] text-panel-dark-foreground/50 text-center">
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Mapbox 계정
              </a>
              에서 Public Token을 발급받으세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 floating-panel p-2.5">
        <p className="text-[10px] font-medium text-panel-dark-foreground mb-1.5 uppercase tracking-wider">위험도</p>
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-success" />
            <span className="text-panel-dark-foreground/70">안전</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-warning" />
            <span className="text-panel-dark-foreground/70">주의</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-error" />
            <span className="text-panel-dark-foreground/70">경고</span>
          </div>
        </div>
      </div>

      {/* View title */}
      <div className="absolute top-3 left-3 floating-panel px-3 py-1.5">
        <p className="text-[11px] font-medium text-panel-dark-foreground">
          {viewConfig.title}
        </p>
      </div>

      {/* Token reset button */}
      <div className="absolute bottom-3 right-24">
        <button 
          onClick={() => {
            localStorage.removeItem(MAPBOX_TOKEN_KEY);
            setMapboxToken('');
          }}
          className="floating-panel px-2 py-1 text-[10px] text-panel-dark-foreground/50 hover:text-panel-dark-foreground/80 transition-colors"
        >
          API 키 변경
        </button>
      </div>

      <style>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .mapboxgl-ctrl-group {
          background: hsl(220, 13%, 10%) !important;
          border: 1px solid hsl(220, 10%, 20%) !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: hsl(220, 10%, 15%) !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1) !important;
        }
        .mapboxgl-ctrl-scale {
          background: hsl(220, 13%, 10%) !important;
          border: 1px solid hsl(220, 10%, 20%) !important;
          color: hsl(0, 0%, 70%) !important;
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
}
