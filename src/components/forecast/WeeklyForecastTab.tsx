import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getWeeklyOverview,
  getAccidentTypeRisk,
  getRankRisk,
  getWeeklyInsights,
} from '@/data/forecastData';

interface WeeklyForecastTabProps {
  selectedUnit: string;
}

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

export default function WeeklyForecastTab({ selectedUnit }: WeeklyForecastTabProps) {
  // 선택된 부대에 맞는 데이터 조회
  const weeklyOverview = getWeeklyOverview(selectedUnit);
  const accidentTypeRisk = getAccidentTypeRisk(selectedUnit);
  const rankRisk = getRankRisk(selectedUnit);
  const weeklyInsights = getWeeklyInsights(selectedUnit);

  // 주간 평균 계산
  const weeklyAvg = Math.round(weeklyOverview.reduce((sum, d) => sum + d.risk, 0) / weeklyOverview.length);
  const maxRiskDay = weeklyOverview.reduce((max, d) => d.risk > max.risk ? d : max, weeklyOverview[0]);

  // 최고 위험 유형 계산
  const allTypes = accidentTypeRisk.flatMap(cat => cat.types);
  const topRiskType = allTypes.reduce((max, t) => t.risk > max.risk ? t : max, allTypes[0]);

  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-xs text-muted-foreground mt-0.5">{maxRiskDay.factor} · {maxRiskDay.risk}%</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">주요 위험 유형</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{topRiskType?.name || '-'}</span>
            </div>
            <p className="text-xs text-status-error mt-0.5">{topRiskType?.risk || 0}% {topRiskType?.trend === 'up' && '(전주 대비 ↑)'}</p>
          </CardContent>
        </Card>
      </div>

      {/* 주간 종합 위험도 테이블 */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
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
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium text-foreground border-r border-border w-20">구분</th>
                  {weeklyOverview.map((d) => (
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
                  {weeklyOverview.map((d) => (
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
                  {weeklyOverview.map((d) => (
                    <td key={d.day} className="py-1.5 px-2 text-center border-r border-border last:border-r-0">
                      <span className={cn("text-xs font-medium", getGradeStyle(d.grade).textColor)}>
                        {getGradeStyle(d.grade).text}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 text-xs text-muted-foreground border-r border-border">요인</td>
                  {weeklyOverview.map((d) => (
                    <td key={d.day} className="py-1.5 px-2 text-center border-r border-border last:border-r-0">
                      <span className="text-[11px] text-muted-foreground">{d.factor}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 사고유형별 + 계급별 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사고유형별 주간 위험지수 */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">사고유형별 주간 위험지수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accidentTypeRisk.map((cat) => (
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
              {rankRisk.map((item) => (
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

      {/* 주간 핵심 인사이트 */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">주간 핵심 인사이트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg",
                  insight.type === 'warning' ? "bg-status-warning/10" : "bg-muted/50"
                )}
              >
                {insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
