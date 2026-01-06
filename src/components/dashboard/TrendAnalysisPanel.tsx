import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';

// 주간 사고 유형별 발생 현황
const weeklyAccidentData = [
  { type: '차량', count: 8 },
  { type: '훈련', count: 12 },
  { type: '시설', count: 5 },
  { type: '장비', count: 3 },
  { type: '기타', count: 4 },
];

// 사고 유형별 순위 변동 분석 (파이 차트)
const accidentTypeData = [
  { name: '가해자사고', value: 35, color: 'hsl(var(--chart-1))' },
  { name: '폭행사고', value: 28, color: 'hsl(var(--chart-2))' },
  { name: '훈련사고', value: 22, color: 'hsl(var(--chart-3))' },
  { name: '기타', value: 15, color: 'hsl(var(--chart-4))' },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '11px',
  color: 'hsl(var(--foreground))'
};

export function TrendAnalysisPanel() {
  // 주요사고 예보 건수
  const mainAccidentCount = 5;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">오늘 안전사고 예측 위험도 분석 추이</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Left: 주요사고 예보 + 주간 사고 유형별 발생 현황 */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* 주요사고 예보 카드 */}
            <div className="shrink-0 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">주간 사고 예보</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">오늘의 부대 안전예보</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-muted-foreground">주요사고 예보</span>
                <span className="text-3xl font-bold text-primary">{mainAccidentCount}</span>
                <span className="text-sm text-foreground">건</span>
              </div>
            </div>

            {/* 주간 사고 유형별 발생 현황 */}
            <div className="flex-1 min-h-0 bg-muted/30 rounded-lg border border-border p-4 flex flex-col">
              <h4 className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                주간 사고 유형별 발생 현황
              </h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAccidentData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} 
                      axisLine={false} 
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number) => [`${value}건`, '발생']}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: 사고 유형별 순위 변동 분석 */}
          <div className="bg-muted/30 rounded-lg border border-border p-4 flex flex-col min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                사고 유형별 순위 변동 분석
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-status-warning">
                <TrendingUp className="w-3 h-3" />
                <span>전월대비 +12%</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center">
              <div className="w-1/2 h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accidentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius="45%"
                      outerRadius="80%"
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
              <div className="w-1/2 space-y-2">
                {accidentTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-foreground">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 주의 메시지 */}
            <div className="shrink-0 mt-3 flex items-start gap-2 bg-status-warning/10 border border-status-warning/20 rounded p-2">
              <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground leading-relaxed">
                금일 <span className="text-status-warning font-medium">훈련 관련 사고</span> 위험도가 상승하였습니다. 
                야외 훈련 시 안전수칙 준수에 유의하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
