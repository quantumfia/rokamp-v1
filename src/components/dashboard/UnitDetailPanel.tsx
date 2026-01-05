import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUnitById, getUnitFullName, LEVEL_LABELS, getChildUnits, UNIT_TYPE_LABELS } from '@/data/armyUnits';

interface RiskFactor {
  id: string;
  description: string;
}

interface UnitDetailPanelProps {
  unitId: string;
  onClose: () => void;
  showBackButton?: boolean;
}

const MOCK_RISK_FACTORS: RiskFactor[] = [
  { id: '1', description: '폭우 예보로 인한 차량 전복 위험 증가' },
  { id: '2', description: '야간 행군 중 저체온증 주의 필요' },
  { id: '3', description: '사격장 결빙으로 인한 미끄러짐 주의' },
];

export function UnitDetailPanel({ unitId, onClose, showBackButton = false }: UnitDetailPanelProps) {
  const unit = getUnitById(unitId);
  const unitName = unit?.name || '알 수 없는 부대';
  const riskValue = unit?.risk || 0;
  const unitType = unit?.unitType ? UNIT_TYPE_LABELS[unit.unitType] : '일반';
  const region = unit?.region || '정보 없음';
  const levelLabel = unit ? LEVEL_LABELS[unit.level] : '';
  const fullPath = getUnitFullName(unitId);
  const childUnits = getChildUnits(unitId).filter(u => u.lat !== undefined);

  // 위험도에 따른 색상 반환
  const getRiskColor = (risk: number) => {
    if (risk >= 75) return 'text-status-error'; // 경고 (빨강)
    if (risk >= 50) return 'text-status-warning'; // 주의 (노랑)
    return 'text-status-success'; // 안전 (초록)
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{unitName}</h3>
            <p className="text-[10px] text-muted-foreground">{levelLabel}</p>
          </div>
        </div>
        {!showBackButton && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Unit Path */}
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <p className="text-[10px] text-muted-foreground mb-1">소속</p>
          <p className="text-xs text-foreground">{fullPath}</p>
        </div>

        {/* Risk Value */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-[10px] text-muted-foreground mb-1">현재 위험도</p>
          <p className={`text-4xl font-bold tabular-nums ${getRiskColor(riskValue)}`}>{riskValue}%</p>
        </div>

        {/* Unit Info - 부대 유형과 지역 (민감 정보 제거) */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] text-muted-foreground mb-2">부대 정보</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground">부대 유형</p>
              <p className="text-sm font-medium text-foreground">{unitType}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">지역</p>
              <p className="text-sm font-medium text-foreground">{region}</p>
            </div>
          </div>
        </div>

        {/* Weather Info */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] text-muted-foreground mb-2">기상 정보</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground">기온</p>
              <p className="text-sm font-medium text-foreground">-5°C</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">날씨</p>
              <p className="text-sm font-medium text-foreground">눈 예보</p>
            </div>
          </div>
        </div>

        {/* Subordinate Units */}
        {childUnits.length > 0 && (
          <div className="border-b border-border">
            <div className="px-4 py-2 bg-muted/30">
              <p className="text-[10px] text-muted-foreground">예하 부대 ({childUnits.length})</p>
            </div>
            <div className="divide-y divide-border/50 max-h-32 overflow-y-auto">
              {childUnits.slice(0, 5).map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <span className="text-xs text-foreground">{child.name}</span>
                  {child.risk !== undefined && (
                    <span className={`text-[10px] font-medium tabular-nums ${
                      child.risk >= 75 ? 'text-status-error' : 
                      child.risk >= 50 ? 'text-status-warning' : 'text-status-success'
                    }`}>
                      {child.risk}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Risk Factors */}
        <div>
          <div className="px-4 py-2 bg-muted/30">
            <p className="text-[10px] text-muted-foreground">예측 위험 요인</p>
          </div>
          <div className="divide-y divide-border/50">
            {MOCK_RISK_FACTORS.map((factor) => (
              <div key={factor.id} className="px-4 py-2">
                <span className="text-xs text-foreground">{factor.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
