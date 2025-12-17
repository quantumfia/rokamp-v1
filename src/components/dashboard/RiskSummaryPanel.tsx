import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSearchableUnits } from '@/data/armyUnits';
import { useMemo } from 'react';

interface RiskSummaryPanelProps {
  onUnitClick?: (unitId: string) => void;
}

export function RiskSummaryPanel({ onUnitClick }: RiskSummaryPanelProps) {
  const { user } = useAuth();
  
  // 전체 부대 리스트를 위험도 순으로 정렬
  const sortedUnits = useMemo(() => {
    const units = getSearchableUnits();
    return units
      .filter(unit => unit.risk !== undefined)
      .sort((a, b) => (b.risk || 0) - (a.risk || 0));
  }, []);

  const overallRisk = 52;

  // 위험도에 따른 색상 반환
  const getRiskColor = (risk: number) => {
    if (risk >= 75) return 'text-status-error'; // 경고 (빨강)
    if (risk >= 50) return 'text-status-warning'; // 주의 (노랑)
    return 'text-status-success'; // 안전 (초록)
  };

  // 트렌드 계산 (임시로 위험도 기반)
  const getTrend = (risk: number): 'up' | 'down' | 'stable' => {
    if (risk >= 65) return 'up';
    if (risk <= 35) return 'down';
    return 'stable';
  };

  const overallRiskColor = getRiskColor(overallRisk);

  // 경고/안전 부대 수 계산
  const warningCount = sortedUnits.filter(u => (u.risk || 0) >= 50).length;
  const safeCount = sortedUnits.filter(u => (u.risk || 0) < 50).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">위험도 요약</h3>
          <span className="text-[10px] text-muted-foreground">전군</span>
        </div>
      </div>

      {/* Overall Risk */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-[10px] text-muted-foreground mb-1">종합 위험도</p>
        <p className={`text-4xl font-bold tabular-nums ${overallRiskColor}`}>{overallRisk}%</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 border-b border-border">
        <div className="px-4 py-3 border-r border-border">
          <p className="text-[10px] text-muted-foreground mb-1">주의</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{warningCount}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] text-muted-foreground mb-1">안전</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{safeCount}</p>
        </div>
      </div>

      {/* All Units List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-2 bg-muted/30 border-b border-border sticky top-0">
          <p className="text-[10px] text-muted-foreground">전체 부대 위험도 ({sortedUnits.length})</p>
        </div>
        <div className="divide-y divide-border/50">
          {sortedUnits.map((unit) => {
            const risk = unit.risk || 0;
            const trend = getTrend(risk);
            return (
              <button
                key={unit.id}
                onClick={() => onUnitClick?.(unit.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-xs text-foreground">{unit.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold tabular-nums ${getRiskColor(risk)}`}>
                    {risk}%
                  </span>
                  {trend === 'up' && <TrendingUp className="w-3 h-3 text-status-error" />}
                  {trend === 'down' && <TrendingDown className="w-3 h-3 text-status-success" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}