// 예보 분석 관련 목데이터
// TODO: 백엔드 연동 시 services 레이어로 대체

import type { RiskGrade } from '@/types/entities';

// ============ 주간 예보 탭 데이터 ============

export interface WeeklyOverviewItem {
  day: string;
  date: string;
  risk: number;
  grade: RiskGrade;
  factor: string;
}

export interface AccidentType {
  name: string;
  risk: number;
  trend: 'up' | 'down' | 'stable';
  stat: string;
}

export interface AccidentCategory {
  category: string;
  types: AccidentType[];
}

export interface RankRisk {
  rank: string;
  risk: number;
  stat: string;
}

export interface WeeklyInsight {
  type: 'warning' | 'info';
  title: string;
  text: string;
}

// 부대별 주간 종합 위험도 데이터
export const WEEKLY_OVERVIEW_BY_UNIT: Record<string, WeeklyOverviewItem[]> = {
  // 전체 (HQ/ADMIN 용)
  'all': [
    { day: '일', date: '1/5', risk: 32, grade: 'SAFE', factor: '휴일' },
    { day: '월', date: '1/6', risk: 48, grade: 'ATTENTION', factor: '주말 복귀' },
    { day: '화', date: '1/7', risk: 42, grade: 'ATTENTION', factor: '-' },
    { day: '수', date: '1/8', risk: 58, grade: 'CAUTION', factor: '주중 피로' },
    { day: '목', date: '1/9', risk: 52, grade: 'CAUTION', factor: '-' },
    { day: '금', date: '1/10', risk: 65, grade: 'CAUTION', factor: '외출/외박' },
    { day: '토', date: '1/11', risk: 28, grade: 'SAFE', factor: '휴일' },
  ],
  // 1사단
  'unit-1div': [
    { day: '일', date: '1/5', risk: 35, grade: 'SAFE', factor: '휴일' },
    { day: '월', date: '1/6', risk: 52, grade: 'CAUTION', factor: '주말 복귀' },
    { day: '화', date: '1/7', risk: 45, grade: 'ATTENTION', factor: '-' },
    { day: '수', date: '1/8', risk: 62, grade: 'CAUTION', factor: '야간훈련' },
    { day: '목', date: '1/9', risk: 55, grade: 'CAUTION', factor: '-' },
    { day: '금', date: '1/10', risk: 68, grade: 'WARNING', factor: '외출/외박' },
    { day: '토', date: '1/11', risk: 30, grade: 'SAFE', factor: '휴일' },
  ],
  // 11연대
  'unit-11reg': [
    { day: '일', date: '1/5', risk: 28, grade: 'SAFE', factor: '휴일' },
    { day: '월', date: '1/6', risk: 45, grade: 'ATTENTION', factor: '주말 복귀' },
    { day: '화', date: '1/7', risk: 38, grade: 'SAFE', factor: '-' },
    { day: '수', date: '1/8', risk: 55, grade: 'CAUTION', factor: '주중 피로' },
    { day: '목', date: '1/9', risk: 48, grade: 'ATTENTION', factor: '-' },
    { day: '금', date: '1/10', risk: 60, grade: 'CAUTION', factor: '외출/외박' },
    { day: '토', date: '1/11', risk: 25, grade: 'SAFE', factor: '휴일' },
  ],
  // 1대대
  'unit-1bn': [
    { day: '일', date: '1/5', risk: 25, grade: 'SAFE', factor: '휴일' },
    { day: '월', date: '1/6', risk: 42, grade: 'ATTENTION', factor: '주말 복귀' },
    { day: '화', date: '1/7', risk: 35, grade: 'SAFE', factor: '-' },
    { day: '수', date: '1/8', risk: 52, grade: 'CAUTION', factor: '관심병사 면담' },
    { day: '목', date: '1/9', risk: 45, grade: 'ATTENTION', factor: '-' },
    { day: '금', date: '1/10', risk: 58, grade: 'CAUTION', factor: '외출/외박' },
    { day: '토', date: '1/11', risk: 22, grade: 'SAFE', factor: '휴일' },
  ],
};

