import { useState } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

interface RiskUnit {
  id: string;
  name: string;
  risk: number;
  trend: 'up' | 'down' | 'stable';
}

const MOCK_RISK_DATA: RiskUnit[] = [
  { id: 'corps-1-div-9', name: '제9보병사단', risk: 78, trend: 'up' },
  { id: 'corps-5-div-6', name: '제6보병사단', risk: 68, trend: 'up' },
  { id: 'corps-3-div-21', name: '제21보병사단', risk: 55, trend: 'stable' },
  { id: 'corps-1-div-1', name: '제1보병사단', risk: 48, trend: 'down' },
  { id: 'corps-2-div-7', name: '제7보병사단', risk: 42, trend: 'down' },
  { id: 'corps-1-div-2', name: '제2보병사단', risk: 38, trend: 'stable' },
  { id: 'corps-2-div-3', name: '제3보병사단', risk: 35, trend: 'down' },
  { id: 'corps-3-div-5', name: '제5보병사단', risk: 32, trend: 'stable' },
  { id: 'corps-1-div-8', name: '제8보병사단', risk: 29, trend: 'down' },
  { id: 'corps-2-div-11', name: '제11기계화보병사단', risk: 26, trend: 'stable' },
  { id: 'corps-3-div-12', name: '제12보병사단', risk: 24, trend: 'down' },
  { id: 'corps-1-div-15', name: '제15보병사단', risk: 22, trend: 'stable' },
  { id: 'test-001', name: '제16보병사단', risk: 21, trend: 'down' },
  { id: 'test-002', name: '제17보병사단', risk: 20, trend: 'stable' },
  { id: 'test-003', name: '제18보병사단', risk: 19, trend: 'down' },
  { id: 'test-004', name: '제19보병사단', risk: 18, trend: 'stable' },
  { id: 'test-005', name: '제20보병사단', risk: 17, trend: 'down' },
  { id: 'test-006', name: '제22보병사단', risk: 16, trend: 'stable' },
  { id: 'test-007', name: '제23보병사단', risk: 15, trend: 'down' },
  { id: 'test-008', name: '제25보병사단', risk: 14, trend: 'stable' },
  { id: 'test-009', name: '제26보병사단', risk: 13, trend: 'down' },
  { id: 'test-010', name: '제27보병사단', risk: 12, trend: 'stable' },
  { id: 'test-011', name: '제28보병사단', risk: 11, trend: 'down' },
  { id: 'test-012', name: '제30보병사단', risk: 10, trend: 'stable' },
  { id: 'test-013', name: '제31보병사단', risk: 9, trend: 'down' },
  { id: 'test-014', name: '제32보병사단', risk: 8, trend: 'stable' },
  { id: 'test-015', name: '제33보병사단', risk: 7, trend: 'down' },
  { id: 'test-016', name: '제35보병사단', risk: 6, trend: 'stable' },
  { id: 'test-017', name: '제36보병사단', risk: 5, trend: 'down' },
  { id: 'test-018', name: '제37보병사단', risk: 4, trend: 'stable' },
  { id: 'test-019', name: '제39보병사단', risk: 3, trend: 'down' },
  { id: 'test-020', name: '제50보병사단', risk: 2, trend: 'stable' },
];

interface RiskSummaryPanelProps {
  onUnitClick?: (unitId: string) => void;
}

export function RiskSummaryPanel({ onUnitClick }: RiskSummaryPanelProps) {
  useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const overallRisk = 52;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // 검색어로 필터링
  const filteredUnits = normalizedQuery
    ? MOCK_RISK_DATA.filter((unit) => unit.name.toLowerCase().includes(normalizedQuery))
    : MOCK_RISK_DATA;

  // 위험도에 따른 색상 반환
  const getRiskColor = (risk: number) => {
    if (risk >= 75) return 'text-status-error'; // 경고 (빨강)
    if (risk >= 50) return 'text-status-warning'; // 주의 (노랑)
    return 'text-status-success'; // 안전 (초록)
  };

  const overallRiskColor = getRiskColor(overallRisk);

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
          <p className="text-[10px] text-muted-foreground mb-1">경고</p>
          <p className="text-xl font-bold text-foreground tabular-nums">2</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] text-muted-foreground mb-1">안전</p>
          <p className="text-xl font-bold text-foreground tabular-nums">8</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-border sticky top-0 bg-background z-10">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="부대명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs bg-muted/30 border-border"
          />
        </div>
      </div>

      {/* Unit List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="divide-y divide-border/50">
          {filteredUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onUnitClick?.(unit.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
            >
              <span className="text-xs text-foreground">{unit.name}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold tabular-nums ${getRiskColor(unit.risk)}`}>
                  {unit.risk}%
                </span>
                {unit.trend === 'up' && <TrendingUp className="w-3 h-3 text-status-error" />}
                {unit.trend === 'down' && <TrendingDown className="w-3 h-3 text-status-success" />}
              </div>
            </button>
          ))}
          {filteredUnits.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">검색 결과가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
