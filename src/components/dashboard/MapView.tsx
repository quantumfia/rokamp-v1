import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ARMY_UNITS, UNIT_TYPE_LABELS } from '@/data/armyUnits';
import { Home } from 'lucide-react';

interface MapViewProps {
  className?: string;
  onMarkerClick?: (unitId: string) => void;
  selectedUnitId?: string | null;
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


// Custom marker icon creation
const createMarkerIcon = (risk: number) => {
  const color = risk < 25 ? '#22c55e' : risk < 50 ? '#f59e0b' : risk < 75 ? '#f59e0b' : '#ef4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color}20;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color}80;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function MapView({ className, onMarkerClick, selectedUnitId }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const { user } = useAuth();
  const [isZoomed, setIsZoomed] = useState(false);

  // 기본 뷰 설정
  const DEFAULT_CENTER: [number, number] = [37.5, 127.0];
  const DEFAULT_ZOOM = 8;

  // 선택된 부대로 맵 이동 + 팝업 표시
  useEffect(() => {
    if (!mapRef.current || !selectedUnitId) return;

    const unit = ARMY_UNITS.find(u => u.id === selectedUnitId);
    if (unit && unit.lat && unit.lng) {
      // 더 가까이 줌 (레벨 13)
      mapRef.current.flyTo([unit.lat, unit.lng], 13, {
        duration: 0.5,
      });
      
      // flyTo 완료 후 팝업 열기
      const openPopup = () => {
        const marker = markersRef.current.get(selectedUnitId);
        if (marker) {
          marker.openPopup();
        }
        mapRef.current?.off('moveend', openPopup);
      };
      
      mapRef.current.on('moveend', openPopup);
    }
  }, [selectedUnitId]);

  // 기본 뷰로 리셋
  const resetToDefaultView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, {
        duration: 0.5,
      });
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 25) return '#22c55e';
    if (risk < 50) return '#f59e0b';
    if (risk < 75) return '#f59e0b';
    return '#ef4444';
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    mapRef.current = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    // Add dark tile layer - CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // 줌 변경 감지
    mapRef.current.on('zoomend', () => {
      const currentZoom = mapRef.current?.getZoom() || DEFAULT_ZOOM;
      setIsZoomed(currentZoom !== DEFAULT_ZOOM);
    });

    mapRef.current.on('moveend', () => {
      const currentZoom = mapRef.current?.getZoom() || DEFAULT_ZOOM;
      const currentCenter = mapRef.current?.getCenter();
      const isDefaultPosition = 
        currentZoom === DEFAULT_ZOOM && 
        currentCenter && 
        Math.abs(currentCenter.lat - DEFAULT_CENTER[0]) < 0.1 && 
        Math.abs(currentCenter.lng - DEFAULT_CENTER[1]) < 0.1;
      setIsZoomed(!isDefaultPosition);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers - 전체 부대 마커 표시
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // ARMY_UNITS에서 좌표가 있는 모든 부대 마커 추가
    const unitsWithCoords = ARMY_UNITS.filter(u => u.lat && u.lng && u.risk !== undefined);
    
    unitsWithCoords.forEach((unit) => {
      const marker = L.marker([unit.lat!, unit.lng!], {
        icon: createMarkerIcon(unit.risk!),
      }).addTo(mapRef.current!);

      // 위험 요인 생성 (위험도에 따라)
      const getRiskFactors = (risk: number) => {
        if (risk >= 70) return ['훈련 강도 과다', '장비 노후화', '피로도 누적'];
        if (risk >= 50) return ['야간 훈련 증가', '신병 비율 높음'];
        if (risk >= 30) return ['기상 악화 예보', '정비 일정 지연'];
        return ['정상 운영 중'];
      };

      const riskFactors = getRiskFactors(unit.risk!);
      const riskLevel = unit.risk! >= 70 ? '위험' : unit.risk! >= 50 ? '경고' : unit.risk! >= 30 ? '주의' : '안전';

      // Create popup content with more info
      const popupContent = `
        <div style="
          background: hsl(220, 13%, 10%);
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid hsl(220, 10%, 25%);
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          <div style="
            font-size: 13px;
            font-weight: 600;
            color: hsl(0, 0%, 95%);
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid hsl(220, 10%, 20%);
          ">${unit.name}</div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; color: hsl(0, 0%, 60%);">위험도</span>
            <span style="font-size: 12px; font-weight: 600; color: ${getRiskColor(unit.risk!)};">${unit.risk}% (${riskLevel})</span>
          </div>
          
          ${unit.unitType ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; color: hsl(0, 0%, 60%);">부대 유형</span>
            <span style="font-size: 11px; color: hsl(0, 0%, 85%);">${UNIT_TYPE_LABELS[unit.unitType]}</span>
          </div>
          ` : ''}
          
          ${unit.region ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11px; color: hsl(0, 0%, 60%);">지역</span>
            <span style="font-size: 11px; color: hsl(0, 0%, 85%);">${unit.region}</span>
          </div>
          ` : ''}
          
          <div style="
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid hsl(220, 10%, 20%);
          ">
            <div style="font-size: 10px; color: hsl(0, 0%, 50%); margin-bottom: 4px;">주요 위험 요인</div>
            ${riskFactors.map(f => `
              <div style="
                font-size: 10px;
                color: ${unit.risk! >= 50 ? 'hsl(40, 90%, 60%)' : 'hsl(0, 0%, 70%)'};
                padding: 2px 0;
              ">• ${f}</div>
            `).join('')}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'military-popup',
      });

      marker.on('click', () => {
        onMarkerClick?.(unit.id);
      });

      markersRef.current.set(unit.id, marker);
    });
  }, [onMarkerClick]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div ref={mapContainerRef} className="w-full h-full" style={{ background: 'hsl(220, 13%, 8%)' }} />
      
      {/* Reset View Button */}
      {isZoomed && (
        <button
          onClick={resetToDefaultView}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-panel-dark/90 backdrop-blur-sm border border-sidebar-border rounded text-xs text-white hover:bg-panel-dark transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          전체 보기
        </button>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 floating-panel p-2.5 z-10">
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
      <style>{`
        .leaflet-container {
          background: hsl(220, 13%, 8%) !important;
          font-family: inherit;
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-overlay-pane {
          z-index: 2 !important;
        }
        .leaflet-marker-pane {
          z-index: 3 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 4 !important;
        }
        .leaflet-popup-pane {
          z-index: 5 !important;
        }
        .leaflet-top,
        .leaflet-bottom {
          z-index: 10 !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-control-zoom {
          border: 1px solid hsl(220, 10%, 20%) !important;
          background: hsl(220, 13%, 10%) !important;
        }
        .leaflet-control-zoom a {
          background: hsl(220, 13%, 10%) !important;
          color: hsl(0, 0%, 70%) !important;
          border-bottom-color: hsl(220, 10%, 20%) !important;
        }
        .leaflet-control-zoom a:hover {
          background: hsl(220, 10%, 15%) !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