// 부대별 사고유형 위험지수
export const ACCIDENT_TYPE_RISK_BY_UNIT: Record<string, AccidentCategory[]> = {
  'all': [
    { category: '군기사고', types: [
      { name: '폭행사고', risk: 42, trend: 'up', stat: '전체의 22%' },
      { name: '성범죄', risk: 35, trend: 'stable', stat: '전체의 12%' },
      { name: '음주운전', risk: 58, trend: 'up', stat: '전체의 18%' },
      { name: '자살사고', risk: 28, trend: 'down', stat: '전체의 8%' },
    ]},
    { category: '안전사고', types: [
      { name: '교통사고', risk: 72, trend: 'up', stat: '전체의 25%' },
      { name: '화재사고', risk: 15, trend: 'stable', stat: '전체의 5%' },
      { name: '추락/충격', risk: 38, trend: 'down', stat: '전체의 10%' },
    ]},
    { category: '군무이탈', types: [
      { name: '군무이탈', risk: 32, trend: 'stable', stat: '전체의 8%' },
    ]},
  ],
  'unit-1bn': [
    { category: '군기사고', types: [
      { name: '폭행사고', risk: 35, trend: 'stable', stat: '부대의 28%' },
      { name: '성범죄', risk: 15, trend: 'down', stat: '부대의 8%' },
      { name: '음주운전', risk: 22, trend: 'stable', stat: '부대의 12%' },
    ]},
    { category: '안전사고', types: [
      { name: '교통사고', risk: 45, trend: 'stable', stat: '부대의 32%' },
      { name: '추락/충격', risk: 28, trend: 'down', stat: '부대의 15%' },
    ]},
    { category: '군무이탈', types: [
      { name: '군무이탈', risk: 18, trend: 'down', stat: '부대의 5%' },
    ]},
  ],
};

// 부대별 계급 위험지수
export const RANK_RISK_BY_UNIT: Record<string, RankRisk[]> = {
  'all': [
    { rank: '병', risk: 58, stat: '전체의 62%' },
    { rank: '부사관', risk: 32, stat: '전체의 24%' },
    { rank: '장교', risk: 18, stat: '전체의 11%' },
    { rank: '군무원', risk: 8, stat: '전체의 3%' },
  ],
  'unit-1bn': [
    { rank: '병', risk: 52, stat: '부대의 68%' },
    { rank: '부사관', risk: 28, stat: '부대의 22%' },
    { rank: '장교', risk: 15, stat: '부대의 8%' },
    { rank: '군무원', risk: 5, stat: '부대의 2%' },
  ],
};

// 부대별 주간 인사이트
export const WEEKLY_INSIGHTS_BY_UNIT: Record<string, WeeklyInsight[]> = {
  'all': [
    { type: 'warning', title: '금요일 교통사고 주의', text: '외출/외박 이동 집중으로 교통사고 발생률 평균 대비 35% 상승' },
    { type: 'warning', title: '수요일 군기사고 주의', text: '주중 피로 누적 시점, 병사 간 갈등 및 폭행사고 위험 증가' },
    { type: 'info', title: '월요일 심리관리', text: '주말 복귀 후 우울감 호소 빈도 상승, 관심병사 면담 권고' },
  ],
  'unit-1bn': [
    { type: 'warning', title: '수요일 관심병사 집중 관리', text: '주중 피로 누적 시점, 1대대 관심병사 3명 면담 예정' },
    { type: 'info', title: '금요일 외출/외박 안전교육', text: '외출/외박 전 교통안전 교육 실시 권고' },
  ],
};

// ============ 경향 분석 탭 데이터 ============

export interface WeeklyTrendItem {
  week: string;
  군기사고: number;
  안전사고: number;
  군무이탈: number;
}

export interface MonthlyTrendItem {
  month: string;
  current: number;
  previous: number;
}

