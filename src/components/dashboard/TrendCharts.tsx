import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// 최근 7일 위험도 추이 데이터
const riskTrendData = [
  { date: '12/08', risk: 42 },
  { date: '12/09', risk: 45 },
  { date: '12/10', risk: 38 },
  { date: '12/11', risk: 52 },
  { date: '12/12', risk: 48 },
  { date: '12/13', risk: 55 },
  { date: '12/14', risk: 51 },
];

// 시간대별 위험도 데이터
const hourlyRiskData = [
  { hour: '00', risk: 15 },
  { hour: '04', risk: 12 },
  { hour: '08', risk: 45 },
  { hour: '10', risk: 68 },
  { hour: '12', risk: 42 },
  { hour: '14', risk: 72 },
  { hour: '16', risk: 58 },
  { hour: '18', risk: 35 },
  { hour: '20', risk: 22 },
  { hour: '22', risk: 18 },
];

// 요일별 위험도 패턴
const weeklyPatternData = [
  { day: '월', risk: 52 },
  { day: '화', risk: 68 },
  { day: '수', risk: 75 },
  { day: '목', risk: 62 },
  { day: '금', risk: 48 },
  { day: '토', risk: 25 },
  { day: '일', risk: 18 },
];

// 훈련 유형별 위험도
const trainingTypeData = [
  { type: '사격', risk: 78 },
  { type: '행군', risk: 65 },
  { type: '전술', risk: 58 },
  { type: '체력', risk: 32 },
];

// 사고 유형별 분포 데이터
const accidentTypeData = [
  { name: '훈련', value: 35, color: 'hsl(0, 72%, 51%)' },
  { name: '안전', value: 28, color: 'hsl(38, 92%, 50%)' },
  { name: '장비', value: 20, color: 'hsl(210, 75%, 55%)' },
  { name: '기타', value: 17, color: 'hsl(220, 10%, 50%)' },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(220, 13%, 12%)',
  border: '1px solid hsl(220, 10%, 20%)',
  borderRadius: '4px',
  fontSize: '11px',
  color: 'hsl(0, 0%, 90%)'
};

export function TrendCharts() {
  return (
    <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 위험도 추이 그래프 */}
      <div className="bg-card rounded border border-border p-3">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">위험도 추이 (7일)</h4>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210, 75%, 55%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(210, 75%, 55%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={chartTooltipStyle}
                formatter={(value: number) => [`${value}%`, '위험도']}
              />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke="hsl(210, 75%, 55%)" 
                fill="url(#riskGradient)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 위험도 */}
      <div className="bg-card rounded border border-border p-3">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">시간대별 위험도</h4>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyRiskData}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={chartTooltipStyle}
                formatter={(value: number) => [`${value}%`, '위험도']}
                labelFormatter={(label) => `${label}시`}
              />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="hsl(0, 72%, 51%)" 
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 요일별 패턴 */}
      <div className="bg-card rounded border border-border p-3">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">요일별 패턴</h4>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyPatternData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={chartTooltipStyle}
                formatter={(value: number) => [`${value}%`, '위험도']}
              />
              <Bar 
                dataKey="risk" 
                fill="hsl(210, 75%, 55%)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 사고 유형별 분포 */}
      <div className="bg-card rounded border border-border p-3">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">사고 유형 분포</h4>
        <div className="h-24 flex items-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accidentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {accidentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [`${value}%`, '비율']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-1">
            {accidentTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium tabular-nums">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}