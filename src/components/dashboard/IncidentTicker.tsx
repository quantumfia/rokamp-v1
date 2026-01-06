import { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
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
    <div className="h-[78px] relative flex items-center px-4">
      {/* 메인 행: 카드 + 상세보기 */}
      <div className="flex items-center gap-3 w-full">
        {/* 아이콘 */}
        <AlertCircle className={cn('w-4 h-4 shrink-0', getIconColor(currentIncident.type))} />

        {/* 사고 내용 */}
        <div 
          className={cn(
            'flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300 cursor-pointer hover:opacity-80',
            getTypeStyle(currentIncident.type),
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          )}
          onClick={onClickDetail}
        >
          <span className="text-xs font-medium whitespace-nowrap">{currentIncident.unit}</span>
          <span className="text-xs truncate">{currentIncident.title}</span>
        </div>

        {/* 상세보기 버튼 */}
        <button 
          onClick={onClickDetail}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <span>상세보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 인디케이터 (하단 고정, 레이아웃에 영향 없음) */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
        {MOCK_INCIDENTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setCurrentIndex(idx);
                setIsAnimating(false);
              }, 150);
            }}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-all',
              idx === currentIndex ? 'bg-primary w-3' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}
