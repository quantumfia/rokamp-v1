import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ForecastSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import WeeklyForecastTab from '@/components/forecast/WeeklyForecastTab';

// 월별 사고 추세 데이터
const TREND_DATA = [
  { month: '7월', current: 12, previous: 15 },
  { month: '8월', current: 18, previous: 14 },
  { month: '9월', current: 15, previous: 16 },
  { month: '10월', current: 22, previous: 19 },
  { month: '11월', current: 19, previous: 21 },
  { month: '12월', current: 14, previous: 17 },
];

// 사고 유형별 분포 데이터
const TYPE_DISTRIBUTION = [
  { name: '차량 사고', value: 35 },
  { name: '훈련 부상', value: 28 },
  { name: '시설 안전', value: 22 },
  { name: '기타', value: 15 },
];

// 계급별 위험 지수 데이터
const RANK_RISK_DATA = [
  { rank: '병사', risk: 42 },
  { rank: '부사관', risk: 28 },
  { rank: '위관', risk: 18 },
  { rank: '영관', risk: 8 },
  { rank: '장관', risk: 4 },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '4px',
  fontSize: '12px'
};

const FORECAST_TABS = [
  { id: 'trends', label: '경향 분석' },
  { id: 'weekly', label: '주간 예보' },
];

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState('trends');
  const isLoading = usePageLoading(1000);



  if (isLoading) {
    return <ForecastSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="예보 분석" 
        description="부대별 위험도 예보 및 사고 경향 분석" 
      />

      <TabNavigation tabs={FORECAST_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* 주간 예보 탭 */}
      {activeTab === 'weekly' && <WeeklyForecastTab />}

      {/* 경향 분석 탭 */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">전체 사고 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-success mt-1">-12%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">차량 사고 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-error mt-1">+20%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">훈련 부상 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-success mt-1">-8%</p>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          <div className="grid grid-cols-2 gap-8">
            {/* 월별 사고 추세 */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">월별 사고 추세 (전년 대비)</h2>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      name="금년"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previous" 
                      name="전년"
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--muted-foreground))', r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 사고 유형별 분포 */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">사고 유형별 분포</h2>
              <div className="h-[220px] flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={TYPE_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {TYPE_DISTRIBUTION.map((_, index) => {
                          const colors = [
                            'hsl(var(--primary))',
                            'hsl(var(--status-warning))',
                            'hsl(var(--status-success))',
                            'hsl(var(--muted-foreground))'
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {TYPE_DISTRIBUTION.map((item, index) => {
                    const colors = [
                      'bg-primary',
                      'bg-status-warning',
                      'bg-status-success',
                      'bg-muted-foreground'
                    ];
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-sm ${colors[index]}`} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{item.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 계급별 위험 지수 */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-3">계급별 사고 비율</h2>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RANK_RISK_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 50]}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="rank" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [`${value}%`, '비율']}
                  />
                  <Bar 
                    dataKey="risk" 
                    fill="hsl(var(--primary))"
                    radius={[0, 2, 2, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ※ 자대 및 예하 부대 데이터만 통계 처리에 포함됩니다. 원본 데이터(RAW)는 접근이 제한됩니다.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
