import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, AlertCircle, Users, Download, Pencil, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PageHeader, ActionButton, AddModal, FileDropZone, InlineFormField } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useFormValidation, getFieldError } from '@/hooks/useFormValidation';
import { trainingScheduleSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleUnits } from '@/lib/rbac';
import { z } from 'zod';
import type { RiskGrade } from '@/types/entities';
import { RISK_GRADE_LABELS } from '@/types/entities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// 일정 타입
interface Schedule {
  id: string;
  title: string;
  unit?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: '훈련' | '행사' | '점검' | '회의' | '휴가' | '기타';
  riskLevel?: RiskGrade;
  participants?: number;
  memo?: string;
}

// 폼 값 타입
interface ScheduleFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: '훈련' | '행사' | '점검' | '회의' | '휴가' | '기타' | '';
  riskLevel: RiskGrade;
  participants: number;
  memo: string;
  [key: string]: unknown;
}

// 폼 스키마
const scheduleFormSchema = z.object({
  title: z.string().trim().min(1, { message: '일정명을 입력해주세요.' }).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: '날짜를 선택해주세요.' }),
  startTime: z.string().optional().or(z.literal('')),
  endTime: z.string().optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  type: z.enum(['훈련', '행사', '점검', '회의', '휴가', '기타', '']).optional().or(z.literal('')),
  riskLevel: z.enum(['SAFE', 'ATTENTION', 'CAUTION', 'WARNING', 'DANGER']).optional(),
  participants: z.number().nonnegative().optional(),
  memo: z.string().max(500).optional().or(z.literal('')),
});

// Mock 일정 데이터
const generateMockSchedules = (): Schedule[] => {
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
      type: '훈련',
      riskLevel: 'WARNING',
      participants: 120,
    },
    {
      id: '2',
      title: '분기 안전점검',
      unit: '제7보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()),
      startTime: '14:00',
      endTime: '17:00',
      location: '본부',
      type: '점검',
      riskLevel: 'ATTENTION',
    },
    {
      id: '3',
      title: '지휘관 회의',
      unit: '수도기계화보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()),
      startTime: '10:00',
      endTime: '11:30',
      location: '회의실',
      type: '회의',
    },
    {
      id: '4',
      title: '창설기념행사',
      unit: '제3보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1),
      startTime: '10:00',
      endTime: '12:00',
      location: '연병장',
      type: '행사',
      participants: 500,
    },
    {
      id: '5',
      title: '집중 휴가기간',
      unit: '제5보병사단',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 2),
      type: '휴가',
      memo: '하계 집중휴가 1차',
    },
    {
      id: '6',
      title: '야간 기동훈련',
      unit: '제1보병사단 기갑대대',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 3),
      startTime: '20:00',
      endTime: '24:00',
      location: '훈련장 A구역',
      type: '훈련',
      riskLevel: 'DANGER',
      participants: 80,
    },
  ];
};

const SCHEDULES = generateMockSchedules();

// 일정 타입별 스타일 (좌측 액센트 바 색상)
const typeAccentColors: Record<string, string> = {
  '훈련': 'border-l-red-400',
  '행사': 'border-l-amber-400',
  '점검': 'border-l-violet-400',
  '회의': 'border-l-sky-400',
  '휴가': 'border-l-emerald-400',
  '기타': 'border-l-slate-400',
};

// 타입 도트 색상
const typeDotColors: Record<string, string> = {
  '훈련': 'bg-red-400',
  '행사': 'bg-amber-400',
  '점검': 'bg-violet-400',
  '회의': 'bg-sky-400',
  '휴가': 'bg-emerald-400',
  '기타': 'bg-slate-400',
};

