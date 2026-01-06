import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { AlertTriangle, TrendingUp, Wine, Clock, MapPin, Users, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// 사고유형별 예보 데이터 (실제 군 용어 체계 반영)
const ACCIDENT_FORECASTS = [
  // 군기사고
  {
    id: 1,
    category: '군기사고',
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
    category: '군기사고',
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
    category: '군기사고',
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
    category: '군기사고',
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
  {
    id: 5,
    category: '군기사고',
    type: '군무이탈',
    probability: 10,
    level: 'safe',
    vulnerableRanks: ['이병', '일병'],
    workType: '휴식중, 훈련중',
    location: '영내',
    locationDetail: '생활관/훈련장',
    prevention: '신병 관심병사 면담 강화',
    timeSlot: '주중 오후'
  },
  {
    id: 6,
    category: '군기사고',
    type: '불법도박',
    probability: 8,
    level: 'safe',
    vulnerableRanks: ['상병', '병장'],
    workType: '휴식중, 개인정비',
    location: '영내',
    locationDetail: '생활관',
    prevention: '불법도박 예방교육, 휴대폰 사용지도',
    timeSlot: '야간/주말'
  },
  {
    id: 7,
    category: '군기사고',
    type: '대상관',
    probability: 5,
    level: 'safe',
    vulnerableRanks: ['일병', '상병'],
    workType: '일반근무',
    location: '영내',
    locationDetail: '사무실/생활관',
    prevention: '상급자 리더십 교육, 소통 강화',
    timeSlot: '근무시간'
  },
  {
    id: 8,
    category: '군기사고',
    type: '자살사고',
    probability: 4,
    level: 'safe',
    vulnerableRanks: ['이병', '일병'],
    workType: '휴식중',
    location: '영내',
    locationDetail: '생활관/화장실',
    prevention: '관심병사 집중관리, 정신건강 상담',
    timeSlot: '야간/새벽'
  },
  {
    id: 9,
    category: '군기사고',
    type: '일반강력',
    probability: 3,
    level: 'safe',
    vulnerableRanks: ['상병', '병장'],
    workType: '외출/휴가중',
    location: '영외',
    locationDetail: '유흥가/노상',
    prevention: '외출/휴가 시 주의사항 교육',
    timeSlot: '야간'
  },
  // 안전사고
  {
    id: 10,
    category: '안전사고',
    type: '교통사고',
    probability: 18,
    level: 'warning',
    vulnerableRanks: ['중사', '상사', '하사'],
    workType: '출퇴근, 휴가이동',
    location: '영외',
    locationDetail: '도로 (92%)',
    prevention: '안전운전 교육, 장거리 이동 시 휴식',
    timeSlot: '금요일 오후, 일요일 저녁'
  },
  {
    id: 11,
    category: '안전사고',
    type: '추락충격',
    probability: 7,
    level: 'safe',
    vulnerableRanks: ['이병', '일병'],
    workType: '훈련중, 작업중',
    location: '영내',
    locationDetail: '훈련장/시설',
    prevention: '안전장구 착용 철저, 안전요원 배치',
    timeSlot: '훈련시간'
  },
  {
    id: 12,
    category: '안전사고',
    type: '화재사고',
    probability: 4,
    level: 'safe',
    vulnerableRanks: ['전 계급'],
    workType: '일반근무, 휴식중',
    location: '영내',
    locationDetail: '취사장/생활관',
    prevention: '화기취급 주의, 소화기 점검',
    timeSlot: '식사시간'
  },
  {
    id: 13,
    category: '안전사고',
    type: '총기오발',
    probability: 2,
    level: 'safe',
    vulnerableRanks: ['이병', '일병'],
    workType: '경계근무, 사격훈련',
    location: '영내',
    locationDetail: 'GOP/사격장',
    prevention: '총기안전수칙 교육, 탄약관리 철저',
    timeSlot: '경계/훈련시간'
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
  const [showAllTypes, setShowAllTypes] = useState(false); // 전체 사고유형 표시 여부

  const toggleCard = (id: number) => {
    setExpandedCards(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 표시할 사고유형 (Top 4 또는 전체)
  const displayedForecasts = showAllTypes 
    ? ACCIDENT_FORECASTS 
    : ACCIDENT_FORECASTS.slice(0, 4);
  
  // 대분류별 그룹화
  const groupedForecasts = {
    군기사고: displayedForecasts.filter(f => f.category === '군기사고'),
    안전사고: displayedForecasts.filter(f => f.category === '안전사고'),
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            사고유형별 예보 {showAllTypes ? `(전체 ${ACCIDENT_FORECASTS.length}개)` : '(Top 4)'}
          </h2>
          <button
            onClick={() => setShowAllTypes(!showAllTypes)}
            className="text-xs text-primary hover:underline"
          >
            {showAllTypes ? '간략히 보기' : `전체 보기 (${ACCIDENT_FORECASTS.length}개)`}
          </button>
        </div>

        {/* 군기사고 */}
        {groupedForecasts.군기사고.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-status-error rounded" />
              <h3 className="text-xs font-medium text-muted-foreground">군기사고</h3>
              <span className="text-xs text-muted-foreground">({groupedForecasts.군기사고.length}건)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupedForecasts.군기사고.map((forecast) => {
                const isExpanded = expandedCards.includes(forecast.id);
                return (
                  <Card 
                    key={forecast.id}
                    className={`border ${getRiskBgColor(forecast.level)} overflow-hidden`}
                  >
                    <div 
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleCard(forecast.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${forecast.level === 'error' ? 'bg-status-error' : forecast.level === 'warning' ? 'bg-status-warning' : 'bg-status-success'}`} />
                        <span className="text-sm font-medium text-foreground">{forecast.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getRiskTextColor(forecast.level)}`}>
                          {forecast.probability}%
                        </span>
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-start gap-1.5">
                            <Users className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">취약 계급</p>
                              <p className="text-xs text-foreground">{forecast.vulnerableRanks.join(' > ')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">근무형태</p>
                              <p className="text-xs text-foreground">{forecast.workType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">발생장소</p>
                              <p className="text-xs text-foreground">{forecast.location} - {forecast.locationDetail}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">취약 시간</p>
                              <p className="text-xs text-foreground">{forecast.timeSlot}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 bg-primary/5 rounded p-2">
                          <Lightbulb className="h-3 w-3 text-primary mt-0.5" />
                          <div>
                            <p className="text-[10px] text-primary font-medium">예방 대책</p>
                            <p className="text-xs text-foreground">{forecast.prevention}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 안전사고 */}
        {groupedForecasts.안전사고.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-status-warning rounded" />
              <h3 className="text-xs font-medium text-muted-foreground">안전사고</h3>
              <span className="text-xs text-muted-foreground">({groupedForecasts.안전사고.length}건)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupedForecasts.안전사고.map((forecast) => {
                const isExpanded = expandedCards.includes(forecast.id);
                return (
                  <Card 
                    key={forecast.id}
                    className={`border ${getRiskBgColor(forecast.level)} overflow-hidden`}
                  >
                    <div 
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleCard(forecast.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${forecast.level === 'error' ? 'bg-status-error' : forecast.level === 'warning' ? 'bg-status-warning' : 'bg-status-success'}`} />
                        <span className="text-sm font-medium text-foreground">{forecast.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getRiskTextColor(forecast.level)}`}>
                          {forecast.probability}%
                        </span>
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-start gap-1.5">
                            <Users className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">취약 계급</p>
                              <p className="text-xs text-foreground">{forecast.vulnerableRanks.join(' > ')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">근무형태</p>
                              <p className="text-xs text-foreground">{forecast.workType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">발생장소</p>
                              <p className="text-xs text-foreground">{forecast.location} - {forecast.locationDetail}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">취약 시간</p>
                              <p className="text-xs text-foreground">{forecast.timeSlot}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 bg-primary/5 rounded p-2">
                          <Lightbulb className="h-3 w-3 text-primary mt-0.5" />
                          <div>
                            <p className="text-[10px] text-primary font-medium">예방 대책</p>
                            <p className="text-xs text-foreground">{forecast.prevention}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
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
