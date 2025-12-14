import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RiskUnit {
  id: string;
  name: string;
  risk: number;
  trend: 'up' | 'down' | 'stable';
}

const MOCK_RISK_DATA: RiskUnit[] = [
  { id: '1', name: '제7사단 3연대', risk: 78, trend: 'up' },
  { id: '2', name: '제3사단 9연대', risk: 68, trend: 'up' },
  { id: '3', name: '제6사단 2연대', risk: 55, trend: 'stable' },
  { id: '4', name: '제1사단 11연대', risk: 45, trend: 'down' },
  { id: '5', name: '제2사단 17연대', risk: 32, trend: 'down' },
];

interface RiskSummaryPanelProps {
  onUnitClick?: (unitId: string) => void;
}

export function RiskSummaryPanel({ onUnitClick }: RiskSummaryPanelProps) {
  const { user } = useAuth();
  const overallRisk = 52;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">위험도 요약</h3>
          <span className="text-[10px] text-muted-foreground">
            {user?.role === 'ROLE_HQ' ? '전군' : user?.unit}
          </span>
        </div>
      </div>

      {/* Overall Risk */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-[10px] text-muted-foreground mb-1">종합 위험도</p>
        <p className="text-4xl font-bold text-foreground tabular-nums">{overallRisk}%</p>
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

      {/* High Risk Units List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 bg-muted/30 border-b border-border sticky top-0">
          <p className="text-[10px] text-muted-foreground">주의 필요 부대 TOP 5</p>
        </div>
        <div className="divide-y divide-border/50">
          {MOCK_RISK_DATA.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onUnitClick?.(unit.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
            >
              <span className="text-xs text-foreground">{unit.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground tabular-nums">
                  {unit.risk}%
                </span>
                {unit.trend === 'up' && <TrendingUp className="w-3 h-3 text-muted-foreground" />}
                {unit.trend === 'down' && <TrendingDown className="w-3 h-3 text-muted-foreground" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}