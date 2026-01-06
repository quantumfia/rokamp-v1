import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// 주간 종합 위험도 데이터 (요일별 + 일정)
const WEEKLY_OVERVIEW = [
  { day: '일', date: '1/5', risk: 18, grade: 'safe', schedule: '휴일' },
  { day: '월', date: '1/6', risk: 45, grade: 'safe', schedule: '체력단련' },
  { day: '화', date: '1/7', risk: 52, grade: 'caution', schedule: '사격훈련' },
  { day: '수', date: '1/8', risk: 68, grade: 'caution', schedule: '야외훈련' },
  { day: '목', date: '1/9', risk: 55, grade: 'caution', schedule: '정비점검' },
  { day: '금', date: '1/10', risk: 42, grade: 'safe', schedule: '안전교육' },
  { day: '토', date: '1/11', risk: 25, grade: 'safe', schedule: '휴일' },
];

// 사고유형별 주간 위험지수
const ACCIDENT_TYPE_RISK = [
  { category: '군기사고', types: [
    { name: '폭행사고', risk: 42, trend: 'up' },
    { name: '성범죄', risk: 35, trend: 'stable' },
    { name: '음주운전', risk: 58, trend: 'up' },
    { name: '자살사고', risk: 28, trend: 'down' },
  ]},
  { category: '안전사고', types: [
    { name: '교통사고', risk: 72, trend: 'up' },
    { name: '화재사고', risk: 15, trend: 'stable' },
    { name: '추락/충격', risk: 38, trend: 'down' },
  ]},
  { category: '군무이탈', types: [
    { name: '군무이탈', risk: 32, trend: 'stable' },
  ]},
];

// 계급별 주간 위험지수
const RANK_RISK = [
  { rank: '병사', risk: 58 },
  { rank: '부사관', risk: 35 },
  { rank: '위관', risk: 22 },
  { rank: '영관', risk: 12 },
  { rank: '장관', risk: 5 },
];

// 주간 주의사항 (패턴 기반)
const WEEKLY_NOTES = [
  { type: 'warning', text: '수요일 야외훈련 시 안전사고 주의 (과거 동일 훈련 시 사고율 15% 상승)' },
  { type: 'warning', text: '금요일 오후 외출/외박 이동 시 교통사고 주의' },
  { type: 'info', text: '주말 간부 순찰 강화 권고 (영내 근무 인원 감소)' },
];

const getGradeStyle = (grade: string) => {
  switch (grade) {
    case 'warning': return { bg: 'bg-status-error', text: '경고', textColor: 'text-status-error' };
    case 'caution': return { bg: 'bg-status-warning', text: '주의', textColor: 'text-status-warning' };
    default: return { bg: 'bg-status-success', text: '안전', textColor: 'text-status-success' };
  }
};

const getRiskBarColor = (risk: number) => {
  if (risk >= 75) return 'bg-status-error';
  if (risk >= 50) return 'bg-status-warning';
  return 'bg-status-success';
};

const getTrendBadge = (trend: string) => {
  switch (trend) {
    case 'up': return <Badge variant="outline" className="text-[9px] px-1 py-0 text-status-error border-status-error/30">↑</Badge>;
    case 'down': return <Badge variant="outline" className="text-[9px] px-1 py-0 text-status-success border-status-success/30">↓</Badge>;
    default: return <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">-</Badge>;
  }
};

