/**
 * 일정 관리 서비스
 * 훈련 일정 관련 API 호출
 */

import type { ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { TrainingSchedule, CreateTrainingScheduleDto, UpdateTrainingScheduleDto, PaginatedResponse, TrainingType, RiskGrade, RISK_GRADE_LABELS } from '@/types/entities';
import { format } from 'date-fns';

// ============================================
// Mock 데이터
// ============================================

const generateMockSchedules = (): TrainingSchedule[] => {
  const baseDate = new Date();
  return [
    {
      id: '1',
      name: 'K-2 소총 영점사격',
      unit: '제1보병사단 1연대',
      unitId: 'corps-1-div-1',
      startDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1), 'yyyy-MM-dd'),
      endDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '12:00',
      location: '종합사격장',
      type: '사격',
      riskLevel: 'DANGER',
      participants: 120,
      createdAt: '2024-12-01',
    },
    {
      id: '2',
      name: '기초체력단련',
      unit: '제7보병사단 신병교육대',
      unitId: 'corps-7-div-1',
      startDate: format(baseDate, 'yyyy-MM-dd'),
      endDate: format(baseDate, 'yyyy-MM-dd'),
      startTime: '06:00',
      endTime: '08:00',
      location: '연병장',
      type: '체력',
      riskLevel: 'SAFE',
      participants: 200,
      createdAt: '2024-12-02',
    },
    {
      id: '3',
      name: '동절기 차량정비 점검',
      unit: '수도기계화보병사단',
      unitId: 'capital-div',
      startDate: format(baseDate, 'yyyy-MM-dd'),
      endDate: format(baseDate, 'yyyy-MM-dd'),
      startTime: '14:00',
      endTime: '17:00',
      location: '정비창',
      type: '점검',
      riskLevel: 'CAUTION',
      participants: 45,
      createdAt: '2024-12-03',
    },
    {
      id: '4',
      name: '야간 기동훈련',
      unit: '제3보병사단 기갑대대',
      unitId: 'corps-3-div-1',
      startDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1), 'yyyy-MM-dd'),
      endDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1), 'yyyy-MM-dd'),
      startTime: '20:00',
      endTime: '24:00',
      location: '훈련장 A구역',
      type: '기동',
      riskLevel: 'WARNING',
      participants: 80,
      createdAt: '2024-12-04',
    },
    {
      id: '5',
      name: '안전교육 (동절기 안전수칙)',
      unit: '제5보병사단',
      unitId: 'corps-5-div-1',
      startDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 2), 'yyyy-MM-dd'),
      endDate: format(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 2), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '12:00',
      location: '대강당',
      type: '교육',
      riskLevel: 'SAFE',
      participants: 300,
      createdAt: '2024-12-05',
    },
  ];
};

let mockSchedules: TrainingSchedule[] = generateMockSchedules();

// ============================================
// API 함수
// ============================================

/**
 * 훈련 일정 목록 조회
 */
export async function getSchedules(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<TrainingSchedule>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockSchedules];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      schedule =>
        schedule.name.toLowerCase().includes(search) ||
        schedule.unit.toLowerCase().includes(search) ||
        (schedule.location || '').toLowerCase().includes(search)
    );
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter(schedule => schedule.startDate >= filters.dateFrom!);
  }

  if (filters?.dateTo) {
    filtered = filtered.filter(schedule => schedule.endDate <= filters.dateTo!);
  }

  if (filters?.unitId) {
    filtered = filtered.filter(schedule => schedule.unitId === filters.unitId);
  }

  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 50;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: { items, pagination: { page, pageSize, total, totalPages } },
  };
}

/**
 * 특정 기간 일정 조회 (주간 뷰용)
 */
export async function getSchedulesByDateRange(
  startDate: string,
  endDate: string,
  unitIds?: string[]
): Promise<ApiResponse<TrainingSchedule[]>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  let filtered = mockSchedules.filter(
    schedule => schedule.startDate >= startDate && schedule.endDate <= endDate
  );

  if (unitIds?.length) {
    filtered = filtered.filter(schedule => unitIds.includes(schedule.unitId));
  }

  return { success: true, data: filtered };
}

/**
 * 일정 상세 조회
 */
export async function getSchedule(id: string): Promise<ApiResponse<TrainingSchedule>> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const schedule = mockSchedules.find(s => s.id === id);
  if (!schedule) throw new Error('일정을 찾을 수 없습니다.');
  
  return { success: true, data: schedule };
}

