import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleUnitIds } from '@/lib/rbac';
import { ARMY_UNITS, UNIT_LOCATIONS } from '@/data/armyUnits';

// 발생사고 현황 데이터 (부대별) - forecastData와 동일한 분류 체계 사용
// 군기사고: 폭행, 성범죄, 음주운전
// 안전사고: 교통사고, 화재사고, 추락/충격, 한랭질환
// 군무이탈
const ALL_ACCIDENTS = [
  // 군기사고
  { type: '폭행사고', category: '군기사고', unitId: 'corps-1-div-1', count: 3 },
  { type: '폭행사고', category: '군기사고', unitId: 'corps-1-div-9', count: 5 },
  { type: '폭행사고', category: '군기사고', unitId: 'corps-7-div-8', count: 4 },
  { type: '성범죄', category: '군기사고', unitId: 'corps-1-div-25', count: 3 },
  { type: '성범죄', category: '군기사고', unitId: 'corps-7-div-mech-cap', count: 2 },
  { type: '음주운전', category: '군기사고', unitId: 'corps-1-div-1', count: 2 },
  { type: '음주운전', category: '군기사고', unitId: 'soc-2-div-31', count: 4 },
  // 안전사고
  { type: '교통사고', category: '안전사고', unitId: 'corps-3-div-3', count: 4 },
  { type: '교통사고', category: '안전사고', unitId: 'corps-2-div-7', count: 3 },
  { type: '교통사고', category: '안전사고', unitId: 'corps-1-div-1', count: 2 },
  { type: '화재사고', category: '안전사고', unitId: 'corps-1-div-1-bde-1', count: 1 },
  { type: '추락/충격', category: '안전사고', unitId: 'corps-7-div-mech-8', count: 2 },
  { type: '한랭질환', category: '안전사고', unitId: 'corps-7-div-22', count: 3 },
  { type: '한랭질환', category: '안전사고', unitId: 'corps-5-div-5', count: 2 },
  // 군무이탈
  { type: '군무이탈', category: '군무이탈', unitId: 'corps-2-div-15', count: 1 },
  { type: '군무이탈', category: '군무이탈', unitId: 'corps-1-div-9', count: 1 },
];

// 예측 위험 요인 데이터 (도넛 차트) - forecastData와 연계된 요인
// 동절기 특성 반영 (한랭, 빙판, 실내 밀집 등)
const riskFactorData = [
  { name: '한랭 환경', value: 32, color: '#60A5FA' },
  { name: '근무 피로', value: 28, color: '#F97316' },
  { name: '대인 갈등', value: 20, color: '#A78BFA' },
  { name: '도로 결빙', value: 12, color: '#34D399' },
  { name: '기타', value: 8, color: '#94A3B8' },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(220 10% 20%)',
  border: '1px solid hsl(220 10% 30%)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#ffffff',
  padding: '8px 12px',
};

export function TrendAnalysisPanel() {
  const { user } = useAuth();

  // 역할 기반 필터링된 데이터
  const { accidentData, dangerousUnitCount, totalUnitCount, averageRiskScore } = useMemo(() => {
    const accessibleIds = new Set(getAccessibleUnitIds(user?.role, user?.unitId));
    
    // 접근 가능한 부대의 사고만 필터링
    const filteredAccidents = ALL_ACCIDENTS.filter(a => accessibleIds.has(a.unitId));
    
    // 사고 유형별 합계
    const accidentMap = new Map<string, number>();
    filteredAccidents.forEach(a => {
      accidentMap.set(a.type, (accidentMap.get(a.type) || 0) + a.count);
    });
    
    const accidentData = Array.from(accidentMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // 접근 가능한 부대 수
    const accessibleUnits = ARMY_UNITS.filter(u => accessibleIds.has(u.id));
    const totalUnitCount = accessibleUnits.length;
    
    // 위험 부대 수 (risk >= 60)
    const dangerousUnitCount = accessibleUnits.filter(u => {
      const loc = UNIT_LOCATIONS[u.id];
      return loc && loc.risk >= 60;
    }).length;
    
    // 위험도 평균
    const riskyUnits = accessibleUnits
      .map(u => UNIT_LOCATIONS[u.id]?.risk)
      .filter((r): r is number => r !== undefined);
    const averageRiskScore = riskyUnits.length > 0 
      ? Math.round((riskyUnits.reduce((a, b) => a + b, 0) / riskyUnits.length) * 10) / 10
      : 0;
    
    return { accidentData, dangerousUnitCount, totalUnitCount, averageRiskScore };
  }, [user?.role, user?.unitId]);
  
  // 상위 발생사고
  const topAccident = accidentData[0] || { type: '없음', count: 0 };

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
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="mb-1">
              <span className="text-xs font-semibold text-foreground">위험부대</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-status-error tracking-tight">{dangerousUnitCount}</span>
              <span className="text-sm text-muted-foreground">/ {totalUnitCount} 부대</span>
            </div>
          </div>
          
          {/* 위험도 평균 */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="mb-1">
              <span className="text-xs font-semibold text-foreground">위험도 평균</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold tracking-tight ${getRiskScoreColor(averageRiskScore)}`}>{averageRiskScore}</span>
              <span className="text-sm text-muted-foreground">점</span>
            </div>
          </div>
          
          {/* 발생사고 상위 */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="mb-1">
              <span className="text-xs font-semibold text-foreground">발생사고 상위</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-status-warning tracking-tight">{topAccident.type}</span>
              <span className="text-sm text-muted-foreground">{topAccident.count}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 2컬럼 */}
      <div className="flex-1 overflow-hidden flex gap-8 px-5 pb-5">
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
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 - 발생사고 현황 바 차트 */}
        <div className="w-1/2 flex flex-col min-h-0">
          <h4 className="text-sm font-semibold text-foreground mb-4">발생사고 현황</h4>
          <div className="flex-1 min-h-0" style={{ minHeight: `${accidentData.length * 28 + 40}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accidentData} layout="vertical" barCategoryGap="12%" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
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
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
