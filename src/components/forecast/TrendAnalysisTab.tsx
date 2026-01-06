import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getWeeklyTrend,
  getMonthlyTrend,
  getAccidentTypeChanges,
  getYearComparison,
  getTrendInsights,
  SEASONAL_PATTERN,
  DAILY_PATTERN,
} from '@/data/forecastData';

interface TrendAnalysisTabProps {
  selectedUnit: string;
}

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '4px',
  fontSize: '12px'
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-status-error" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-status-success" />;
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getChangePercent = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
};

const getChangeColor = (current: number, previous: number) => {
  if (current > previous) return 'text-status-error';
  if (current < previous) return 'text-status-success';
  return 'text-muted-foreground';
};

export default function TrendAnalysisTab({ selectedUnit }: TrendAnalysisTabProps) {
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  // 선택된 부대에 맞는 데이터 조회
  const weeklyTrendData = getWeeklyTrend(selectedUnit);
  const monthlyTrendData = getMonthlyTrend(selectedUnit);
  const accidentTypeChanges = getAccidentTypeChanges(selectedUnit);
  const yearComparison = getYearComparison(selectedUnit);
  const trendInsights = getTrendInsights(selectedUnit);

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '1m': return '최근 1개월';
      case '3m': return '최근 3개월';
      case '6m': return '최근 6개월';
      case '1y': return '최근 1년';
      default: return '';
    }
  };

  const getYearComparisonColor = (value: string) => {
    if (value.startsWith('+')) return 'text-status-error';
    if (value.startsWith('-')) return 'text-status-success';
    return 'text-muted-foreground';
  };

  const getYearComparisonIcon = (value: string) => {
    if (value.startsWith('+')) return <ArrowUp className="w-5 h-5 text-status-error" />;
    if (value.startsWith('-')) return <ArrowDown className="w-5 h-5 text-status-success" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 기간 선택 필터 */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">분석 기간:</span>
        <div className="flex gap-1">
          {(['1m', '3m', '6m', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md border transition-colors",
                dateRange === range
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              {getDateRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      {/* 전년 대비 요약 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">전체 사고 (전년 대비)</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-semibold", getYearComparisonColor(yearComparison.total))}>
                {yearComparison.total}
              </p>
              {getYearComparisonIcon(yearComparison.total)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">군기사고 (전년 대비)</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-semibold", getYearComparisonColor(yearComparison.military))}>
                {yearComparison.military}
              </p>
              {getYearComparisonIcon(yearComparison.military)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">안전사고 (전년 대비)</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-semibold", getYearComparisonColor(yearComparison.safety))}>
                {yearComparison.safety}
              </p>
              {getYearComparisonIcon(yearComparison.safety)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">군무이탈 (전년 대비)</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-semibold", getYearComparisonColor(yearComparison.awol))}>
                {yearComparison.awol}
              </p>
              {getYearComparisonIcon(yearComparison.awol)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추이 차트 */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">사고 발생 추이</CardTitle>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as 'weekly' | 'monthly')}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">주간 추이</SelectItem>
                <SelectItem value="monthly">월간 추이</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            {periodType === 'weekly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="군기사고" 
                    stackId="1"
                    stroke="hsl(var(--status-error))" 
                    fill="hsl(var(--status-error))"
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="안전사고" 
                    stackId="1"
                    stroke="hsl(var(--status-warning))" 
                    fill="hsl(var(--status-warning))"
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="군무이탈" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
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
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* 사고 유형별 증감 현황 */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">사고 유형별 증감 현황</CardTitle>
              <Badge variant="outline" className="text-[10px]">전년 대비</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accidentTypeChanges.map((category) => (
                <div key={category.category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{category.category}</p>
                  <div className="space-y-1.5">
                    {category.types.map((type) => (
                      <div key={type.name} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(type.trend)}
                          <span className="text-sm">{type.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {type.previous} → {type.current}건
                          </span>
                          <span className={cn("text-sm font-medium w-12 text-right", getChangeColor(type.current, type.previous))}>
                            {getChangePercent(type.current, type.previous)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 패턴 분석 */}
        <div className="space-y-6">
          {/* 요일별 발생 패턴 */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">요일별 발생 패턴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DAILY_PATTERN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="군기사고" fill="hsl(var(--status-error))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="안전사고" fill="hsl(var(--status-warning))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ※ 수요일, 금요일에 사고 발생 빈도가 높음
              </p>
            </CardContent>
          </Card>

          {/* 계절별 위험도 패턴 */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">월별 위험도 패턴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SEASONAL_PATTERN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      domain={[40, 100]}
                    />
                    <Tooltip 
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number) => [`${value}%`, '위험도']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ※ 하절기(6-8월) 및 연말(11-12월) 위험도 상승
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 주요 인사이트 */}
      <Card className="border-status-warning/30 bg-status-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-warning mt-0.5" />
            <div>
              <h4 className="text-sm font-medium mb-2">주요 경향 분석 결과</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {trendInsights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
