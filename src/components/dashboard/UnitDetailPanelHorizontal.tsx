import { X, ArrowLeft, Cloud, Thermometer, Wind, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUnitById, getUnitFullName, LEVEL_LABELS, UNIT_TYPE_LABELS } from '@/data/armyUnits';

interface Training {
  id: string;
  name: string;
  time: string;
  location: string;
  dayIndex: number; // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
}

interface RiskFactor {
  id: string;
  description: string;
  level: 'high' | 'medium' | 'low';
}

interface UnitDetailPanelHorizontalProps {
  unitId: string;
  onClose: () => void;
  showBackButton?: boolean;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MOCK_TRAININGS: Training[] = [
  { id: '1', name: 'K-2 소총 영점사격', time: '09:00 - 12:00', location: '종합사격장', dayIndex: 1 },
  { id: '2', name: '기초체력단련', time: '06:00 - 08:00', location: '연병장', dayIndex: 2 },
  { id: '3', name: '동절기 차량정비 점검', time: '14:00 - 17:00', location: '정비창', dayIndex: 3 },
  { id: '4', name: '야간 기동훈련', time: '20:00 - 24:00', location: '훈련장 A구역', dayIndex: 3 },
  { id: '5', name: '안전교육 (동절기 안전수칙)', time: '10:00 - 12:00', location: '대강당', dayIndex: 4 },
  { id: '6', name: '전술훈련 (소대공격)', time: '08:00 - 18:00', location: '전술훈련장', dayIndex: 5 },
  { id: '7', name: '장비정비 교육', time: '09:00 - 11:00', location: '정비교육장', dayIndex: 5 },
];

const MOCK_RISK_FACTORS: RiskFactor[] = [
  { id: '1', description: '폭우 예보로 인한 차량 전복 위험 증가', level: 'high' },
  { id: '2', description: '야간 행군 중 저체온증 주의 필요', level: 'medium' },
  { id: '3', description: '사격장 결빙으로 인한 미끄러짐 주의', level: 'medium' },
];

export function UnitDetailPanelHorizontal({ unitId, onClose, showBackButton = false }: UnitDetailPanelHorizontalProps) {
  const unit = getUnitById(unitId);
  const unitName = unit?.name || '알 수 없는 부대';
  const riskValue = unit?.risk || 0;
  const unitType = unit?.unitType ? UNIT_TYPE_LABELS[unit.unitType] : '일반';
  const region = unit?.region || '정보 없음';
  const levelLabel = unit ? LEVEL_LABELS[unit.level] : '';
  const fullPath = getUnitFullName(unitId);

  const getRiskColor = (risk: number) => {
    if (risk >= 60) return 'text-status-error';
    if (risk >= 30) return 'text-status-warning';
    return 'text-status-success';
  };

  const getRiskBg = (risk: number) => {
    if (risk >= 60) return 'bg-status-error';
    if (risk >= 30) return 'bg-status-warning';
    return 'bg-status-success';
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 75) return '경고';
    if (risk >= 50) return '주의';
    if (risk >= 25) return '관심';
    return '안전';
  };

  const getFactorColor = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return 'bg-status-error/10 border-status-error/30 text-status-error';
    if (level === 'medium') return 'bg-status-warning/10 border-status-warning/30 text-status-warning';
    return 'bg-status-success/10 border-status-success/30 text-status-success';
  };

  const getFactorLabel = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return '위험';
    if (level === 'medium') return '주의';
    return '관심';
  };

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

      {/* Content - 세로 스크롤 레이아웃 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* 현재 위험도 - 대형 표시 */}
        <div className="bg-muted/40 rounded-xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">현재 위험도</p>
          <div className="flex items-end gap-3">
            <span className={`text-3xl font-bold tabular-nums ${getRiskColor(riskValue)}`}>
              {riskValue}%
            </span>
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold text-white mb-0.5 ${getRiskBg(riskValue)}`}>
              {getRiskLabel(riskValue)}
            </span>
          </div>
        </div>

        {/* 부대 정보 */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">부대 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">부대 유형</p>
              <p className="text-base font-semibold text-foreground">{unitType}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">지역</p>
              <p className="text-base font-semibold text-foreground">{region}</p>
            </div>
          </div>
        </div>

        {/* 기상 정보 */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">기상 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
              <Thermometer className="w-5 h-5 text-status-error" />
              <div>
                <p className="text-xs text-muted-foreground">기온</p>
                <p className="text-base font-semibold text-foreground">-5°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
              <Cloud className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">날씨</p>
                <p className="text-base font-semibold text-foreground">눈 예보</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
              <Wind className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">풍속</p>
                <p className="text-base font-semibold text-foreground">12 m/s</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
              <Droplet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">습도</p>
                <p className="text-base font-semibold text-foreground">65%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 주간 훈련 일정 - 캘린더 형식 */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">주간 훈련 일정</p>
          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 */}
            {WEEK_DAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`text-center text-xs font-semibold py-1.5 rounded-t-md ${
                  idx === 0 ? 'text-status-error bg-status-error/10' : 
                  idx === 6 ? 'text-primary bg-primary/10' : 
                  'text-foreground bg-muted/50'
                }`}
              >
                {day}
              </div>
            ))}
            {/* 각 요일별 일정 */}
            {WEEK_DAYS.map((_, dayIdx) => {
              const dayTrainings = MOCK_TRAININGS.filter(t => t.dayIndex === dayIdx);
              return (
                <div 
                  key={dayIdx} 
                  className={`min-h-[100px] p-1.5 rounded-b-md border ${
                    dayIdx === 0 || dayIdx === 6 ? 'bg-muted/20 border-border/50' : 'bg-muted/30 border-border'
                  }`}
                >
                  {dayTrainings.length > 0 ? (
                    <div className="space-y-1">
                      {dayTrainings.map((training) => (
                        <div 
                          key={training.id} 
                          className="p-1.5 bg-primary/10 border border-primary/20 rounded text-[10px] leading-tight"
                        >
                          <p className="font-semibold text-foreground truncate">{training.name}</p>
                          <p className="text-primary">{training.time}</p>
                          <p className="text-muted-foreground truncate">{training.location}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/50">
                        {dayIdx === 0 || dayIdx === 6 ? '휴무' : '-'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 예측 위험 요인 */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">예측 위험 요인</p>
          <div className="space-y-2">
            {MOCK_RISK_FACTORS.map((factor) => (
              <div 
                key={factor.id} 
                className={`px-4 py-3 rounded-lg border ${getFactorColor(factor.level)}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                    factor.level === 'high' ? 'bg-status-error text-white' :
                    factor.level === 'medium' ? 'bg-status-warning text-black' :
                    'bg-status-success text-white'
                  }`}>
                    {getFactorLabel(factor.level)}
                  </span>
                  <span className="text-sm leading-relaxed">{factor.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
