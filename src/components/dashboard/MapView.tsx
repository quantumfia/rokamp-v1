import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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

export function MapView({ className, onMarkerClick }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();

  // 권한별 표시할 부대 및 줌 레벨 결정 (MAIN-MAP)
  const getViewConfig = () => {
    switch (user?.role) {
      case 'ROLE_HQ':
        // 육군본부: 전국 전도 + 전군 사단 마커
        return { units: ALL_UNITS, zoomLevel: 'national', title: '대한민국 전도' };
      case 'ROLE_DIV':
        // 사단급: 해당 사단 작전구역 + 예하 연대/대대 마커
        return { units: DIV_UNITS, zoomLevel: 'regional', title: '제1사단 작전구역' };
      case 'ROLE_BN':
        // 대대급: 주둔지/훈련장 정밀 지도
        return { units: BN_UNITS, zoomLevel: 'local', title: '11연대 1대대 주둔지' };
      default:
        return { units: ALL_UNITS, zoomLevel: 'national', title: '대한민국 전도' };
    }
  };

  const viewConfig = getViewConfig();
  const UNITS = viewConfig.units;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      draw();
    };

    const getRiskColor = (risk: number) => {
      if (risk < 25) return '#22c55e';
      if (risk < 50) return '#f59e0b';
      if (risk < 75) return '#f59e0b';
      return '#ef4444';
    };

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Dark map background - Palantir style
      ctx.fillStyle = 'hsl(220, 13%, 12%)';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'hsl(220, 10%, 18%)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Simulated Korea outline
      ctx.beginPath();
      ctx.strokeStyle = 'hsl(187, 85%, 35%)';
      ctx.lineWidth = 1.5;
      
      // Simplified peninsula shape
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const scale = Math.min(width, height) * 0.38;

      ctx.moveTo(centerX - scale * 0.3, centerY - scale * 0.8);
      ctx.quadraticCurveTo(centerX + scale * 0.5, centerY - scale * 0.6, centerX + scale * 0.4, centerY);
      ctx.quadraticCurveTo(centerX + scale * 0.5, centerY + scale * 0.5, centerX + scale * 0.2, centerY + scale * 0.8);
      ctx.quadraticCurveTo(centerX - scale * 0.2, centerY + scale * 0.9, centerX - scale * 0.4, centerY + scale * 0.5);
      ctx.quadraticCurveTo(centerX - scale * 0.5, centerY, centerX - scale * 0.3, centerY - scale * 0.8);
      ctx.stroke();

      // Draw heatmap overlay (simplified)
      UNITS.forEach((unit, index) => {
        const x = centerX + (index % 3 - 1) * scale * 0.5;
        const y = centerY + (Math.floor(index / 3) - 1) * scale * 0.4;
        const radius = 35 + unit.risk * 0.4;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const color = getRiskColor(unit.risk);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw unit markers
      UNITS.forEach((unit, index) => {
        const x = centerX + (index % 3 - 1) * scale * 0.5;
        const y = centerY + (Math.floor(index / 3) - 1) * scale * 0.4;

        // Marker glow
        ctx.shadowColor = getRiskColor(unit.risk);
        ctx.shadowBlur = 8;

        // Outer ring
        ctx.strokeStyle = getRiskColor(unit.risk);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dot
        ctx.fillStyle = getRiskColor(unit.risk);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Label background
        const labelWidth = ctx.measureText(unit.name).width + 8;
        ctx.fillStyle = 'hsla(220, 13%, 10%, 0.9)';
        ctx.fillRect(x - labelWidth / 2, y + 14, labelWidth, 16);

        // Label
        ctx.fillStyle = 'hsl(0, 0%, 90%)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(unit.name, x, y + 25);
      });
    };

    window.addEventListener('resize', resize);
    resize();

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const scale = Math.min(width, height) * 0.38;

      UNITS.forEach((unit, index) => {
        const ux = centerX + (index % 3 - 1) * scale * 0.5;
        const uy = centerY + (Math.floor(index / 3) - 1) * scale * 0.4;
        const distance = Math.sqrt((x - ux) ** 2 + (y - uy) ** 2);

        if (distance < 20) {
          onMarkerClick?.(unit.id);
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
    };
  }, [onMarkerClick, UNITS]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
      />
      
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

      {/* Coordinates */}
      <div className="absolute bottom-3 right-3 floating-panel px-2 py-1.5">
        <p className="text-[10px] font-mono text-panel-dark-foreground/70">
          37.5665°N, 126.9780°E
        </p>
      </div>

      {/* Map controls placeholder */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button className="w-7 h-7 bg-panel-dark/90 border border-sidebar-border rounded text-panel-dark-foreground/70 hover:text-panel-dark-foreground text-xs font-medium">+</button>
        <button className="w-7 h-7 bg-panel-dark/90 border border-sidebar-border rounded text-panel-dark-foreground/70 hover:text-panel-dark-foreground text-xs font-medium">−</button>
      </div>
    </div>
  );
}