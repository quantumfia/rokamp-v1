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

const COLORS = [
  'hsl(142, 76%, 36%)', // 초록
  'hsl(100, 60%, 45%)', // 연두
  'hsl(48, 96%, 50%)',  // 노랑
  'hsl(25, 95%, 53%)',  // 주황
  'hsl(0, 84%, 60%)',   // 빨강
];

const DEFAULT_LABELS = ['안전', '관심', '주의', '경고', '위험'];

const DEFAULT_RISK_LEVELS: RiskLevel[] = [
  { min: 0, max: 29, color: COLORS[0], label: '안전' },
  { min: 30, max: 59, color: COLORS[2], label: '주의' },
  { min: 60, max: 100, color: COLORS[4], label: '위험' },
];

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
  const [tempLevels, setTempLevels] = useState<RiskLevel[]>(levels);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLabelChange = (index: number, label: string) => {
    const newLevels = [...tempLevels];
    newLevels[index] = { ...newLevels[index], label };
    setTempLevels(newLevels);
  };
  
  const handleMinChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newLevels = [...tempLevels];
    newLevels[index] = { ...newLevels[index], min: Math.max(0, Math.min(100, numValue)) };
    // 이전 레벨의 max도 자동 조정
    if (index > 0) {
      newLevels[index - 1] = { ...newLevels[index - 1], max: numValue - 1 };
    }
    setTempLevels(newLevels);
  };
  
  const handleMaxChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newLevels = [...tempLevels];
    newLevels[index] = { ...newLevels[index], max: Math.max(0, Math.min(100, numValue)) };
    // 다음 레벨의 min도 자동 조정
    if (index < newLevels.length - 1) {
      newLevels[index + 1] = { ...newLevels[index + 1], min: numValue + 1 };
    }
    setTempLevels(newLevels);
  };
  
  const handleAddLevel = () => {
    if (tempLevels.length >= 5) return;
    const lastLevel = tempLevels[tempLevels.length - 1];
    const newMin = Math.floor((lastLevel.min + lastLevel.max) / 2) + 1;
    
    const newLevels = [...tempLevels];
    // 마지막 레벨의 max 조정
    newLevels[newLevels.length - 1] = { ...lastLevel, max: newMin - 1 };
    // 새 레벨 추가
    newLevels.push({
      min: newMin,
      max: 100,
      color: COLORS[Math.min(newLevels.length, COLORS.length - 1)],
      label: DEFAULT_LABELS[Math.min(newLevels.length, DEFAULT_LABELS.length - 1)],
    });
    setTempLevels(newLevels);
  };
  
  const handleRemoveLevel = (index: number) => {
    if (tempLevels.length <= 2) return;
    const newLevels = tempLevels.filter((_, i) => i !== index);
    // 범위 재조정
    if (index === 0 && newLevels.length > 0) {
      newLevels[0] = { ...newLevels[0], min: 0 };
    } else if (index === tempLevels.length - 1 && newLevels.length > 0) {
      newLevels[newLevels.length - 1] = { ...newLevels[newLevels.length - 1], max: 100 };
    } else if (index > 0 && index < newLevels.length) {
      // 중간 삭제 시 이전 레벨의 max를 다음 레벨의 min-1로
      newLevels[index - 1] = { ...newLevels[index - 1], max: newLevels[index].min - 1 };
    }
    // 색상 재할당
    newLevels.forEach((level, i) => {
      const colorIndex = Math.floor((i / (newLevels.length - 1)) * (COLORS.length - 1));
      level.color = COLORS[colorIndex];
    });
    setTempLevels(newLevels);
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
    setTempLevels([...DEFAULT_RISK_LEVELS]);
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
      <PopoverContent className="w-80 p-4" align="end">
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
                
                {/* 라벨 입력 */}
                <Input
                  value={level.label}
                  onChange={(e) => handleLabelChange(idx, e.target.value)}
                  className="w-16 h-7 text-xs px-2"
                  placeholder="라벨"
                />
                
                {/* Min 입력 */}
                <Input
                  type="number"
                  value={level.min}
                  onChange={(e) => handleMinChange(idx, e.target.value)}
                  className="w-14 h-7 text-xs px-2 text-center tabular-nums"
                  min={0}
                  max={100}
                  disabled={idx === 0}
                />
                
                <span className="text-xs text-muted-foreground">~</span>
                
                {/* Max 입력 */}
                <Input
                  type="number"
                  value={level.max}
                  onChange={(e) => handleMaxChange(idx, e.target.value)}
                  className="w-14 h-7 text-xs px-2 text-center tabular-nums"
                  min={0}
                  max={100}
                  disabled={idx === tempLevels.length - 1}
                />
                
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
