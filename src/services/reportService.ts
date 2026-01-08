/**
 * 보고서 서비스
 * 사고 보고서 및 통계 보고서 관련 API 호출
 */

import type { ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { AccidentReport, StatisticsReport, PaginatedResponse, PersonInvolved } from '@/types/entities';

// ============================================
// 상수
// ============================================

export const CATEGORY_LABELS: Record<string, string> = {
  military_discipline: '군기사고',
  safety: '안전사고',
  crime: '범죄사고',
  other: '기타',
  assault: '폭행사고',
  other_discipline: '기타군기사고',
  training: '훈련사고',
  vehicle: '차량사고',
  equipment: '장비사고',
  theft: '절도',
  fraud: '사기',
  sexual: '성범죄',
};

export const ROLE_LABELS: Record<string, string> = {
  suspect: '피의자',
  victim: '피해자',
  injured: '사고자',
  witness: '목격자',
};

export const RANKS = ['이등병', '일등병', '상등병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령', '준장', '소장', '중장', '대장'];
export const ENLISTMENT_TYPES = ['현역', '보충역', '장교', '부사관'];
export const WORK_TYPES = ['근무중', '휴가중', '외출중', '외박중', '훈련중'];

// ============================================
// Mock 데이터
// ============================================

const MOCK_ACCIDENT_REPORTS: AccidentReport[] = [
  {
    id: '1',
    unitId: 'hq',
    title: '야간 훈련 중 병사 부상 사고',
    date: '2024-12-12',
    time: '14:30',
    location: '훈련장',
    locationDetail: 'outside',
    specificPlace: 'A구역',
    categoryMajor: 'safety',
    categoryMiddle: 'training',
    overview: '야간 훈련 중 병사가 장애물에 걸려 넘어짐',
    personsInvolved: [
      { id: '1', role: 'injured', isMilitary: true, name: '김철수', rank: '일등병', unit: '제1사단' }
    ],
    militaryDeaths: 0,
    civilianDeaths: 0,
    militaryInjuries: 1,
    civilianInjuries: 0,
    alcoholInvolved: false,
    reporter: '이영희',
    reporterRank: '대위',
    reporterContact: '010-1234-5678',
    status: 'REQUESTED',
    createdAt: '2024-12-12',
  },
];

const MOCK_STATISTICS_REPORTS: StatisticsReport[] = [
  {
    id: '1',
    title: '2024년 12월 2주차 안전사고 통계',
    period: '2024.12.08 ~ 2024.12.14',
    unitId: 'hq',
    unitName: '육군본부',
    type: 'weekly',
    status: 'APPROVED',
    author: '김철수 대령',
    summary: '이번 주 안전사고 발생 건수 12건',
    createdAt: '2024-12-14',
  },
  {
    id: '2',
    title: '2024년 11월 월간 안전사고 통계',
    period: '2024.11.01 ~ 2024.11.30',
    unitId: 'hq',
    unitName: '육군본부',
    type: 'monthly',
    status: 'APPROVED',
    author: '김철수 대령',
    createdAt: '2024-12-01',
  },
];

let mockAccidentReports = [...MOCK_ACCIDENT_REPORTS];
let mockStatisticsReports = [...MOCK_STATISTICS_REPORTS];

// ============================================
// 사고 보고서 API
// ============================================

/**
 * 사고 보고서 목록 조회
 */
export async function getAccidentReports(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<AccidentReport>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockAccidentReports];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      report =>
        report.overview.toLowerCase().includes(search) ||
        report.location.toLowerCase().includes(search)
    );
  }

  if (filters?.status) {
    filtered = filtered.filter(report => report.status === filters.status);
  }

  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;
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
 * 사고 보고서 상세 조회
 */
export async function getAccidentReport(id: string): Promise<ApiResponse<AccidentReport>> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const report = mockAccidentReports.find(r => r.id === id);
  if (!report) throw new Error('보고서를 찾을 수 없습니다.');
  
  return { success: true, data: report };
}

/**
 * 사고 보고서 생성
 */
