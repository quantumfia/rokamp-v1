import { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3단계 고정 위험도 설정
interface RiskLevel {
  min: number;
  max: number;
  color: string;
  label: string;
}

// 3단계 색상 (초록 → 노랑 → 빨강)
const COLORS = [
  'hsl(142, 76%, 36%)', // 초록 - 안전
  'hsl(48, 96%, 50%)',  // 노랑 - 주의
  'hsl(0, 84%, 60%)',   // 빨강 - 위험
];

const LABELS = ['안전', '주의', '위험'];

const DEFAULT_RISK_LEVELS: RiskLevel[] = [
  { min: 0, max: 29, color: COLORS[0], label: LABELS[0] },
  { min: 30, max: 59, color: COLORS[1], label: LABELS[1] },
  { min: 60, max: 100, color: COLORS[2], label: LABELS[2] },
];

// 위험도 설정 전역 상태
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
}

export function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const { getLevelForScore } = useRiskLevels();
  const currentLevel = getLevelForScore(score);
  
  const progress = score / 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - progress * circumference;
  
  return (
    <div className="relative w-14 h-14">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          strokeWidth="10"
          stroke="hsl(220, 10%, 90%)"
        />
        {/* 진행 원 */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          strokeWidth="10"
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
          className="text-base font-bold tabular-nums leading-none"
          style={{ color: currentLevel.color }}
        >
          {Math.round(score)}
        </span>
        <span 
          className="text-[8px] font-medium mt-0.5"
          style={{ color: currentLevel.color }}
        >
          {currentLevel.label}
        </span>
      </div>
    </div>
  );
}

// 위험도 설정 팝오버 (3단계 고정, 범위만 조절)
function RiskSettingsPopover() {
  const { levels, setLevels } = useRiskLevels();
  const [tempLevels, setTempLevels] = useState<RiskLevel[]>(levels);
  const [isOpen, setIsOpen] = useState(false);
  
  // max 변경 시 후속 단계들도 연쇄 조정
  const handleMaxChange = (index: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const newLevels = [...tempLevels];
    const currentLevel = newLevels[index];
    
    // max는 현재 min 이상, 다음 단계 공간 확보
    let newMax = Math.max(currentLevel.min, Math.min(98, numValue));
    
    newLevels[index] = { ...currentLevel, max: newMax };
    
    // 후속 단계들 연쇄 조정
    for (let i = index + 1; i < newLevels.length; i++) {
      const prevMax = newLevels[i - 1].max;
      const newMin = prevMax + 1;
      
      newLevels[i] = { ...newLevels[i], min: newMin };
      
      if (i < newLevels.length - 1 && newLevels[i].max < newMin) {
        newLevels[i] = { ...newLevels[i], max: newMin };
      }
    }
    
    // 마지막 단계는 항상 100
    newLevels[newLevels.length - 1] = { ...newLevels[newLevels.length - 1], max: 100 };
    
    setTempLevels(newLevels);
  };
  
  const handleApply = () => {
    setLevels(tempLevels);
    setIsOpen(false);
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
          <Settings2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">위험도 단계 설정</h4>
          
          {/* 3단계 설정 */}
          <div className="space-y-2">
            {tempLevels.map((level, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                {/* 색상 표시 */}
                <div 
                  className="w-3 h-6 rounded-sm shrink-0" 
                  style={{ backgroundColor: level.color }} 
                />
                
                {/* 라벨 */}
                <span className="w-10 text-xs font-medium shrink-0">{level.label}</span>
                
                {/* Min (읽기 전용) */}
                <span className="w-8 h-6 text-xs text-center tabular-nums flex items-center justify-center bg-muted/50 rounded text-muted-foreground">
                  {level.min}
                </span>
                
                <span className="text-xs text-muted-foreground">~</span>
                
                {/* Max */}
                {idx === tempLevels.length - 1 ? (
                  <span className="w-8 h-6 text-xs text-center tabular-nums flex items-center justify-center bg-muted/50 rounded text-muted-foreground">
                    100
                  </span>
                ) : (
                  <Input
                    type="number"
                    value={level.max}
                    onChange={(e) => handleMaxChange(idx, e.target.value)}
                    className="w-12 h-6 text-xs px-1 text-center tabular-nums"
                    min={level.min}
                    max={98}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* 버튼들 */}
          <div className="flex gap-2">
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

// 오늘의 안전사고 예보와 연동된 위험도
export function RiskLevelPanel() {
  const averageRiskScore = 67.3;
  
  return (
    <div className="relative flex flex-col items-center justify-center h-[78px] w-40 px-3">
      {/* 상단: 라벨 */}
      <span className="text-[10px] font-medium text-muted-foreground mb-1">사건/사고 위험도</span>
      {/* 중앙: 게이지 */}
      <RiskScoreGauge score={averageRiskScore} />
      {/* 우측 하단: 설정 아이콘 */}
      <div className="absolute bottom-1 right-1">
        <RiskSettingsPopover />
      </div>
    </div>
  );
}
