import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, AlertCircle, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PageHeader } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { cn } from '@/lib/utils';

// 훈련 일정 타입
interface TrainingSchedule {
  id: string;
  title: string;
  unit: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  type: '사격' | '기동' | '전술' | '체력' | '교육' | '점검';
  riskLevel: 'low' | 'medium' | 'high';
  participants: number;
}

// Mock 훈련 일정 데이터
const generateMockSchedules = (): TrainingSchedule[] => {
  const baseDate = new Date();
  return [
    {
      id: '1',
      title: 'K-2 소총 영점사격',
      unit: '제1보병사단 1연대',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1),
      startTime: '09:00',
      endTime: '12:00',
      location: '종합사격장',
      type: '사격',
      riskLevel: 'high',
      participants: 120,
    },
    {
      id: '2',
      title: '기초체력단련',
      unit: '제7보병사단 신병교육대',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()),
      startTime: '06:00',
      endTime: '08:00',
      location: '연병장',
      type: '체력',
      riskLevel: 'low',
      participants: 200,
    },
    {
      id: '3',
      title: '동절기 차량정비 점검',
      unit: '수도기계화보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()),
      startTime: '14:00',
      endTime: '17:00',
      location: '정비창',
      type: '점검',
      riskLevel: 'medium',
      participants: 45,
    },
    {
      id: '4',
      title: '야간 기동훈련',
      unit: '제3보병사단 기갑대대',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1),
      startTime: '20:00',
      endTime: '24:00',
      location: '훈련장 A구역',
      type: '기동',
      riskLevel: 'high',
      participants: 80,
    },
    {
      id: '5',
      title: '안전교육 (동절기 안전수칙)',
      unit: '제5보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 2),
      startTime: '10:00',
      endTime: '12:00',
      location: '대강당',
      type: '교육',
      riskLevel: 'low',
      participants: 300,
    },
    {
      id: '6',
      title: '전술훈련 (소대공격)',
      unit: '제1보병사단 2연대',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 3),
      startTime: '08:00',
      endTime: '18:00',
      location: '전술훈련장',
      type: '전술',
      riskLevel: 'high',
      participants: 150,
    },
    {
      id: '7',
      title: '장비정비 교육',
      unit: '제7보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 4),
      startTime: '09:00',
      endTime: '11:00',
      location: '정비교육장',
      type: '교육',
      riskLevel: 'low',
      participants: 60,
    },
  ];
};

const SCHEDULES = generateMockSchedules();

// 훈련 타입별 스타일 (좌측 액센트 바 색상만)
const typeAccentColors: Record<string, string> = {
  '사격': 'border-l-red-400',
  '기동': 'border-l-amber-400',
  '전술': 'border-l-violet-400',
  '체력': 'border-l-emerald-400',
  '교육': 'border-l-sky-400',
  '점검': 'border-l-slate-400',
};

// 타입 도트 색상
const typeDotColors: Record<string, string> = {
  '사격': 'bg-red-400',
  '기동': 'bg-amber-400',
  '전술': 'bg-violet-400',
  '체력': 'bg-emerald-400',
  '교육': 'bg-sky-400',
  '점검': 'bg-slate-400',
};

// 일정 카드 컴포넌트
function ScheduleCard({ schedule }: { schedule: TrainingSchedule }) {
  return (
    <div className={cn(
      'p-2.5 rounded bg-card/50 border-l-2 hover:bg-card transition-colors cursor-pointer group',
      typeAccentColors[schedule.type]
    )}>
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
          {schedule.title}
        </span>
        {schedule.riskLevel === 'high' && (
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1" />
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{schedule.startTime} - {schedule.endTime}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{schedule.location}</span>
        </div>
      </div>
      <div className="mt-2 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground truncate">
        {schedule.unit}
      </div>
    </div>
  );
}

export default function ScheduleManagementPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isLoading = usePageLoading(800);

  // 현재 주의 시작일과 종료일
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 이전/다음 주 이동
  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // 해당 날짜의 일정 필터링
  const getSchedulesForDate = (date: Date) => {
    return SCHEDULES.filter(schedule => isSameDay(schedule.date, date));
  };

  // 주간 통계
  const weekStats = useMemo(() => {
    const weekSchedules = SCHEDULES.filter(s => 
      s.date >= weekStart && s.date <= weekEnd
    );
    return {
      total: weekSchedules.length,
      highRisk: weekSchedules.filter(s => s.riskLevel === 'high').length,
      totalParticipants: weekSchedules.reduce((sum, s) => sum + s.participants, 0),
    };
  }, [weekStart, weekEnd]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
        <div className="h-[600px] bg-muted/50 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-page-enter">
      <PageHeader 
        title="일정 관리" 
        description="부대별 훈련 일정 관리 및 조회" 
      />

      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <button 
              onClick={goToPrevWeek}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <h2 className="text-sm font-medium text-foreground">
            {format(weekStart, 'yyyy년 M월 d일', { locale: ko })} — {format(weekEnd, 'M월 d일', { locale: ko })}
          </h2>
          <button 
            onClick={goToToday}
            className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground border border-border rounded hover:bg-muted transition-colors"
          >
            오늘
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* 주간 통계 */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>일정</span>
              <span className="text-foreground font-medium">{weekStats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-foreground font-medium">{weekStats.highRisk}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{weekStats.totalParticipants.toLocaleString()}</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            일정 추가
          </button>
        </div>
      </div>

      {/* 주간 캘린더 그리드 */}
      <div className="border border-border rounded-lg overflow-hidden bg-card/30">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, index) => {
            const isWeekend = index >= 5;
            const isTodayDate = isToday(day);
            return (
              <div 
                key={index}
                className={cn(
                  'py-3 text-center border-r border-border last:border-r-0',
                  isTodayDate && 'bg-primary/5'
                )}
              >
                <div className={cn(
                  'text-[10px] uppercase tracking-wide mb-1',
                  isWeekend ? 'text-muted-foreground/60' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE', { locale: ko })}
                </div>
                <div className={cn(
                  'text-sm font-medium',
                  isTodayDate && 'text-primary',
                  isWeekend && !isTodayDate && 'text-muted-foreground/60'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* 일정 셀 */}
        <div className="grid grid-cols-7 min-h-[480px]">
          {weekDays.map((day, index) => {
            const daySchedules = getSchedulesForDate(day);
            const isTodayDate = isToday(day);
            return (
              <div 
                key={index}
                className={cn(
                  'border-r border-border last:border-r-0 p-2 space-y-2',
                  isTodayDate && 'bg-primary/5'
                )}
              >
                {daySchedules.length > 0 ? (
                  daySchedules.map(schedule => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className="mr-2">유형</span>
        {Object.entries(typeDotColors).map(([type, dotColor]) => (
          <div key={type} className="flex items-center gap-1 px-2 py-0.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
            <span>{type}</span>
          </div>
        ))}
        <span className="mx-3 text-border">|</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span>고위험</span>
        </div>
      </div>
    </div>
  );
}
