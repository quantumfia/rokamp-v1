import { cn } from '@/lib/utils';

interface RiskLevelGaugeProps {
  level: 1 | 2 | 3 | 4 | 5; // I, II, III, IV, V
  label: string;
}

const LEVEL_CONFIG = {
  1: { roman: 'I', color: 'hsl(142, 76%, 36%)', bgColor: 'hsl(142, 76%, 90%)' },
  2: { roman: 'II', color: 'hsl(142, 50%, 45%)', bgColor: 'hsl(142, 50%, 90%)' },
  3: { roman: 'III', color: 'hsl(48, 96%, 50%)', bgColor: 'hsl(48, 96%, 90%)' },
  4: { roman: 'IV', color: 'hsl(25, 95%, 53%)', bgColor: 'hsl(25, 95%, 90%)' },
  5: { roman: 'V', color: 'hsl(0, 84%, 60%)', bgColor: 'hsl(0, 84%, 90%)' },
};

export function RiskLevelGauge({ level, label }: RiskLevelGaugeProps) {
  const config = LEVEL_CONFIG[level];
  
  // 5단계를 반원 아크로 표현 (180도를 5등분)
  const segmentAngle = 180 / 5;
  const needleAngle = -90 + (level - 0.5) * segmentAngle; // -90도부터 시작
  
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* 라벨 */}
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      
      {/* 반원 게이지 */}
      <div className="relative w-20 h-11">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* 5개의 세그먼트 */}
          {[1, 2, 3, 4, 5].map((seg) => {
            const startAngle = 180 - (seg - 1) * segmentAngle;
            const endAngle = 180 - seg * segmentAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 - 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 - 40 * Math.sin(endRad);
            
            const segConfig = LEVEL_CONFIG[seg as 1 | 2 | 3 | 4 | 5];
            const isActive = seg <= level;
            
            return (
              <path
                key={seg}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 0 0 ${x2} ${y2} Z`}
                fill={isActive ? segConfig.color : 'hsl(220, 10%, 85%)'}
                stroke="white"
                strokeWidth="1"
                opacity={isActive ? 1 : 0.4}
              />
            );
          })}
          
          {/* 중앙 원 */}
          <circle cx="50" cy="50" r="12" fill="white" stroke="hsl(220, 10%, 80%)" strokeWidth="1" />
          
          {/* 레벨 텍스트 */}
          <text
            x="50"
            y="53"
            textAnchor="middle"
            className="text-[14px] font-bold"
            fill={config.color}
          >
            {config.roman}
          </text>
        </svg>
      </div>
    </div>
  );
}

export function RiskLevelPanel() {
  return (
    <div className="flex items-center justify-center gap-6 px-5 h-[78px] w-64">
      <RiskLevelGauge level={4} label="실제상황" />
      <RiskLevelGauge level={5} label="훈련상황" />
    </div>
  );
}