/**
 * 일정 생성
 */
export async function createSchedule(data: CreateTrainingScheduleDto): Promise<ApiResponse<TrainingSchedule>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newSchedule: TrainingSchedule = {
    id: Date.now().toString(),
    ...data,
    unit: data.unitId, // 실제로는 부대명 조회
    riskLevel: data.riskLevel || 'CAUTION',
    participants: data.participants || 0,
    createdAt: new Date().toISOString(),
  };

  mockSchedules = [...mockSchedules, newSchedule];

  return { success: true, data: newSchedule };
}

/**
 * 일정 수정
 */
export async function updateSchedule(id: string, data: UpdateTrainingScheduleDto): Promise<ApiResponse<TrainingSchedule>> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockSchedules.findIndex(s => s.id === id);
  if (index === -1) throw new Error('일정을 찾을 수 없습니다.');

  const updated: TrainingSchedule = {
    ...mockSchedules[index],
    ...data,
    unit: data.unitId || mockSchedules[index].unit,
    updatedAt: new Date().toISOString(),
  };

  mockSchedules = mockSchedules.map((s, i) => (i === index ? updated : s));

  return { success: true, data: updated };
}

/**
 * 일정 삭제
 */
export async function deleteSchedule(id: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockSchedules.findIndex(s => s.id === id);
  if (index === -1) throw new Error('일정을 찾을 수 없습니다.');

  mockSchedules = mockSchedules.filter(s => s.id !== id);

  return { success: true, data: undefined };
}

/**
 * 일정 일괄 등록
 */
export async function bulkCreateSchedules(file: File): Promise<ApiResponse<{ created: number; failed: number; errors: string[] }>> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    data: {
      created: 10,
      failed: 2,
      errors: ['3행: 날짜 형식 오류', '7행: 훈련유형 오류'],
    },
  };
}

// ============================================
// 통계 함수
// ============================================

export interface ScheduleStats {
  total: number;
  highRisk: number;
  totalParticipants: number;
  byType: Record<TrainingType, number>;
  byRiskLevel: Record<RiskGrade, number>;
}

/**
 * 기간별 일정 통계
 */
export async function getScheduleStats(startDate: string, endDate: string): Promise<ApiResponse<ScheduleStats>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const filtered = mockSchedules.filter(
    s => s.startDate >= startDate && s.endDate <= endDate
  );

  const stats: ScheduleStats = {
    total: filtered.length,
    highRisk: filtered.filter(s => s.riskLevel === 'DANGER' || s.riskLevel === 'WARNING').length,
    totalParticipants: filtered.reduce((sum, s) => sum + (s.participants || 0), 0),
    byType: filtered.reduce((acc, s) => {
      if (s.type) {
        acc[s.type] = (acc[s.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<TrainingType, number>),
    byRiskLevel: filtered.reduce((acc, s) => {
      acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<RiskGrade, number>),
  };

  return { success: true, data: stats };
}

// ============================================
// 헬퍼 함수
// ============================================

export const typeAccentColors: Record<TrainingType, string> = {
  '사격': 'border-l-red-400',
  '기동': 'border-l-amber-400',
  '전술': 'border-l-violet-400',
  '체력': 'border-l-emerald-400',
  '교육': 'border-l-sky-400',
  '점검': 'border-l-slate-400',
};

export const typeDotColors: Record<TrainingType, string> = {
  '사격': 'bg-red-400',
  '기동': 'bg-amber-400',
  '전술': 'bg-violet-400',
  '체력': 'bg-emerald-400',
  '교육': 'bg-sky-400',
  '점검': 'bg-slate-400',
};

export const riskLevelLabels: Record<RiskGrade, string> = {
  'SAFE': '안전',
  'ATTENTION': '관심',
  'CAUTION': '주의',
  'WARNING': '경계',
  'DANGER': '심각',
};

export const riskLevelColors: Record<RiskGrade, string> = {
  'SAFE': 'text-green-600',
  'ATTENTION': 'text-blue-600',
  'CAUTION': 'text-yellow-600',
  'WARNING': 'text-orange-600',
  'DANGER': 'text-red-600',
};

export const riskLevelBgColors: Record<RiskGrade, string> = {
  'SAFE': 'bg-green-100',
  'ATTENTION': 'bg-blue-100',
  'CAUTION': 'bg-yellow-100',
  'WARNING': 'bg-orange-100',
  'DANGER': 'bg-red-100',
};