export async function createAccidentReport(data: Partial<AccidentReport>): Promise<ApiResponse<AccidentReport>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newReport: AccidentReport = {
    id: Date.now().toString(),
    date: data.date || '',
    time: data.time || '',
    location: data.location || '',
    locationDetail: data.locationDetail || 'inside',
    specificPlace: data.specificPlace || '',
    categoryMajor: data.categoryMajor || '',
    categoryMiddle: data.categoryMiddle,
    categoryMinor: data.categoryMinor,
    cause: data.cause,
    overview: data.overview || '',
    personsInvolved: data.personsInvolved || [],
    militaryDeaths: data.militaryDeaths || 0,
    civilianDeaths: data.civilianDeaths || 0,
    militaryInjuries: data.militaryInjuries || 0,
    civilianInjuries: data.civilianInjuries || 0,
    militaryDamage: data.militaryDamage,
    civilianDamage: data.civilianDamage,
    alcoholInvolved: data.alcoholInvolved || false,
    crimeTool: data.crimeTool,
    workType: data.workType,
    actionsTaken: data.actionsTaken,
    reporter: data.reporter || '',
    reporterRank: data.reporterRank || '',
    reporterContact: data.reporterContact,
    generatedContent: data.generatedContent,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };

  mockAccidentReports = [...mockAccidentReports, newReport];

  return { success: true, data: newReport };
}

/**
 * AI 보고서 생성
 */
export async function generateReport(formData: Partial<AccidentReport>): Promise<ApiResponse<string>> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const categoryLabel = `${CATEGORY_LABELS[formData.categoryMajor || ''] || formData.categoryMajor}`;
  
  const personsSection = formData.personsInvolved?.length 
    ? formData.personsInvolved.map((p, i) => {
        const roleLabel = ROLE_LABELS[p.role] || p.role;
        if (p.isMilitary) {
          return `    ${i + 1}) ${roleLabel}: ${p.rank} ${p.name} (${p.unit})`;
        } else {
          return `    ${i + 1}) ${roleLabel}: ${p.name} (민간인)`;
        }
      }).join('\n')
    : '    (관련자 정보 없음)';

  const content = `1. 사고 개요
  가. 발생 일시: ${formData.date} ${formData.time || '시간 미상'}
  나. 발생 장소: ${formData.location} (${formData.locationDetail === 'inside' ? '영내' : '영외'})
  다. 사고 유형: ${categoryLabel}

2. 관련자 현황
${personsSection}

3. 사고 경위
${formData.overview || '(내용 없음)'}

4. 조치 사항
${formData.actionsTaken || '  (조치 사항 기록 필요)'}

5. 보고자
  ${formData.reporterRank} ${formData.reporter} (${formData.reporterContact || '연락처 미기재'})

※ 본 보고서는 AI가 생성한 초안이며, 실제 내용은 담당자가 확인 후 수정하시기 바랍니다.`;

  return { success: true, data: content };
}

// ============================================
// 통계 보고서 API
// ============================================

/**
 * 통계 보고서 목록 조회
 */
export async function getStatisticsReports(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<StatisticsReport>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockStatisticsReports];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      report =>
        report.title.toLowerCase().includes(search) ||
        report.unitName.toLowerCase().includes(search)
    );
  }

  if (filters?.type) {
    filtered = filtered.filter(report => report.type === filters.type);
  }

  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;
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
 * 통계 보고서 생성 (자동)
 */
export async function generateStatisticsReport(
  type: 'weekly' | 'monthly',
  unitId: string
): Promise<ApiResponse<StatisticsReport>> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const now = new Date();
  const typeLabel = type === 'weekly' ? '주간' : '월간';
  
  const newReport: StatisticsReport = {
    id: Date.now().toString(),
    title: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${typeLabel} 안전사고 통계`,
    period: type === 'weekly' 
      ? `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate() - 6} ~ ${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`
      : `${now.getFullYear()}.${now.getMonth() + 1}.01 ~ ${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`,
    unitId,
    unitName: '육군본부',
    type,
    status: 'DRAFT',
    author: '시스템 자동생성',
    createdAt: new Date().toISOString(),
  };

  mockStatisticsReports = [...mockStatisticsReports, newReport];

  return { success: true, data: newReport };
}

// ============================================
// 헬퍼 함수
// ============================================

export const getCategoryLabel = (major: string, middle?: string, minor?: string): string => {
  const parts = [CATEGORY_LABELS[major] || major];
  if (middle) parts.push(CATEGORY_LABELS[middle] || middle);
  if (minor) parts.push(minor);
  return parts.join(' > ');
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: '초안',
    submitted: '제출됨',
    approved: '승인됨',
    rejected: '반려됨',
    final: '최종',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'text-muted-foreground',
    submitted: 'text-blue-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    final: 'text-green-600',
  };
  return colors[status] || 'text-muted-foreground';
};