export default function WeeklyForecastTab() {
  // 주간 평균 계산
  const weeklyAvg = Math.round(WEEKLY_OVERVIEW.reduce((sum, d) => sum + d.risk, 0) / WEEKLY_OVERVIEW.length);
  const maxRiskDay = WEEKLY_OVERVIEW.reduce((max, d) => d.risk > max.risk ? d : max, WEEKLY_OVERVIEW[0]);

  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">주간 평균 위험도</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyAvg}%</span>
              <Badge variant="outline" className={cn("text-[10px]", getGradeStyle(weeklyAvg >= 50 ? 'caution' : 'safe').textColor)}>
                {getGradeStyle(weeklyAvg >= 50 ? 'caution' : 'safe').text}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">최고 위험 요일</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{maxRiskDay.day}요일</span>
              <span className="text-sm text-muted-foreground">({maxRiskDay.date})</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{maxRiskDay.schedule} · {maxRiskDay.risk}%</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">주요 위험 유형</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">교통사고</span>
            </div>
            <p className="text-xs text-status-error mt-0.5">72% (전주 대비 ↑)</p>
          </CardContent>
        </Card>
      </div>

      {/* 주간 종합 위험도 테이블 */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">주간 종합 위험도</CardTitle>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-status-error" />
                <span className="text-muted-foreground">경고 75%↑</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-status-warning" />
                <span className="text-muted-foreground">주의 50~74%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-status-success" />
                <span className="text-muted-foreground">안전 ~49%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium text-foreground border-r border-border w-20">구분</th>
                  {WEEKLY_OVERVIEW.map((d) => (
                    <th key={d.day} className="py-2 px-2 text-center font-medium text-foreground border-r border-border last:border-r-0">
                      <div>{d.day}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">{d.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 text-xs text-muted-foreground border-r border-border">위험도</td>
                  {WEEKLY_OVERVIEW.map((d) => (
                    <td key={d.day} className="py-2 px-2 text-center border-r border-border last:border-r-0">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-medium min-w-[40px]",
                        d.risk >= 75 ? "bg-status-error/80 text-white" :
                        d.risk >= 50 ? "bg-status-warning/80 text-foreground" :
                        "bg-status-success/30 text-foreground"
                      )}>
                        {d.risk}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 text-xs text-muted-foreground border-r border-border">등급</td>
                  {WEEKLY_OVERVIEW.map((d) => (
                    <td key={d.day} className="py-1.5 px-2 text-center border-r border-border last:border-r-0">
                      <span className={cn("text-xs font-medium", getGradeStyle(d.grade).textColor)}>
                        {getGradeStyle(d.grade).text}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-xs text-muted-foreground border-r border-border">일정</td>
                  {WEEKLY_OVERVIEW.map((d) => (
                    <td key={d.day} className="py-1.5 px-2 text-center border-r border-border last:border-r-0">
                      <span className="text-[11px] text-muted-foreground">{d.schedule}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 사고유형별 + 계급별 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 사고유형별 주간 위험지수 */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">사고유형별 주간 위험지수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ACCIDENT_TYPE_RISK.map((cat) => (
                <div key={cat.category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{cat.category}</p>
                  <div className="space-y-2">
                    {cat.types.map((type) => (
                      <div key={type.name} className="flex items-center gap-3">
                        <span className="text-sm w-20 shrink-0">{type.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", getRiskBarColor(type.risk))}
                            style={{ width: `${type.risk}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">{type.risk}%</span>
                        {getTrendBadge(type.trend)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 계급별 주간 위험지수 */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">계급별 주간 위험지수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RANK_RISK.map((item) => (
                <div key={item.rank} className="flex items-center gap-3">
                  <span className="text-sm w-16 shrink-0">{item.rank}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", getRiskBarColor(item.risk))}
                      style={{ width: `${item.risk}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{item.risk}%</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] min-w-[36px] justify-center",
                      item.risk >= 50 ? "text-status-warning border-status-warning/30" : "text-status-success border-status-success/30"
                    )}
                  >
                    {item.risk >= 75 ? '경고' : item.risk >= 50 ? '주의' : '안전'}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
              ※ 병사 계급의 위험도가 가장 높으며, 특히 이병·일병 관리 강화 필요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 주간 주의사항 */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">주간 주의사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {WEEKLY_NOTES.map((note, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-2 p-3 rounded-lg",
                  note.type === 'warning' ? "bg-status-warning/10" : "bg-muted/50"
                )}
              >
                {note.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <p className="text-sm text-foreground">{note.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 데이터 출처 */}
      <div className="text-center py-2 bg-muted/30 rounded-md">
        <p className="text-xs text-muted-foreground">
          ※ 본 예보는 최근 10년간 동일 기간 사고 데이터를 기반으로 산출되었습니다.
        </p>
      </div>
    </div>
  );
}