export interface AccidentTypeChange {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AccidentCategoryChange {
  category: string;
  types: AccidentTypeChange[];
}

export interface SeasonalPatternItem {
  month: string;
  risk: number;
}

export interface DailyPatternItem {
  day: string;
  군기사고: number;
  안전사고: number;
}

export interface YearComparisonSummary {
  total: string;
  military: string;
  safety: string;
  awol: string;
}

// 부대별 주간 추이 데이터
export const WEEKLY_TREND_BY_UNIT: Record<string, WeeklyTrendItem[]> = {
  'all': [
    { week: '1주차', 군기사고: 3, 안전사고: 2, 군무이탈: 0 },
    { week: '2주차', 군기사고: 5, 안전사고: 3, 군무이탈: 1 },
    { week: '3주차', 군기사고: 2, 안전사고: 4, 군무이탈: 0 },
    { week: '4주차', 군기사고: 4, 안전사고: 2, 군무이탈: 1 },
    { week: '5주차', 군기사고: 6, 안전사고: 5, 군무이탈: 0 },
    { week: '6주차', 군기사고: 3, 안전사고: 3, 군무이탈: 2 },
  ],
  'unit-1bn': [
    { week: '1주차', 군기사고: 0, 안전사고: 1, 군무이탈: 0 },
    { week: '2주차', 군기사고: 1, 안전사고: 0, 군무이탈: 0 },
    { week: '3주차', 군기사고: 0, 안전사고: 1, 군무이탈: 0 },
    { week: '4주차', 군기사고: 1, 안전사고: 0, 군무이탈: 0 },
    { week: '5주차', 군기사고: 0, 안전사고: 2, 군무이탈: 0 },
    { week: '6주차', 군기사고: 1, 안전사고: 0, 군무이탈: 0 },
  ],
};

// 부대별 월간 추이 데이터
export const MONTHLY_TREND_BY_UNIT: Record<string, MonthlyTrendItem[]> = {
  'all': [
    { month: '7월', current: 12, previous: 15 },
    { month: '8월', current: 18, previous: 14 },
    { month: '9월', current: 15, previous: 16 },
    { month: '10월', current: 22, previous: 19 },
    { month: '11월', current: 19, previous: 21 },
    { month: '12월', current: 14, previous: 17 },
  ],
  'unit-1bn': [
    { month: '7월', current: 2, previous: 3 },
    { month: '8월', current: 3, previous: 2 },
    { month: '9월', current: 1, previous: 2 },
    { month: '10월', current: 2, previous: 3 },
    { month: '11월', current: 2, previous: 2 },
    { month: '12월', current: 1, previous: 2 },
  ],
};

// 부대별 사고 유형 증감 현황
export const ACCIDENT_TYPE_CHANGES_BY_UNIT: Record<string, AccidentCategoryChange[]> = {
  'all': [
    { 
      category: '군기사고',
      types: [
        { name: '구타/폭행', current: 8, previous: 12, trend: 'down' },
        { name: '가혹행위', current: 5, previous: 7, trend: 'down' },
        { name: '성폭력', current: 3, previous: 2, trend: 'up' },
        { name: '언어폭력', current: 12, previous: 10, trend: 'up' },
        { name: '집단따돌림', current: 2, previous: 4, trend: 'down' },
      ]
    },
    {
      category: '안전사고',
      types: [
        { name: '자살', current: 1, previous: 2, trend: 'down' },
        { name: '자해', current: 3, previous: 5, trend: 'down' },
        { name: '총기사고', current: 0, previous: 1, trend: 'down' },
        { name: '차량사고', current: 8, previous: 5, trend: 'up' },
        { name: '화재사고', current: 2, previous: 2, trend: 'stable' },
      ]
    }
  ],
  'unit-1bn': [
    { 
      category: '군기사고',
      types: [
        { name: '구타/폭행', current: 1, previous: 2, trend: 'down' },
        { name: '언어폭력', current: 2, previous: 1, trend: 'up' },
      ]
    },
    {
      category: '안전사고',
      types: [
        { name: '차량사고', current: 1, previous: 0, trend: 'up' },
        { name: '훈련사고', current: 0, previous: 1, trend: 'down' },
      ]
    }
  ],
};

// 계절별 패턴 (공통)
export const SEASONAL_PATTERN: SeasonalPatternItem[] = [
  { month: '1월', risk: 65 },
  { month: '2월', risk: 58 },
  { month: '3월', risk: 72 },
  { month: '4월', risk: 68 },
  { month: '5월', risk: 55 },
  { month: '6월', risk: 78 },
  { month: '7월', risk: 85 },
  { month: '8월', risk: 82 },
  { month: '9월', risk: 70 },
  { month: '10월', risk: 62 },
  { month: '11월', risk: 75 },
  { month: '12월', risk: 80 },
];

// 요일별 패턴 (공통)
export const DAILY_PATTERN: DailyPatternItem[] = [
  { day: '월', 군기사고: 15, 안전사고: 12 },
  { day: '화', 군기사고: 10, 안전사고: 8 },
  { day: '수', 군기사고: 22, 안전사고: 15 },
  { day: '목', 군기사고: 12, 안전사고: 10 },
  { day: '금', 군기사고: 18, 안전사고: 20 },
  { day: '토', 군기사고: 14, 안전사고: 8 },
  { day: '일', 군기사고: 16, 안전사고: 10 },
];

// 부대별 전년 대비 요약
export const YEAR_COMPARISON_BY_UNIT: Record<string, YearComparisonSummary> = {
  'all': { total: '-12%', military: '-18%', safety: '+8%', awol: '-25%' },
  'unit-1bn': { total: '-8%', military: '-15%', safety: '+5%', awol: '-10%' },
};

// 부대별 주요 인사이트
export const TREND_INSIGHTS_BY_UNIT: Record<string, string[]> = {
  'all': [
    '차량사고가 전년 대비 60% 증가 추세로 주의 필요',
    '구타/폭행, 집단따돌림 등 군기사고는 전반적 감소 추세',
    '수요일, 금요일 야간 시간대에 사고 집중 발생',
    '7-8월 하절기 위험도가 연중 최고 수준',
  ],
  'unit-1bn': [
    '언어폭력이 전년 대비 소폭 증가, 분대장 리더십 교육 권고',
    '전반적 사고 발생률은 감소 추세',
    '수요일 관심병사 면담 시 집중 관리 필요',
  ],
};

// 데이터 조회 헬퍼 함수
export function getWeeklyOverview(unitId: string): WeeklyOverviewItem[] {
  return WEEKLY_OVERVIEW_BY_UNIT[unitId] || WEEKLY_OVERVIEW_BY_UNIT['all'];
}

export function getAccidentTypeRisk(unitId: string): AccidentCategory[] {
  return ACCIDENT_TYPE_RISK_BY_UNIT[unitId] || ACCIDENT_TYPE_RISK_BY_UNIT['all'];
}

export function getRankRisk(unitId: string): RankRisk[] {
  return RANK_RISK_BY_UNIT[unitId] || RANK_RISK_BY_UNIT['all'];
}

export function getWeeklyInsights(unitId: string): WeeklyInsight[] {
  return WEEKLY_INSIGHTS_BY_UNIT[unitId] || WEEKLY_INSIGHTS_BY_UNIT['all'];
}

export function getWeeklyTrend(unitId: string): WeeklyTrendItem[] {
  return WEEKLY_TREND_BY_UNIT[unitId] || WEEKLY_TREND_BY_UNIT['all'];
}

export function getMonthlyTrend(unitId: string): MonthlyTrendItem[] {
  return MONTHLY_TREND_BY_UNIT[unitId] || MONTHLY_TREND_BY_UNIT['all'];
}

export function getAccidentTypeChanges(unitId: string): AccidentCategoryChange[] {
  return ACCIDENT_TYPE_CHANGES_BY_UNIT[unitId] || ACCIDENT_TYPE_CHANGES_BY_UNIT['all'];
}

export function getYearComparison(unitId: string): YearComparisonSummary {
  return YEAR_COMPARISON_BY_UNIT[unitId] || YEAR_COMPARISON_BY_UNIT['all'];
}

export function getTrendInsights(unitId: string): string[] {
  return TREND_INSIGHTS_BY_UNIT[unitId] || TREND_INSIGHTS_BY_UNIT['all'];
}

// RiskGrade 헬퍼 함수
export function getRiskGradeLabel(grade: RiskGrade): string {
  const labels: Record<RiskGrade, string> = {
    'SAFE': '안전',
    'ATTENTION': '관심',
    'CAUTION': '주의',
    'WARNING': '경계',
    'DANGER': '심각',
  };
  return labels[grade];
}

export function getRiskGradeColor(grade: RiskGrade): string {
  const colors: Record<RiskGrade, string> = {
    'SAFE': 'text-green-600',
    'ATTENTION': 'text-blue-600',
    'CAUTION': 'text-yellow-600',
    'WARNING': 'text-orange-600',
    'DANGER': 'text-red-600',
  };
  return colors[grade];
}

export function getRiskGradeBgColor(grade: RiskGrade): string {
  const colors: Record<RiskGrade, string> = {
    'SAFE': 'bg-green-100',
    'ATTENTION': 'bg-blue-100',
    'CAUTION': 'bg-yellow-100',
    'WARNING': 'bg-orange-100',
    'DANGER': 'bg-red-100',
  };
  return colors[grade];
}
