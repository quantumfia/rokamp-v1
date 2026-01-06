import { useState, useEffect } from 'react';
import { Settings2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 기본 위험도 단계 설정
interface RiskLevel {
  min: number;
  max: number;
  color: string;
  label: string;
}

// 5단계 기준 색상 (초록 → 연두 → 노랑 → 주황 → 빨강)
const COLORS_5 = [
  'hsl(142, 76%, 36%)', // 초록 - 안전
  'hsl(90, 60%, 45%)',  // 연두 - 관심
  'hsl(48, 96%, 50%)',  // 노랑 - 주의
  'hsl(25, 95%, 53%)',  // 주황 - 경고
  'hsl(0, 84%, 60%)',   // 빨강 - 위험
];

// 5단계 기준 라벨
const LABELS_5 = ['안전', '관심', '주의', '경고', '위험'];

// 단계 수에 따른 색상 및 라벨 매핑
function getColorsAndLabels(count: number): { colors: string[]; labels: string[] } {
  switch (count) {
    case 2:
      return {
        colors: [COLORS_5[0], COLORS_5[4]],
        labels: ['안전', '위험'],
      };
    case 3:
      return {
        colors: [COLORS_5[0], COLORS_5[2], COLORS_5[4]],
        labels: ['안전', '주의', '위험'],
      };
    case 4:
      return {
        colors: [COLORS_5[0], COLORS_5[1], COLORS_5[3], COLORS_5[4]],
        labels: ['안전', '관심', '경고', '위험'],
      };
    case 5:
    default:
      return {
        colors: COLORS_5,
        labels: LABELS_5,
      };
  }
}

// 단계 수에 따른 기본 범위 생성
function generateDefaultLevels(count: number): RiskLevel[] {
  const { colors, labels } = getColorsAndLabels(count);
  const step = Math.floor(100 / count);
  
  return labels.map((label, i) => ({
    min: i === 0 ? 0 : i * step,
    max: i === count - 1 ? 100 : (i + 1) * step - 1,
    color: colors[i],
    label,
  }));
}

const DEFAULT_RISK_LEVELS: RiskLevel[] = generateDefaultLevels(3);

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
  
  // 전체 범위에서 현재 점수의 비율 계산 (0~100 → 0~1)
  const progress = score / 100;
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - progress * circumference;
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 원형 게이지 */}
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* 배경 원 */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            strokeWidth="8"
            stroke="hsl(220, 10%, 90%)"
          />
          {/* 진행 원 */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={currentLevel.color}
            className="transition-all duration-500"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-lg font-bold tabular-nums leading-none"
            style={{ color: currentLevel.color }}
          >
            {Math.round(score)}
          </span>
          <span 
            className="text-[9px] font-semibold mt-0.5"
            style={{ color: currentLevel.color }}
          >
            {currentLevel.label}
          </span>
        </div>
      </div>
      
      {/* 라벨 */}
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// 단계 수에 따라 색상과 라벨을 자동 재할당
function reassignColorsAndLabels(levels: RiskLevel[]): RiskLevel[] {
  const { colors, labels } = getColorsAndLabels(levels.length);
  return levels.map((level, i) => ({
    ...level,
    color: colors[i],
    label: labels[i],
  }));
}

// 위험도 설정 팝오버
function RiskSettingsPopover() {
  const { levels, setLevels } = useRiskLevels();
  const [tempLevels, setTempLevels] = useState<RiskLevel[]>(levels);
  const [isOpen, setIsOpen] = useState(false);
  
  // max 변경 시: 현재 레벨의 max를 변경하고, 모든 후속 레벨들을 연쇄적으로 조정
  const handleMaxChange = (index: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const newLevels = [...tempLevels];
    const currentLevel = newLevels[index];
    
    // max는 현재 min 이상이어야 함
    let newMax = Math.max(currentLevel.min, Math.min(99, numValue));
    
    // 마지막 단계가 아니면 다음 단계들의 최소 필요 공간 확보
    if (index < newLevels.length - 1) {
      const remainingSteps = newLevels.length - index - 1;
      const maxAllowed = 100 - remainingSteps;
      newMax = Math.min(newMax, maxAllowed);
    }
    
    newLevels[index] = { ...currentLevel, max: newMax };
    
    // 모든 후속 레벨들을 연쇄적으로 조정
    for (let i = index + 1; i < newLevels.length; i++) {
      const prevMax = newLevels[i - 1].max;
      const newMin = prevMax + 1;
      
      newLevels[i] = { ...newLevels[i], min: newMin };
      
      // max가 min보다 작으면 max도 조정 (마지막 단계가 아닌 경우)
      if (i < newLevels.length - 1 && newLevels[i].max < newMin) {
        // 남은 단계 수에 맞게 max 재계산
        const stepsRemaining = newLevels.length - i - 1;
        newLevels[i] = { ...newLevels[i], max: Math.min(newMin, 100 - stepsRemaining) };
      }
    }
    
    // 마지막 단계의 max는 항상 100
    newLevels[newLevels.length - 1] = { ...newLevels[newLevels.length - 1], max: 100 };
    
    setTempLevels(newLevels);
  };
  
  const handleAddLevel = () => {
    if (tempLevels.length >= 5) return;
    
    const newCount = tempLevels.length + 1;
    // 기존 범위 기반으로 새 레벨 삽입 (마지막 단계 앞에)
    const lastLevel = tempLevels[tempLevels.length - 1];
    const newMin = Math.floor((lastLevel.min + lastLevel.max) / 2) + 1;
    
    const newLevels = [...tempLevels];
    // 마지막 레벨의 max 조정
    newLevels[newLevels.length - 1] = { ...lastLevel, max: newMin - 1 };
    // 새 레벨 추가 (마지막에)
    newLevels.push({
      min: newMin,
      max: 100,
      color: '',
      label: '',
    });
    
    // 색상과 라벨 자동 재할당
    setTempLevels(reassignColorsAndLabels(newLevels));
  };
  
  const handleRemoveLevel = (index: number) => {
    if (tempLevels.length <= 2) return;
    
    let newLevels = tempLevels.filter((_, i) => i !== index);
    
    // 범위 재조정
    if (index === 0 && newLevels.length > 0) {
      newLevels[0] = { ...newLevels[0], min: 0 };
    } else if (index === tempLevels.length - 1 && newLevels.length > 0) {
      newLevels[newLevels.length - 1] = { ...newLevels[newLevels.length - 1], max: 100 };
    } else if (index > 0 && index < newLevels.length) {
      // 중간 삭제 시 이전 레벨의 max를 다음 레벨의 min-1로
      newLevels[index - 1] = { ...newLevels[index - 1], max: newLevels[index].min - 1 };
    }
    
    // 색상과 라벨 자동 재할당
    setTempLevels(reassignColorsAndLabels(newLevels));
  };
  
  const handleApply = () => {
    // 유효성 검사
    let isValid = true;
    for (let i = 0; i < tempLevels.length - 1; i++) {
      if (tempLevels[i].max >= tempLevels[i + 1].min) {
        isValid = false;
        break;
      }
    }
    if (tempLevels[0].min !== 0 || tempLevels[tempLevels.length - 1].max !== 100) {
      isValid = false;
    }
    
    if (isValid) {
      setLevels(tempLevels);
      setIsOpen(false);
    }
  };
  
  const handleReset = () => {
    setTempLevels(generateDefaultLevels(3));
  };
  
  useEffect(() => {
    if (isOpen) {
      setTempLevels([...levels]);
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">위험도 단계 설정</h4>
            <span className="text-xs text-muted-foreground">{tempLevels.length}단계</span>
          </div>
          
          {/* 각 단계별 설정 */}
          <div className="space-y-2">
            {tempLevels.map((level, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                {/* 색상 표시 */}
                <div 
                  className="w-3 h-8 rounded-sm shrink-0" 
                  style={{ backgroundColor: level.color }} 
                />
                
                {/* 라벨 (읽기 전용) */}
                <span className="w-12 text-xs font-medium shrink-0">{level.label}</span>
                
                {/* Min 표시 (읽기 전용 - 자동 계산됨) */}
                <span className="w-10 h-7 text-xs text-center tabular-nums flex items-center justify-center bg-muted/50 rounded text-muted-foreground">
                  {level.min}
                </span>
                
                <span className="text-xs text-muted-foreground">~</span>
                
                {/* Max 입력 (마지막 단계는 항상 100 고정) */}
                {idx === tempLevels.length - 1 ? (
                  <span className="w-10 h-7 text-xs text-center tabular-nums flex items-center justify-center bg-muted/50 rounded text-muted-foreground">
                    100
                  </span>
                ) : (
                  <Input
                    type="number"
                    value={level.max}
                    onChange={(e) => handleMaxChange(idx, e.target.value)}
                    className="w-10 h-7 text-xs px-1 text-center tabular-nums"
                    min={level.min}
                    max={99}
                  />
                )}
                
                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleRemoveLevel(idx)}
                  disabled={tempLevels.length <= 2}
                  className={cn(
                    'p-1 rounded transition-colors shrink-0',
                    tempLevels.length <= 2 
                      ? 'text-muted-foreground/30 cursor-not-allowed' 
                      : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          
          {/* 단계 추가 버튼 */}
          {tempLevels.length < 5 && (
            <button
              onClick={handleAddLevel}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:border-foreground/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              단계 추가
            </button>
          )}
          
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
