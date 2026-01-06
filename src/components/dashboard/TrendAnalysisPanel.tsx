import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// 발생사고 현황 데이터
const accidentData = [
  { type: '폭행 사고', count: 15 },
  { type: '경제 범죄', count: 11 },
  { type: '성 범죄', count: 8 },
  { type: '음주 운전', count: 6 },
  { type: '대 상관', count: 4 },
];

// 예측 위험 요인 데이터 (도넛 차트) - 중간 채도 파랑 계열 그라데이션
const riskFactorData = [
  { name: '훈련 강도', value: 32, color: '#6b8cae' },  // 밝은 스틸 블루
  { name: '근무 피로', value: 28, color: '#527394' },  // 스틸 블루
  { name: '대인 갈등', value: 20, color: '#3d5a7a' },  // 진한 스틸 블루
  { name: '환경 요인', value: 12, color: '#2a4260' },  // 어두운 스틸 블루
  { name: '기타', value: 8, color: '#1a2c45' },        // 매우 어두운 스틸 블루
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
  
  // 위험도 평균
  const averageRiskScore = 67.3;
  
  // 상위 발생사고
  const topAccident = accidentData[0];

  // 위험도 점수에 따른 색상 반환
  const getRiskScoreColor = (score: number) => {
    if (score >= 60) return 'text-status-error';
    if (score >= 30) return 'text-status-warning';
    return 'text-status-success';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="shrink-0 px-5 py-3">
        <h3 className="text-base font-bold text-foreground">오늘의 안전사고 예보</h3>
      </div>

      {/* 상단 요약 바 - 3개 핵심 지표 */}
      <div className="shrink-0 px-5 pb-4">
        <div className="grid grid-cols-3 gap-4">
          {/* 위험부대 */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="mb-2">
              <span className="text-sm font-bold text-foreground">위험부대</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-status-error tracking-tight">{dangerousUnitCount}</span>
              <span className="text-base text-muted-foreground">/ {totalUnitCount} 부대</span>
            </div>
          </div>
          
          {/* 위험도 평균 */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="mb-2">
              <span className="text-sm font-bold text-foreground">위험도 평균</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold tracking-tight ${getRiskScoreColor(averageRiskScore)}`}>{averageRiskScore}</span>
              <span className="text-base text-muted-foreground">점</span>
            </div>
          </div>
          
          {/* 발생사고 상위 */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="mb-2">
              <span className="text-sm font-bold text-foreground">발생사고 상위</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-status-warning tracking-tight">{topAccident.type}</span>
              <span className="text-base text-muted-foreground">{topAccident.count}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 2컬럼 */}
      <div className="flex-1 overflow-hidden flex gap-4 px-5 pb-5">
        {/* 좌측 - 예측 위험 요인 도넛 차트 */}
        <div className="w-1/2 flex flex-col min-h-0">
          <h4 className="text-sm font-semibold text-foreground mb-4">예측 위험 요인</h4>
          <div className="flex-1 min-h-0 flex items-center">
            {/* 도넛 차트 */}
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskFactorData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskFactorData.map((entry, index) => (
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
              {riskFactorData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm" style={{ color: item.color }}>{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 - 발생사고 현황 바 차트 */}
        <div className="w-1/2 flex flex-col min-h-0">
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
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} 
                  axisLine={false} 
                  tickLine={false}
                  width={80}
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
      </div>
    </div>
  );
}
