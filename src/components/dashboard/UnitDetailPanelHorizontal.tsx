import { useState } from 'react';
import { X, ArrowLeft, Cloud, Thermometer, Wind, Droplet, AlertTriangle, Snowflake, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUnitById, getUnitFullName, LEVEL_LABELS, UNIT_TYPE_LABELS } from '@/data/armyUnits';
import { cn } from '@/lib/utils';

interface Training {
  id: string;
  name: string;
  time: string;
  location: string;
  dayIndex: number;
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

type TabType = 'training' | 'risk';

export function UnitDetailPanelHorizontal({ unitId, onClose, showBackButton = false }: UnitDetailPanelHorizontalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('training');
  
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

        {/* 탭 영역 - 훈련 일정 / 예측 위험 */}
        <div>
          <div className="flex border-b border-border mb-4">
            <button
              onClick={() => setActiveTab('training')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === 'training'
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              훈련 일정
              {activeTab === 'training' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === 'risk'
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              예측 위험
              {activeTab === 'risk' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* 훈련 일정 탭 */}
          {activeTab === 'training' && (
            <div className="grid grid-cols-7 gap-1">
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
              {WEEK_DAYS.map((_, dayIdx) => {
                const dayTrainings = MOCK_TRAININGS.filter(t => t.dayIndex === dayIdx);
                return (
                  <div 
                    key={dayIdx} 
                    className={`min-h-[90px] p-1.5 rounded-b-md border ${
                      dayIdx === 0 || dayIdx === 6 ? 'bg-muted/20 border-border/50' : 'bg-muted/30 border-border'
                    }`}
                  >
                    {dayTrainings.length > 0 ? (
                      <div className="space-y-1">
                        {dayTrainings.map((training) => (
                          <TooltipProvider key={training.id} delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="p-1.5 bg-primary/10 border border-primary/20 rounded text-[10px] leading-tight cursor-pointer hover:bg-primary/20 transition-colors"
                                >
                                  <p className="font-semibold text-foreground truncate">{training.name}</p>
                                  <p className="text-primary">{training.time}</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] z-50">
                                <p className="font-semibold">{training.name}</p>
                                <p className="text-xs text-primary">{training.time}</p>
                                <p className="text-xs text-muted-foreground">{training.location}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
          )}

          {/* 예측 위험 탭 */}
          {activeTab === 'risk' && (
            <div className="space-y-2">
              {MOCK_RISK_FACTORS.map((factor) => (
                <div 
                  key={factor.id} 
                  className={`px-3 py-2.5 rounded-lg border ${getFactorColor(factor.level)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      factor.level === 'high' ? 'bg-status-error text-white' :
                      factor.level === 'medium' ? 'bg-status-warning text-black' :
                      'bg-status-success text-white'
                    }`}>
                      {getFactorLabel(factor.level)}
                    </span>
                    <span className="text-xs leading-relaxed">{factor.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 예보/대비 섹션 */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">예보/대비</p>
          <div className="grid grid-cols-2 gap-3">
            {/* 한파 예보 */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-foreground">한파 주의보</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                1/7~1/9 최저 -15°C 예상<br />
                난방시설 점검, 동파 방지 조치
              </p>
            </div>

            {/* 화재 예방 */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-foreground">화재 예방 강화</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                건조 주의보 발령 중<br />
                전열기구 사용 제한
              </p>
            </div>

            {/* 안전사고 예방 */}
            <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-3 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                <span className="text-xs font-semibold text-foreground">동절기 안전수칙</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                야외활동 시 방한장구 필수 착용 · 결빙구간 서행 운전 · 차량 예열 후 출발
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
