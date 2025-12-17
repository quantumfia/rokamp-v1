import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { ARMY_UNITS, ArmyUnit } from '@/data/armyUnits';

interface RiskSummaryPanelProps {
  onUnitClick?: (unitId: string) => void;
}

// 위치 및 위험도 데이터가 있는 부대만 필터링
const getUnitsWithRisk = (): (ArmyUnit & { trend: 'up' | 'down' | 'stable' })[] => {
  return ARMY_UNITS
    .filter(unit => unit.lat !== undefined && unit.risk !== undefined)
    .map(unit => ({
      ...unit,
      trend: (unit.risk! >= 60 ? 'up' : unit.risk! <= 40 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
    }))
    .sort((a, b) => (b.risk || 0) - (a.risk || 0));
};

export function RiskSummaryPanel({ onUnitClick }: RiskSummaryPanelProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const overallRisk = 52;

  const allUnits = useMemo(() => getUnitsWithRisk(), []);
  
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return allUnits;
    return allUnits.filter(unit => 
      unit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUnits, searchQuery]);

  // 위험도에 따른 색상 반환
  const getRiskColor = (risk: number) => {
    if (risk >= 75) return 'text-status-error'; // 경고 (빨강)
    if (risk >= 50) return 'text-status-warning'; // 주의 (노랑)
    return 'text-status-success'; // 안전 (초록)
  };

  const overallRiskColor = getRiskColor(overallRisk);

  // 위험도 통계
  const warningCount = allUnits.filter(u => (u.risk || 0) >= 75).length;
  const cautionCount = allUnits.filter(u => (u.risk || 0) >= 50 && (u.risk || 0) < 75).length;
  const safeCount = allUnits.filter(u => (u.risk || 0) < 50).length;

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
      <div className="grid grid-cols-3 border-b border-border">
        <div className="px-3 py-3 border-r border-border">
          <p className="text-[10px] text-muted-foreground mb-1">경고</p>
          <p className="text-xl font-bold text-status-error tabular-nums">{warningCount}</p>
        </div>
        <div className="px-3 py-3 border-r border-border">
          <p className="text-[10px] text-muted-foreground mb-1">주의</p>
          <p className="text-xl font-bold text-status-warning tabular-nums">{cautionCount}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] text-muted-foreground mb-1">안전</p>
          <p className="text-xl font-bold text-status-success tabular-nums">{safeCount}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="부대명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/30 border-border"
          />
        </div>
      </div>

      {/* Units List */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border shrink-0">
          <p className="text-[10px] text-muted-foreground">
            전체 부대 ({filteredUnits.length})
          </p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onUnitClick?.(unit.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
            >
              <span className="text-xs text-foreground truncate mr-2">{unit.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs font-semibold tabular-nums ${getRiskColor(unit.risk || 0)}`}>
                  {unit.risk}%
                </span>
                {unit.trend === 'up' && <TrendingUp className="w-3 h-3 text-status-error" />}
                {unit.trend === 'down' && <TrendingDown className="w-3 h-3 text-status-success" />}
              </div>
            </button>
          ))}
          {filteredUnits.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}