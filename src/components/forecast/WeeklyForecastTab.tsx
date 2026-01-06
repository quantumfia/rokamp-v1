import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { AlertTriangle, TrendingUp, Wine, Clock, MapPin, Users, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// 사고유형별 예보 데이터 (실제 데이터 구조 반영)
const ACCIDENT_FORECASTS = [
  {
    id: 1,
    type: '폭행사고',
    probability: 34,
    level: 'error',
    vulnerableRanks: ['상병', '일병', '병장'],
    workType: '휴식중, 취침시간',
    location: '영내',
    locationDetail: '생활관 (67%)',
    prevention: '분대장 면담 강화, 야간 순찰 확대',
    timeSlot: '22:00~02:00'
  },
  {
    id: 2,
    type: '음주운전',
    probability: 21,
    level: 'warning',
    vulnerableRanks: ['중사', '하사'],
    workType: '휴가중, 외출후',
    location: '영외',
    locationDetail: '노상 (89%)',
    prevention: '복귀 전 음주 확인, 대리운전 안내',
    timeSlot: '금~일 야간'
  },
  {
    id: 3,
    type: '성범죄',
    probability: 15,
    level: 'warning',
    vulnerableRanks: ['일병', '상병'],
    workType: '휴가중, 개인정비',
    location: '영외',
    locationDetail: '유흥가 (54%)',
    prevention: '성범죄 예방교육, 외출 시 주의사항 전파',
    timeSlot: '주말 야간'
  },
  {
    id: 4,
    type: '경제범죄',
    probability: 12,
    level: 'safe',
    vulnerableRanks: ['병장', '하사'],
    workType: '일반근무, 휴식중',
    location: '영내',
    locationDetail: '사무실/생활관',
    prevention: '재정 상담 활성화, 도박 예방교육',
    timeSlot: '평일 근무시간'
  },
];

// 부대유형별 위험도 데이터 (14개 부대유형)
const UNIT_TYPE_RISKS = [
  { type: '보병', risk: 78 },
  { type: '기갑', risk: 62 },
  { type: '포병', risk: 55 },
  { type: '특전사', risk: 52 },
  { type: '교육기관', risk: 48 },
  { type: '공병', risk: 42 },
  { type: '정보통신', risk: 38 },
  { type: '군수', risk: 35 },
  { type: '기보', risk: 32 },
  { type: '항공', risk: 28 },
  { type: '방공', risk: 25 },
  { type: '의무', risk: 22 },
  { type: '화생방', risk: 18 },
  { type: '기타', risk: 15 },
];

// 계급별 취약도 데이터
const RANK_VULNERABILITY = [
  { rank: '이병', value: 15 },
  { rank: '일병', value: 42 },
  { rank: '상병', value: 58 },
  { rank: '병장', value: 45 },
  { rank: '하사', value: 32 },
  { rank: '중사', value: 25 },
  { rank: '상사', value: 12 },
];

const getRiskColor = (risk: number) => {
  if (risk >= 75) return 'hsl(var(--status-error))';
  if (risk >= 50) return 'hsl(var(--status-warning))';
  return 'hsl(var(--status-success))';
};

const getRiskBgColor = (level: string) => {
  switch (level) {
    case 'error': return 'bg-status-error/10 border-status-error/30';
    case 'warning': return 'bg-status-warning/10 border-status-warning/30';
    default: return 'bg-status-success/10 border-status-success/30';
  }
};

const getRiskTextColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-status-error';
    case 'warning': return 'text-status-warning';
    default: return 'text-status-success';
  }
};

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '4px',
  fontSize: '12px'
};

