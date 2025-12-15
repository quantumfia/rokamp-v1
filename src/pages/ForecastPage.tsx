import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ForecastSkeleton } from '@/components/skeletons';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { getUnitById, hasChildren } from '@/data/armyUnits';
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

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // 부대별 주간 예보 기본 목데이터 (모든 부대에 동일하게 적용)
  const DEFAULT_UNIT_FORECAST = {
    days: [28, 42, 55, 48, 38, 22, 18],
    events: ['체력단련', '사격훈련', '야외훈련', '정비점검', '안전교육', '휴일', '휴일']
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ForecastSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-border pb-4">
        <h1 className="text-lg font-semibold text-foreground">예보 분석</h1>
        <p className="text-sm text-muted-foreground mt-1">부대별 위험도 예보 및 사고 경향 분석</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-6 border-b border-border">
        {[
          { id: 'weekly', label: '주간 예보' },
          { id: 'trends', label: '경향 분석' },
          { id: 'prevention', label: '예방 활동' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 주간 예보 탭 */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* 주간 종합 위험도 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">주간 종합 위험도</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {[
                      { date: '12/21', day: '일' },
                      { date: '12/22', day: '월' },
                      { date: '12/23', day: '화' },
                      { date: '12/24', day: '수' },
                      { date: '12/25', day: '목' },
                      { date: '12/26', day: '금' },
                      { date: '12/27', day: '토' },
                    ].map((item) => (
                      <th key={item.date} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {item.date}({item.day})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[18, 45, 52, 78, 55, 42, 25].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[18, 45, 52, 78, 55, 42, 25].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 사고 유형별 주간 예측 위험도 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">사고 유형별 주간 위험 지수</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {['차량 사고', '훈련 부상', '시설 안전', '장비 사고'].map((type) => (
                      <th key={type} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[72, 45, 28, 35].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[72, 45, 28, 35].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 계급별 주간 위험 지수 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">계급별 주간 위험 지수</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {['병사', '부사관', '위관', '영관', '장관'].map((rank) => (
                      <th key={rank} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {rank}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[58, 35, 22, 12, 5].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[58, 35, 22, 12, 5].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 부대별 주간 예보 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">부대별 주간 위험도 예보</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>

            {/* 부대 선택 */}
            <div className="mb-4">
              <UnitCascadeSelect
                value={selectedUnitId}
                onChange={setSelectedUnitId}
                placeholder="부대 선택"
                showFullPath={true}
              />
            </div>

            {/* 주간 예보 테이블 */}
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">구분</th>
                    {[
                      { date: '12/21', day: '일' },
                      { date: '12/22', day: '월' },
                      { date: '12/23', day: '화' },
                      { date: '12/24', day: '수' },
                      { date: '12/25', day: '목' },
                      { date: '12/26', day: '금' },
                      { date: '12/27', day: '토' },
                    ].map((item) => (
                      <th key={item.date} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {item.date}({item.day})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.days 
                      : [null, null, null, null, null, null, null]
                    ).map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">
                          {risk !== null ? `${risk}%` : '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="border-b border-border bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.days 
                      : [null, null, null, null, null, null, null]
                    ).map((risk, index) => {
                      if (risk === null) {
                        return (
                          <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                            <span className="text-xs text-muted-foreground">-</span>
                          </td>
                        );
                      }
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                  {/* 사건사고 예측 */}
                  <tr>
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">비고</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.events 
                      : [null, null, null, null, null, null, null]
                    ).map((event, index) => (
                      <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                        <span className="text-[10px] text-muted-foreground">
                          {event || '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {!selectedUnitId && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                상단에서 부대를 선택하면 해당 부대의 주간 위험도 예보가 표시됩니다
              </p>
            )}
            
            {selectedUnitId && hasChildren(selectedUnitId) && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                최하위 부대를 선택하면 해당 부대의 주간 위험도 예보가 표시됩니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* 경향 분석 탭 */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">작년 동기 대비</p>
              <p className="text-2xl font-semibold text-foreground mt-1">-12%</p>
              <p className="text-xs text-muted-foreground">전체 사고 감소</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">차량 사고</p>
              <p className="text-2xl font-semibold text-foreground mt-1">+20%</p>
              <p className="text-xs text-muted-foreground">동절기 증가 추세</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">훈련 부상</p>
              <p className="text-2xl font-semibold text-foreground mt-1">-8%</p>
              <p className="text-xs text-muted-foreground">안전교육 효과</p>
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
                      stroke="hsl(var(--foreground))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--foreground))', r: 3 }}
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
                        {TYPE_DISTRIBUTION.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? 'hsl(var(--foreground))' : `hsl(var(--muted-foreground) / ${1 - index * 0.2})`} 
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {TYPE_DISTRIBUTION.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium tabular-nums">{item.value}%</span>
                    </div>
                  ))}
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
                    fill="hsl(var(--muted-foreground))"
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

      {/* 예방 활동 탭 */}
      {activeTab === 'prevention' && (
        <div className="space-y-6">
          {/* AI 생성 체크리스트 */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-3">AI 맞춤형 예방 체크리스트</h2>
            <div className="divide-y divide-border">
              {[
                { task: '차량 일일 점검 실시 (동절기 배터리/부동액)', completed: true, priority: 'high' },
                { task: '동절기 안전교육 시행 (저체온증 예방)', completed: true, priority: 'high' },
                { task: '훈련장 안전시설 점검 (결빙 구간 표시)', completed: false, priority: 'high' },
                { task: '비상연락망 확인 및 업데이트', completed: false, priority: 'medium' },
                { task: '응급처치 장비 점검 (AED, 구급함)', completed: true, priority: 'medium' },
                { task: '야간 훈련 조명 장비 점검', completed: false, priority: 'low' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
                      item.completed ? 'bg-foreground border-foreground' : 'border-border'
                    }`}>
                      {item.completed && (
                        <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}>
                      {item.task}
                    </span>
                  </div>
                  {!item.completed && item.priority === 'high' && (
                    <span className="text-xs text-muted-foreground">긴급</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 교육 자료 링크 */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-3">관련 교육 자료</h2>
            <div className="divide-y divide-border">
              {[
                { title: '동절기 차량 안전운행 매뉴얼', pages: 24 },
                { title: '저체온증 예방 및 응급처치', pages: 12 },
                { title: '동계 훈련장 안전관리 지침', pages: 18 },
                { title: '결빙 도로 사고 예방 가이드', pages: 8 },
              ].map((doc, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between w-full py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <span className="text-sm">{doc.title}</span>
                  <span className="text-xs text-muted-foreground">{doc.pages}페이지</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ※ 보안 위배 소지가 있는 실제 사고 사례는 노출되지 않습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