// 일정 카드 컴포넌트
function ScheduleCard({ schedule, onClick }: { schedule: Schedule; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'p-2.5 rounded bg-card/50 border-l-2 hover:bg-card transition-colors cursor-pointer group',
        typeAccentColors[schedule.type]
      )}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
          {schedule.title}
        </span>
        {schedule.riskLevel && ['WARNING', 'DANGER'].includes(schedule.riskLevel) && (
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-status-error mt-1" />
        )}
      </div>
      {(schedule.startTime || schedule.location) && (
        <div className="space-y-1">
          {schedule.startTime && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{schedule.startTime}{schedule.endTime ? ` - ${schedule.endTime}` : ''}</span>
            </div>
          )}
          {schedule.location && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{schedule.location}</span>
            </div>
          )}
        </div>
      )}
      {schedule.unit && (
        <div className="mt-2 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground truncate">
          {schedule.unit}
        </div>
      )}
    </div>
  );
}

// 일정 직접 입력 폼
interface ScheduleFormProps {
  schedule?: Schedule | null;
  isEditing?: boolean;
  formState: ReturnType<typeof useFormValidation<ScheduleFormValues>>;
}

function ScheduleForm({ schedule, isEditing = true, formState }: ScheduleFormProps) {
  const { values, errors, touched, handleChange, handleBlur } = formState;
  
  const inputClass = isEditing
    ? "w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
    : "w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md text-foreground cursor-not-allowed";
  
  return (
    <div className="space-y-4">
      {/* 필수: 일정명 */}
      <InlineFormField 
        label="일정명" 
        required 
        error={getFieldError('title', errors, touched)}
      >
        <input
          type="text"
          placeholder="예: 분기 안전점검, 지휘관 회의"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          disabled={!isEditing}
          className={inputClass}
        />
      </InlineFormField>
      
      {/* 필수: 날짜 + 유형 */}
      <div className="grid grid-cols-2 gap-3">
        <InlineFormField 
          label="날짜" 
          required 
          error={getFieldError('date', errors, touched)}
        >
          <input
            type="date"
            value={values.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={() => handleBlur('date')}
            disabled={!isEditing}
            className={inputClass}
          />
        </InlineFormField>
        
        <InlineFormField 
          label="유형" 
          error={getFieldError('type', errors, touched)}
        >
          <select 
            value={values.type}
            onChange={(e) => handleChange('type', e.target.value)}
            onBlur={() => handleBlur('type')}
            disabled={!isEditing}
            className={inputClass}
          >
            <option value="">선택 (선택사항)</option>
            <option value="훈련">훈련</option>
            <option value="행사">행사</option>
            <option value="점검">점검</option>
            <option value="회의">회의</option>
            <option value="휴가">휴가</option>
            <option value="기타">기타</option>
          </select>
        </InlineFormField>
      </div>

      {/* 위험도 */}
      <InlineFormField 
        label="예측 위험도"
        error={getFieldError('riskLevel', errors, touched)}
      >
        <select
          value={values.riskLevel}
          onChange={(e) => handleChange('riskLevel', e.target.value)}
          onBlur={() => handleBlur('riskLevel')}
          disabled={!isEditing}
          className={inputClass}
        >
          <option value="SAFE">{RISK_GRADE_LABELS.SAFE}</option>
          <option value="ATTENTION">{RISK_GRADE_LABELS.ATTENTION}</option>
          <option value="CAUTION">{RISK_GRADE_LABELS.CAUTION}</option>
          <option value="WARNING">{RISK_GRADE_LABELS.WARNING}</option>
          <option value="DANGER">{RISK_GRADE_LABELS.DANGER}</option>
        </select>
      </InlineFormField>
      
      {/* 선택: 시간 */}
      <div className="grid grid-cols-2 gap-3">
        <InlineFormField label="시작 시간">
          <input
            type="time"
            value={values.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            disabled={!isEditing}
            className={inputClass}
          />
        </InlineFormField>
        
        <InlineFormField label="종료 시간">
          <input
            type="time"
            value={values.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            disabled={!isEditing}
            className={inputClass}
          />
        </InlineFormField>
      </div>
      
      {/* 선택: 장소 + 메모 */}
      <InlineFormField label="장소">
        <input
          type="text"
          placeholder="예: 회의실, 연병장"
          value={values.location}
          onChange={(e) => handleChange('location', e.target.value)}
          disabled={!isEditing}
          className={inputClass}
        />
      </InlineFormField>
      
      <InlineFormField label="메모">
        <input
          type="text"
          placeholder="추가 정보 입력"
          value={values.memo}
          onChange={(e) => handleChange('memo', e.target.value)}
          disabled={!isEditing}
          className={inputClass}
        />
      </InlineFormField>
    </div>
  );
}

// 일괄 업로드 폼
function ScheduleBulkUploadForm({ onDownloadTemplate }: { onDownloadTemplate: () => void }) {
  return (
    <div className="space-y-4">
      <FileDropZone
        accept=".xlsx,.xls"
        hint="엑셀 파일을 드래그하거나 클릭하여 업로드"
        maxSize="10MB"
      />
      <button
        onClick={onDownloadTemplate}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs border border-border rounded-md hover:bg-muted transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        템플릿 다운로드
      </button>
      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <p>• 필수 필드: 일정명, 날짜</p>
        <p>• 선택 필드: 유형, 시작시간, 종료시간, 장소, 메모</p>
      </div>
    </div>
  );
}

export default function ScheduleManagementPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const isLoading = usePageLoading(800);

  // 폼 검증 훅
  const formState = useFormValidation<ScheduleFormValues>({
    initialValues: {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      type: '',
      riskLevel: 'SAFE',
      participants: 0,
      memo: '',
    },
    schema: scheduleFormSchema as z.ZodSchema<ScheduleFormValues>,
    validateOnChange: true,
    validateOnBlur: true,
  });

  // 역할 기반 접근 가능 부대 목록
  const accessibleUnits = useMemo(() => {
    return getAccessibleUnits(user?.role, user?.unitId);
  }, [user?.role, user?.unitId]);

  // 역할 기반 필터링된 일정
  const filteredSchedules = useMemo(() => {
    // HQ는 전체 일정 접근 가능
    if (user?.role === 'ROLE_HQ') return SCHEDULES;
    
    // DIV/BN은 접근 가능한 부대의 일정만
    return SCHEDULES.filter(schedule => 
      !schedule.unit || accessibleUnits.some(unit => schedule.unit?.includes(unit.name))
    );
  }, [user?.role, accessibleUnits]);

  // 현재 주의 시작일과 종료일
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 이전/다음 주 이동
  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // 해당 날짜의 일정 필터링 (역할 기반 필터 적용)
  const getSchedulesForDate = (date: Date) => {
    return filteredSchedules.filter(schedule => isSameDay(schedule.date, date));
  };

  // 주간 통계 (역할 기반 필터 적용)
  const weekStats = useMemo(() => {
    const weekSchedules = filteredSchedules.filter(s => 
      s.date >= weekStart && s.date <= weekEnd
    );
    return {
      total: weekSchedules.length,
      highRisk: weekSchedules.filter(s => s.riskLevel && ['WARNING', 'DANGER'].includes(s.riskLevel)).length,
      totalParticipants: weekSchedules.reduce((sum, s) => sum + (s.participants || 0), 0),
    };
  }, [filteredSchedules, weekStart, weekEnd]);

  const handleSubmit = useCallback(() => {
    if (!formState.isValid) {
      formState.validate();
      toast({
        title: '입력 오류',
        description: '필수 항목을 확인해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: '등록 완료',
      description: '일정이 등록되었습니다.',
    });
    setShowAddModal(false);
    formState.reset();
  }, [formState]);

  const handleScheduleClick = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    formState.setMultipleValues({
      title: schedule.title,
      date: format(schedule.date, 'yyyy-MM-dd'),
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      location: schedule.location || '',
      type: schedule.type,
      riskLevel: schedule.riskLevel || 'SAFE',
      participants: schedule.participants || 0,
      memo: schedule.memo || '',
    });
    setIsEditMode(false);
    setShowDetailModal(true);
  }, [formState]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleDetailSubmit = useCallback(() => {
    if (!formState.isValid) {
      formState.validate();
      toast({
        title: '입력 오류',
        description: '필수 항목을 확인해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: '수정 완료',
      description: '일정이 수정되었습니다.',
    });
    setShowDetailModal(false);
    setSelectedSchedule(null);
    setIsEditMode(false);
    formState.reset();
  }, [formState]);

  const handleDeleteClick = () => {
    setScheduleToDelete(selectedSchedule);
    setShowDetailModal(false);
    setTimeout(() => {
      setShowDeleteDialog(true);
    }, 100);
  };

  const handleConfirmDelete = () => {
    toast({
      title: '삭제 완료',
      description: '일정이 삭제되었습니다.',
    });
    setShowDeleteDialog(false);
    setScheduleToDelete(null);
    setSelectedSchedule(null);
    setIsEditMode(false);
  };

  const handleDetailModalClose = useCallback(() => {
    setShowDetailModal(false);
    setSelectedSchedule(null);
    setIsEditMode(false);
    formState.reset();
  }, [formState]);

  const handleAddModalOpen = useCallback(() => {
    formState.reset();
    setShowAddModal(true);
  }, [formState]);

  const handleDownloadTemplate = () => {
    // CSV 템플릿 헤더 및 예시 데이터
    const headers = ['훈련명', '부대', '날짜', '훈련유형', '시작시간', '종료시간', '장소', '참여인원'];
    const exampleRows = [
      ['K-2 소총 영점사격', '제1보병사단 1연대', '2024-12-20', '사격', '09:00', '12:00', '종합사격장', '120'],
      ['기초체력단련', '제7보병사단 신병교육대', '2024-12-21', '체력', '06:00', '08:00', '연병장', '200'],
      ['야간 기동훈련', '제3보병사단 기갑대대', '2024-12-22', '기동', '20:00', '24:00', '훈련장 A구역', '80'],
    ];

    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...exampleRows.map(row => row.join(','))
    ].join('\n');

    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '일정_일괄등록_템플릿.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: '템플릿 다운로드 완료',
      description: 'CSV 파일을 확인해주세요. 훈련유형: 사격, 기동, 전술, 체력, 교육, 점검',
    });
  };

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
        description="훈련, 행사, 점검, 회의 등 부대 일정을 관리합니다."
        actions={
          <ActionButton label="일정 추가" onClick={handleAddModalOpen} />
        }
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
                    <ScheduleCard key={schedule.id} schedule={schedule} onClick={() => handleScheduleClick(schedule)} />
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
        <span className="mr-1">위험도</span>
        {[
          { label: RISK_GRADE_LABELS.SAFE, color: 'bg-risk-safe' },
          { label: RISK_GRADE_LABELS.ATTENTION, color: 'bg-risk-attention' },
          { label: RISK_GRADE_LABELS.CAUTION, color: 'bg-risk-caution' },
          { label: RISK_GRADE_LABELS.WARNING, color: 'bg-risk-warning' },
          { label: RISK_GRADE_LABELS.DANGER, color: 'bg-risk-danger' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 px-2 py-0.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', item.color)} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 일정 추가 모달 */}
      <AddModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); formState.reset(); }}
        title="일정 추가"
        description="개별 입력 또는 엑셀 파일로 일괄 등록"
        inputTypes={[
          { id: 'single', label: '직접 입력', content: <ScheduleForm formState={formState} /> },
          { id: 'bulk', label: '일괄 등록', content: <ScheduleBulkUploadForm onDownloadTemplate={handleDownloadTemplate} /> },
        ]}
        onSubmit={handleSubmit}
        submitLabel="등록"
        isSubmitDisabled={!formState.isValid}
      />

      {/* 일정 상세/수정 모달 */}
      <AddModal
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
        title={isEditMode ? "일정 수정" : "일정 상세"}
        description={selectedSchedule?.unit || ''}
        inputTypes={[
          { id: 'detail', label: '상세 정보', content: <ScheduleForm schedule={selectedSchedule} isEditing={isEditMode} formState={formState} /> },
        ]}
        onSubmit={isEditMode ? handleDetailSubmit : undefined}
        submitLabel={isEditMode ? "저장" : undefined}
        isSubmitDisabled={isEditMode && !formState.isValid}
        footerActions={
          !isEditMode ? (
            <div className="flex gap-2 mr-auto">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                수정
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          ) : undefined
        }
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일정 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{scheduleToDelete?.title}" 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setScheduleToDelete(null);
            }}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