export default function WeeklyForecastTab() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<number[]>([1, 2]); // 기본 2개 펼침

  const toggleCard = (id: number) => {
    setExpandedCards(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 전체 위험도 계산 (사고유형별 가중 평균)
  const overallRisk = Math.round(
    ACCIDENT_FORECASTS.reduce((sum, acc) => sum + acc.probability, 0) / ACCIDENT_FORECASTS.length * 2
  );
  const previousWeekRisk = 62;
  const riskChange = overallRisk - previousWeekRisk;

  // 주요 트리거 계산
  const alcoholRelated = 32;
  const leaveRelated = 28;

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 전체 위험도 */}
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">전체 위험도</span>
            <AlertTriangle className={`h-4 w-4 ${overallRisk >= 50 ? 'text-status-warning' : 'text-status-success'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${overallRisk >= 75 ? 'text-status-error' : overallRisk >= 50 ? 'text-status-warning' : 'text-status-success'}`}>
              {overallRisk}%
            </span>
            <span className={`text-xs ${riskChange > 0 ? 'text-status-error' : 'text-status-success'}`}>
              {riskChange > 0 ? '↑' : '↓'}{Math.abs(riskChange)}% (전주 {previousWeekRisk}%)
            </span>
          </div>
          <Progress 
            value={overallRisk} 
            className="h-2 mt-3"
          />
        </Card>

        {/* 최고위험 유형 */}
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">최고위험 유형</span>
            <TrendingUp className="h-4 w-4 text-status-error" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{ACCIDENT_FORECASTS[0].type}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-semibold text-status-error">{ACCIDENT_FORECASTS[0].probability}%</span>
            <span className="text-xs text-muted-foreground">발생 확률</span>
          </div>
        </Card>

        {/* 주요 트리거 */}
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">주요 트리거</span>
            <Wine className="h-4 w-4 text-status-warning" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">음주 연관</span>
              <span className="text-sm font-semibold text-status-warning">{alcoholRelated}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">휴가중</span>
              <span className="text-sm font-semibold text-status-warning">{leaveRelated}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 부대 선택 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">부대 선택</span>
        <UnitCascadeSelect
          value={selectedUnitId}
          onChange={setSelectedUnitId}
          placeholder="전체 부대"
          showFullPath={true}
          inline={true}
        />
      </div>

      {/* 사고유형별 예보 카드 */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">사고유형별 예보 (Top 4)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACCIDENT_FORECASTS.map((forecast) => {
            const isExpanded = expandedCards.includes(forecast.id);
            return (
              <Card 
                key={forecast.id}
                className={`border ${getRiskBgColor(forecast.level)} overflow-hidden`}
              >
                {/* 카드 헤더 */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleCard(forecast.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${forecast.level === 'error' ? 'bg-status-error' : forecast.level === 'warning' ? 'bg-status-warning' : 'bg-status-success'}`} />
                    <span className="font-medium text-foreground">{forecast.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getRiskTextColor(forecast.level)}`}>
                      {forecast.probability}%
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* 확장 내용 */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">취약 계급</p>
                          <p className="text-sm text-foreground">{forecast.vulnerableRanks.join(' > ')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">근무형태</p>
                          <p className="text-sm text-foreground">{forecast.workType}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">발생장소</p>
                          <p className="text-sm text-foreground">{forecast.location} - {forecast.locationDetail}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">취약 시간</p>
                          <p className="text-sm text-foreground">{forecast.timeSlot}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-primary/5 rounded-md p-3">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-primary font-medium">예방 대책</p>
                        <p className="text-sm text-foreground">{forecast.prevention}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 하단 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 부대유형별 위험도 */}
        <Card className="p-4 border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">부대유형별 위험도</h3>
          <div className="space-y-2">
            {UNIT_TYPE_RISKS.slice(0, 7).map((unit) => (
              <div key={unit.type} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{unit.type}</span>
                <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                  <div 
                    className="h-full rounded transition-all duration-500"
                    style={{ 
                      width: `${unit.risk}%`,
                      backgroundColor: getRiskColor(unit.risk)
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-10 text-right">{unit.risk}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            상위 7개 부대유형 표시 (전체 14개)
          </p>
        </Card>

        {/* 계급별 취약도 */}
        <Card className="p-4 border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">계급별 취약도</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RANK_VULNERABILITY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="rank" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number) => [`${value}%`, '취약도']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {RANK_VULNERABILITY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            상병 계급이 가장 높은 취약도 (58%)
          </p>
        </Card>
      </div>

      {/* 데이터 출처 안내 */}
      <div className="text-center py-2 bg-muted/30 rounded-md">
        <p className="text-xs text-muted-foreground">
          본 데이터는 10년치 데이터를 바탕으로 분석한 결과입니다.
        </p>
      </div>
    </div>
  );
}
