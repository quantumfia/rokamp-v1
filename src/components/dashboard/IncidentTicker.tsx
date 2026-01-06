import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleUnitIds } from '@/lib/rbac';

interface IncidentItem {
  id: string;
  title: string;
  unit: string;
  unitId: string; // 부대 ID 추가
  type: 'accident' | 'warning' | 'info';
  date: string;
}

const ALL_INCIDENTS: IncidentItem[] = [
  { id: '1', title: '교통사고로 후송치료 중', unit: '1사단 일병', unitId: 'corps-1-div-1', type: 'accident', date: '2026-01-05' },
  { id: '2', title: '사격훈련 중 안전사고 징후 감지', unit: '제7사단 3연대', unitId: 'corps-7-div-8', type: 'warning', date: '2026-01-05' },
  { id: '3', title: '동파 예방 조치 필요', unit: '전 부대', unitId: 'hq', type: 'warning', date: '2026-01-05' },
  { id: '4', title: '야간훈련 정상 종료', unit: '제1사단 11연대', unitId: 'corps-1-div-1', type: 'info', date: '2026-01-05' },
  { id: '5', title: '차량 정비 중 경미한 부상', unit: '수도기계화보병사단', unitId: 'corps-7-div-mech-cap', type: 'accident', date: '2026-01-05' },
  { id: '6', title: '혹한기 훈련 안전점검 완료', unit: '제3군단', unitId: 'corps-3', type: 'info', date: '2026-01-05' },
];

interface IncidentTickerProps {
  onClickDetail?: () => void;
  compact?: boolean;
}

export function IncidentTicker({ onClickDetail, compact = false }: IncidentTickerProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 역할 기반 필터링된 사고 목록
  const filteredIncidents = useMemo(() => {
    if (!user) return ALL_INCIDENTS;
    
    const accessibleIds = new Set(getAccessibleUnitIds(user.role, user.unitId));
    
    // 전체 부대 대상 공지(hq)는 모든 역할에게 표시
    return ALL_INCIDENTS.filter(incident => 
      incident.unitId === 'hq' || accessibleIds.has(incident.unitId)
    );
  }, [user?.role, user?.unitId]);

  // 필터링된 목록이 비어있으면 기본 메시지 표시용 더미 항목
  const incidents = filteredIncidents.length > 0 
    ? filteredIncidents 
    : [{ id: '0', title: '현재 사고 사례가 없습니다', unit: '해당 없음', unitId: '', type: 'info' as const, date: '' }];

  // 자동 전환 (5초마다)
  useEffect(() => {
    if (incidents.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % incidents.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [incidents.length]);

  // 필터링 변경 시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [user?.role, user?.unitId]);

  // 안전한 인덱스 계산 (배열 범위 초과 방지)
  const safeIndex = Math.min(currentIndex, incidents.length - 1);
  const currentIncident = incidents[safeIndex] || incidents[0];

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
    <div className={cn("flex flex-col justify-center px-4", compact ? "h-[40px] py-1.5" : "h-[78px] py-2")}>
      {/* 상단: 타이틀 + 상세보기 버튼 (compact 모드에서는 숨김) */}
      {!compact && (
        <div className="flex items-center justify-between shrink-0 mb-1">
          <span className="text-xs font-semibold text-foreground">일일사고사례</span>
          <button 
            onClick={onClickDetail}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>상세보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 중앙: 아이콘 + 카드 */}
      <div className="flex items-center gap-3 shrink-0">
        <AlertCircle className={cn('w-4 h-4 shrink-0', getIconColor(currentIncident.type))} />
        <div 
          className={cn(
            'flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300',
            compact ? '' : 'cursor-pointer hover:opacity-80',
            getTypeStyle(currentIncident.type),
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          )}
          onClick={compact ? undefined : onClickDetail}
        >
          <span className="text-xs font-medium whitespace-nowrap">{currentIncident.unit}</span>
          <span className="text-xs truncate">{currentIncident.title}</span>
        </div>
      </div>

      {/* 하단: 인디케이터 (compact 모드에서는 숨김) */}
      {!compact && incidents.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 shrink-0 mt-1">
          {incidents.map((_, idx) => (
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
      )}
    </div>
  );
}
