import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, AlertTriangle } from 'lucide-react';
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

// 훈련 타입별 색상
const typeColors: Record<string, string> = {
  '사격': 'bg-red-500/20 text-red-400 border-red-500/30',
  '기동': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '전술': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '체력': 'bg-green-500/20 text-green-400 border-green-500/30',
  '교육': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '점검': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// 위험도 표시
const riskBadge: Record<string, { label: string; className: string }> = {
  low: { label: '저위험', className: 'bg-risk-safe/10 text-risk-safe' },
  medium: { label: '중위험', className: 'bg-risk-caution/10 text-risk-caution' },
  high: { label: '고위험', className: 'bg-risk-danger/10 text-risk-danger' },
};

// 일정 카드 컴포넌트
function ScheduleCard({ schedule }: { schedule: TrainingSchedule }) {
  return (
    <div className={cn(
      'p-2.5 rounded-md border text-xs space-y-1.5 hover:shadow-md transition-shadow cursor-pointer',
      typeColors[schedule.type]
    )}>
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium line-clamp-2">{schedule.title}</span>
        {schedule.riskLevel === 'high' && (
          <AlertTriangle className="w-3.5 h-3.5 text-risk-danger shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] opacity-80">
        <Clock className="w-3 h-3" />
        <span>{schedule.startTime} - {schedule.endTime}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] opacity-80">
        <MapPin className="w-3 h-3" />
        <span className="truncate">{schedule.location}</span>
      </div>
      <div className="text-[10px] opacity-70 truncate">{schedule.unit}</div>
    </div>
  );
}

export default function ScheduleManagementPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isLoading = usePageLoading(800);

  // 현재 주의 시작일과 종료일
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 월요일 시작
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
        <div className="h-[600px] bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="일정 관리" 
        description="부대별 훈련 일정 관리 및 조회" 
      />

      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button 
              onClick={goToPrevWeek}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold">
            {format(weekStart, 'yyyy년 M월 d일', { locale: ko })} - {format(weekEnd, 'M월 d일', { locale: ko })}
          </h2>
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
          >
            오늘
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* 주간 통계 */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              총 <span className="text-foreground font-medium">{weekStats.total}</span>건
            </span>
            <span className="text-muted-foreground">
              고위험 <span className="text-risk-danger font-medium">{weekStats.highRisk}</span>건
            </span>
            <span className="text-muted-foreground">
              참여인원 <span className="text-foreground font-medium">{weekStats.totalParticipants.toLocaleString()}</span>명
            </span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            일정 추가
          </button>
        </div>
      </div>

      {/* 주간 캘린더 그리드 */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {weekDays.map((day, index) => (
            <div 
              key={index}
              className={cn(
                'py-3 px-2 text-center border-r border-border last:border-r-0',
                isToday(day) && 'bg-primary/5'
              )}
            >
              <div className={cn(
                'text-xs text-muted-foreground',
                index === 6 && 'text-blue-500',
                index === 5 && 'text-blue-500'
              )}>
                {format(day, 'EEE', { locale: ko })}
              </div>
              <div className={cn(
                'text-lg font-semibold mt-1',
                isToday(day) && 'text-primary',
                index >= 5 && 'text-blue-500'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* 일정 셀 */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {weekDays.map((day, index) => {
            const daySchedules = getSchedulesForDate(day);
            return (
              <div 
                key={index}
                className={cn(
                  'border-r border-border last:border-r-0 p-2 space-y-2',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                {daySchedules.length > 0 ? (
                  daySchedules.map(schedule => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    일정 없음
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 위험도 범례 */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="font-medium">훈련 유형:</span>
        {Object.entries(typeColors).map(([type, className]) => (
          <span key={type} className={cn('px-2 py-1 rounded border', className)}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
