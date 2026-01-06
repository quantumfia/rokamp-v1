import { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

// 기본 위험도 단계 설정
interface RiskLevel {
  min: number;
  max: number;
  color: string;
  label: string;
}

const DEFAULT_RISK_LEVELS: RiskLevel[] = [
  { min: 0, max: 29, color: 'hsl(142, 76%, 36%)', label: '안전' },
  { min: 30, max: 59, color: 'hsl(48, 96%, 50%)', label: '주의' },
  { min: 60, max: 100, color: 'hsl(0, 84%, 60%)', label: '위험' },
];

// 단계별 프리셋
const PRESET_LEVELS: Record<3 | 4 | 5, RiskLevel[]> = {
  3: [
    { min: 0, max: 29, color: 'hsl(142, 76%, 36%)', label: '안전' },
    { min: 30, max: 59, color: 'hsl(48, 96%, 50%)', label: '주의' },
    { min: 60, max: 100, color: 'hsl(0, 84%, 60%)', label: '위험' },
  ],
  4: [
    { min: 0, max: 24, color: 'hsl(142, 76%, 36%)', label: '안전' },
    { min: 25, max: 49, color: 'hsl(80, 70%, 45%)', label: '관심' },
    { min: 50, max: 74, color: 'hsl(48, 96%, 50%)', label: '주의' },
    { min: 75, max: 100, color: 'hsl(0, 84%, 60%)', label: '위험' },
  ],
  5: [
    { min: 0, max: 19, color: 'hsl(142, 76%, 36%)', label: '안전' },
    { min: 20, max: 39, color: 'hsl(100, 60%, 45%)', label: '관심' },
    { min: 40, max: 59, color: 'hsl(48, 96%, 50%)', label: '주의' },
    { min: 60, max: 79, color: 'hsl(25, 95%, 53%)', label: '경고' },
    { min: 80, max: 100, color: 'hsl(0, 84%, 60%)', label: '위험' },
  ],
};

// 위험도 설정 컨텍스트 (전역 상태)
let globalRiskLevels = [...DEFAULT_RISK_LEVELS];
let globalListeners: (() => void)[] = [];

function notifyListeners() {
  globalListeners.forEach(listener => listener());
}

export function useRiskLevels() {
  const [, setUpdate] = useState(0);
  
  useEffect(() => {
    const listener = () => setUpdate(prev => prev + 1);
    globalListeners.push(listener);
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    levels: globalRiskLevels,
    setLevels: (levels: RiskLevel[]) => {
      globalRiskLevels = levels;
      notifyListeners();
    },
    getLevelForScore: (score: number) => {
      for (const level of globalRiskLevels) {
        if (score >= level.min && score <= level.max) {
          return level;
        }
      }
      return globalRiskLevels[globalRiskLevels.length - 1];
    }
  };
}

interface RiskScoreGaugeProps {
  score: number;
  label: string;
}

export function RiskScoreGauge({ score, label }: RiskScoreGaugeProps) {
  const { getLevelForScore, levels } = useRiskLevels();
  const currentLevel = getLevelForScore(score);
  
  // 반원 게이지 계산
  const totalSteps = levels.length;
  const currentStepIndex = levels.findIndex(l => score >= l.min && score <= l.max);
  const progressWithinStep = (score - currentLevel.min) / (currentLevel.max - currentLevel.min + 1);
  const segmentAngle = 180 / totalSteps;
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 반원 게이지 */}
      <div className="relative w-16 h-9">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* 세그먼트들 */}
          {levels.map((level, idx) => {
            const startAngle = 180 - idx * segmentAngle;
            const endAngle = 180 - (idx + 1) * segmentAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 - 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 - 40 * Math.sin(endRad);
            
            const isActive = idx <= currentStepIndex;
            
            return (
              <path
                key={idx}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 0 0 ${x2} ${y2} Z`}
                fill={isActive ? level.color : 'hsl(220, 10%, 85%)'}
                stroke="white"
                strokeWidth="1"
                opacity={isActive ? 1 : 0.4}
              />
            );
          })}
          
          {/* 중앙 원 */}
          <circle cx="50" cy="50" r="14" fill="white" stroke="hsl(220, 10%, 80%)" strokeWidth="1" />
          
          {/* 점수 텍스트 */}
          <text
            x="50"
            y="54"
            textAnchor="middle"
            className="text-[12px] font-bold"
            fill={currentLevel.color}
          >
            {Math.round(score)}
          </text>
        </svg>
      </div>
      
      {/* 라벨 */}
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// 위험도 설정 팝오버
function RiskSettingsPopover() {
  const { levels, setLevels } = useRiskLevels();
  const [stepCount, setStepCount] = useState<3 | 4 | 5>(levels.length as 3 | 4 | 5);
  const [tempLevels, setTempLevels] = useState<RiskLevel[]>(levels);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStepCountChange = (count: 3 | 4 | 5) => {
    setStepCount(count);
    setTempLevels(PRESET_LEVELS[count]);
  };
  
  const handleThresholdChange = (index: number, value: number) => {
    const newLevels = [...tempLevels];
    // 현재 레벨의 max 값 업데이트
    newLevels[index] = { ...newLevels[index], max: value };
    // 다음 레벨의 min 값 업데이트
    if (index < newLevels.length - 1) {
      newLevels[index + 1] = { ...newLevels[index + 1], min: value + 1 };
    }
    setTempLevels(newLevels);
  };
  
  const handleApply = () => {
    setLevels(tempLevels);
    setIsOpen(false);
  };
  
  const handleReset = () => {
    setStepCount(3);
    setTempLevels(PRESET_LEVELS[3]);
  };
  
  useEffect(() => {
    if (isOpen) {
      setTempLevels(levels);
      setStepCount(levels.length as 3 | 4 | 5);
    }
  }, [isOpen, levels]);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-muted/50 transition-colors">
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">위험도 단계 설정</h4>
          
          {/* 단계 수 선택 */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">단계 수</label>
            <div className="flex gap-2">
              {([3, 4, 5] as const).map(count => (
                <button
                  key={count}
                  onClick={() => handleStepCountChange(count)}
                  className={cn(
                    'flex-1 py-1.5 text-sm rounded-md border transition-colors',
                    stepCount === count 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background border-border hover:bg-muted'
                  )}
                >
                  {count}단계
                </button>
              ))}
            </div>
          </div>
          
          {/* 각 단계별 범위 설정 */}
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground">단계별 범위</label>
            {tempLevels.map((level, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: level.color }} 
                    />
                    <span className="text-xs font-medium">{level.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {level.min} ~ {level.max}
                  </span>
                </div>
                {idx < tempLevels.length - 1 && (
                  <Slider
                    value={[level.max]}
                    min={level.min + 5}
                    max={tempLevels[idx + 1].max - 5}
                    step={1}
                    onValueChange={([value]) => handleThresholdChange(idx, value)}
                    className="py-1"
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* 버튼들 */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleReset}>
              초기화
            </Button>
            <Button size="sm" className="flex-1" onClick={handleApply}>
              적용
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 오늘의 안전사고 예보와 연동된 위험도 (TrendAnalysisPanel의 평균값 사용)
export function RiskLevelPanel() {
  // TrendAnalysisPanel에서 사용하는 평균 위험도 값
  const averageRiskScore = 67.3;
  
  return (
    <div className="flex items-center justify-center gap-2 px-4 h-[78px] w-48">
      <RiskScoreGauge score={averageRiskScore} label="사건/사고 위험도" />
      <RiskSettingsPopover />
    </div>
  );
}
