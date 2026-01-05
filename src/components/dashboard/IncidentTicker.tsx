import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentItem {
  id: string;
  title: string;
  unit: string;
  type: 'accident' | 'warning' | 'info';
  date: string;
}

const MOCK_INCIDENTS: IncidentItem[] = [
  { id: '1', title: '교통사고로 후송치료 중', unit: '1사단 일병', type: 'accident', date: '2026-01-05' },
  { id: '2', title: '사격훈련 중 안전사고 징후 감지', unit: '제7사단 3연대', type: 'warning', date: '2026-01-05' },
  { id: '3', title: '동파 예방 조치 필요', unit: '전 부대', type: 'warning', date: '2026-01-05' },
  { id: '4', title: '야간훈련 정상 종료', unit: '제1사단 11연대', type: 'info', date: '2026-01-05' },
];

interface IncidentTickerProps {
  onClickDetail?: () => void;
}

export function IncidentTicker({ onClickDetail }: IncidentTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 자동 전환 (5초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MOCK_INCIDENTS.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentIncident = MOCK_INCIDENTS[currentIndex];

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'accident':
        return 'bg-status-error/10 border-status-error/30 text-status-error';
      case 'warning':
        return 'bg-status-warning/10 border-status-warning/30 text-status-warning';
      default:
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'accident':
        return 'text-status-error';
      case 'warning':
        return 'text-status-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-[78px] flex items-center px-4 gap-3">
      {/* 라벨 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <AlertCircle className={cn('w-4 h-4', getIconColor(currentIncident.type))} />
        <span className="text-xs font-medium text-foreground whitespace-nowrap">일일 사고사례</span>
      </div>

      {/* 구분선 */}
      <div className="h-8 w-px bg-border shrink-0" />

      {/* 사고 내용 */}
      <div 
        className={cn(
          'flex-1 flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-300 cursor-pointer hover:opacity-80',
          getTypeStyle(currentIncident.type),
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        )}
        onClick={onClickDetail}
      >
        <span className="text-xs font-medium whitespace-nowrap">{currentIncident.unit}</span>
        <span className="text-xs truncate">{currentIncident.title}</span>
      </div>
    </div>
  );
}
