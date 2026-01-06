import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Users, Shield } from 'lucide-react';

// 발생사고 현황 데이터
const accidentData = [
  { type: '폭행 사고', count: 15 },
  { type: '경제 범죄', count: 11 },
  { type: '성 범죄', count: 8 },
  { type: '음주 운전', count: 6 },
  { type: '대 상관', count: 4 },
];

// 신분별 사고 현황 (도넛 차트)
const statusAccidentData = [
  { name: '부사관', value: 35, color: 'hsl(var(--chart-1))' },
  { name: '병', value: 28, color: 'hsl(var(--chart-2))' },
  { name: '장교', value: 18, color: 'hsl(var(--chart-3))' },
  { name: '군무원', value: 12, color: 'hsl(var(--chart-4))' },
  { name: '기타', value: 7, color: 'hsl(var(--chart-5))' },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
  padding: '8px 12px',
};

export function TrendAnalysisPanel() {
  // 위험부대 수
  const dangerousUnitCount = 12;
  const totalUnitCount = 275;
  
  // 상위 발생사고
  const topAccident = accidentData[0];
  
  // 상위 신분
  const topStatus = statusAccidentData[0];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="shrink-0 px-5 py-3 border-b border-border">
        <h3 className="text-base font-bold text-foreground">오늘의 안전사고 예보</h3>
      </div>

      {/* 상단 요약 바 - 3개 핵심 지표 */}
      <div className="shrink-0 border-b border-border">
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* 위험부대 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-status-error animate-pulse" />
              <span className="text-sm text-muted-foreground">위험부대</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-status-error tracking-tight">{dangerousUnitCount}</span>
              <span className="text-base text-muted-foreground">/ {totalUnitCount} 부대</span>
            </div>
          </div>
          
          {/* 발생사고 상위 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              <span className="text-sm text-muted-foreground">발생사고 상위</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-status-warning tracking-tight">{topAccident.type}</span>
              <span className="text-base text-muted-foreground">{topAccident.count}건</span>
            </div>
          </div>
          
          {/* 신분별 분포 상위 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">신분별 분포</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary tracking-tight">{topStatus.name}</span>
              <span className="text-base text-muted-foreground">{topStatus.value}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 2컬럼 */}
      <div className="flex-1 overflow-hidden flex divide-x divide-border">
        {/* 좌측 - 발생사고 현황 바 차트 */}
        <div className="w-1/2 p-5 flex flex-col min-h-0">
          <h4 className="text-sm font-semibold text-foreground mb-4">발생사고 현황</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accidentData} layout="vertical" barCategoryGap="20%">
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={[0, 'auto']}
                />
                <YAxis 
                  type="category" 
                  dataKey="type" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                  axisLine={false} 
                  tickLine={false}
                  width={70}
                />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [`${value}건`, '발생']}
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--status-warning))"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 우측 - 신분별 사고 현황 도넛 차트 */}
        <div className="w-1/2 p-5 flex flex-col min-h-0">
          <h4 className="text-sm font-semibold text-foreground mb-4">신분별 사고 현황</h4>
          <div className="flex-1 min-h-0 flex items-center">
            {/* 도넛 차트 */}
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusAccidentData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusAccidentData.map((entry, index) => (
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
            
            {/* 범례 */}
            <div className="w-1/2 space-y-2.5 pl-2">
              {statusAccidentData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
