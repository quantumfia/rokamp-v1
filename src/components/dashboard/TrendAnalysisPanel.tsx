import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

// 주간 사고 유형별 발생 현황
const weeklyAccidentData = [
  { type: '훈련', count: 12 },
  { type: '차량', count: 8 },
  { type: '시설', count: 5 },
  { type: '기타', count: 7 },
];

// 사고 유형별 분포 (파이 차트)
const accidentTypeData = [
  { name: '가해자사고', value: 35, color: 'hsl(var(--chart-1))' },
  { name: '폭행사고', value: 28, color: 'hsl(var(--chart-2))' },
  { name: '훈련사고', value: 22, color: 'hsl(var(--chart-3))' },
  { name: '기타', value: 15, color: 'hsl(var(--chart-4))' },
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
  // 가장 많은 사고 유형 찾기
  const topAccident = weeklyAccidentData.reduce((max, item) => 
    item.count > max.count ? item : max, weeklyAccidentData[0]
  );
  const totalCount = weeklyAccidentData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-card">
      {/* Header - 더 크고 명확하게 */}
      <div className="shrink-0 px-5 py-3 border-b border-border">
        <h3 className="text-base font-bold text-foreground">오늘의 안전사고 예보</h3>
      </div>

      {/* Content - 2컬럼 레이아웃 */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Column - 핵심 숫자 + 바 차트 */}
        <div className="w-1/2 border-r border-border flex flex-col">
          {/* 주요 사고 유형 - 가장 많은 유형 강조 */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">주요 사고 유형</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary tracking-tight">{topAccident.type}</span>
              <span className="text-lg text-muted-foreground">{topAccident.count}건 / 총 {totalCount}건</span>
            </div>
          </div>

          {/* 바 차트 - 간결하게 */}
          <div className="flex-1 px-5 py-4 min-h-0">
            <h4 className="text-sm font-medium text-foreground mb-4">유형별 발생 현황</h4>
            <div className="h-[calc(100%-32px)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAccidentData} layout="vertical" barCategoryGap="20%">
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
                    tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} 
                    axisLine={false} 
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [`${value}건`, '발생']}
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - 파이 차트 + 경고 */}
        <div className="w-1/2 flex flex-col">
          {/* 파이 차트 영역 */}
          <div className="flex-1 px-5 py-4 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-foreground">사고 유형 분포</h4>
              <div className="flex items-center gap-1.5 text-xs text-status-warning font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12%</span>
              </div>
            </div>
            
            <div className="h-[calc(100%-32px)] flex items-center">
              {/* 파이 차트 */}
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accidentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="85%"
                      paddingAngle={3}
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
              
              {/* 범례 - 더 큰 글씨 */}
              <div className="w-1/2 space-y-3 pl-2">
                {accidentTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
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

          {/* 경고 메시지 - 더 눈에 띄게 */}
          <div className="shrink-0 mx-5 mb-4 flex items-center gap-3 bg-status-warning/10 border border-status-warning/30 rounded-lg px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />
            <p className="text-sm text-foreground">
              <span className="text-status-warning font-semibold">훈련 사고</span> 위험도 상승
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
