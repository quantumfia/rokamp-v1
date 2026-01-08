import { X, ArrowLeft, Cloud, Thermometer, Wind, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUnitById, getUnitFullName, LEVEL_LABELS, UNIT_TYPE_LABELS } from '@/data/armyUnits';
import { cn } from '@/lib/utils';
import type { RiskGrade } from '@/types/entities';
import { getRiskGradeFromScore, RISK_GRADE_LABELS, RISK_GRADE_COLORS, RISK_GRADE_BG_COLORS } from '@/types/entities';

interface UnitDetailPanelHorizontalProps {
  unitId: string;
  onClose: () => void;
  showBackButton?: boolean;
}

// 훈련 일정 (날짜 있음)
const TRAINING_ITEMS = [
  { id: '1', title: 'K-2 소총 영점사격', time: '09:00~12:00', date: '1/6' },
  { id: '2', title: '기초체력단련', time: '06:00~08:00', date: '1/7' },
  { id: '3', title: '동절기 차량정비 점검', time: '14:00~17:00', date: '1/8' },
  { id: '4', title: '야간 기동훈련', time: '20:00~24:00', date: '1/8' },
  { id: '5', title: '안전교육 (동절기)', time: '10:00~12:00', date: '1/9' },
  { id: '6', title: '전술훈련 (소대공격)', time: '08:00~18:00', date: '1/10' },
];

// 예보/위험 (날짜 없음)
const RISK_ALERTS = [
  { id: '1', title: '한파특보 예상 (1/7~1/9)', level: 'WARNING' as const },
  { id: '2', title: '폭설로 인한 차량 전복 위험', level: 'DANGER' as const },
  { id: '3', title: '야간 행군 중 저체온증 주의', level: 'CAUTION' as const },
  { id: '4', title: '사격장 결빙으로 미끄러짐 주의', level: 'ATTENTION' as const },
  { id: '5', title: 'GOP 빙판 낙상사고 발생 (1군단)', level: 'SAFE' as const },
];

export function UnitDetailPanelHorizontal({ unitId, onClose, showBackButton = false }: UnitDetailPanelHorizontalProps) {
  
  const unit = getUnitById(unitId);
  const unitName = unit?.name || '알 수 없는 부대';
  const riskValue = unit?.risk || 0;
  const unitType = unit?.unitType ? UNIT_TYPE_LABELS[unit.unitType] : '일반';
  const region = unit?.region || '정보 없음';
  const levelLabel = unit ? LEVEL_LABELS[unit.level] : '';
  const fullPath = getUnitFullName(unitId);

  const getRiskColor = (risk: number) => RISK_GRADE_COLORS[getRiskGradeFromScore(risk)];
  const getRiskBg = (risk: number) => RISK_GRADE_BG_COLORS[getRiskGradeFromScore(risk)];
  const getRiskLabel = (risk: number) => RISK_GRADE_LABELS[getRiskGradeFromScore(risk)];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h3 className="text-lg font-bold text-foreground">{unitName}</h3>
            <p className="text-sm text-muted-foreground">{levelLabel} · {fullPath}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* 현재 위험도 + 부대/기상 정보 */}
        <div className="flex gap-4">
          {/* 현재 위험도 */}
          <div className="bg-muted/40 rounded-xl p-4 shrink-0">
            <p className="text-xs text-muted-foreground mb-1">현재 위험도</p>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-bold tabular-nums ${getRiskColor(riskValue)}`}>
                {riskValue}%
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold text-white mb-0.5 ${getRiskBg(riskValue)}`}>
                {getRiskLabel(riskValue)}
              </span>
            </div>
          </div>

          {/* 부대 정보 + 기상 정보 */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-muted/30 rounded-lg px-3 py-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">유형</span>
                <span className="text-xs font-medium text-foreground">{unitType}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">지역</span>
                <span className="text-xs font-medium text-foreground">{region}</span>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg px-3 py-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-status-error" />
                <span className="text-xs font-medium text-foreground">-5°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">눈</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">12m/s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 일정 (훈련) */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">일정</p>
          <div className="space-y-1 max-h-[140px] overflow-y-auto">
            {TRAINING_ITEMS.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm hover:bg-muted/30"
              >
                <span className="shrink-0 w-10 text-xs text-muted-foreground">{item.date}</span>
                <span className="shrink-0 w-1 h-4 rounded-full bg-primary/40" />
                <span className="flex-1 truncate text-foreground">{item.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 예보/위험 */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">예보/위험</p>
          <div className="space-y-1">
            {RISK_ALERTS.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded text-sm",
                  item.level === 'DANGER'
                    ? 'bg-status-error/5'
                    : item.level === 'WARNING'
                      ? 'bg-status-warning/5'
                      : item.level === 'CAUTION'
                        ? 'bg-risk-caution/10'
                        : item.level === 'ATTENTION'
                          ? 'bg-risk-attention/10'
                          : 'bg-muted/30'
                )}
              >
                <span className={cn(
                  "shrink-0 w-1 h-4 rounded-full",
                  item.level === 'DANGER' ? 'bg-status-error' :
                  item.level === 'WARNING' ? 'bg-status-warning' :
                  item.level === 'CAUTION' ? 'bg-risk-caution' :
                  item.level === 'ATTENTION' ? 'bg-risk-attention' : 'bg-muted-foreground/50'
                )} />
                <span className={cn(
                  "flex-1",
                  item.level === 'DANGER' ? 'text-status-error' :
                  item.level === 'WARNING' ? 'text-status-warning' :
                  item.level === 'CAUTION' ? 'text-risk-caution' :
                  item.level === 'ATTENTION' ? 'text-risk-attention' : 'text-muted-foreground'
                )}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
