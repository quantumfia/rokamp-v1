/**
 * 공지사항 서비스
 * 공지사항 및 사고 사례 관련 API 호출
 */

import type { ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { Notice, Incident, CreateNoticeDto, UpdateNoticeDto, CreateIncidentDto, UpdateIncidentDto, PaginatedResponse } from '@/types/entities';

// ============================================
// Mock 데이터
// ============================================

const MOCK_NOTICES: Notice[] = [
  { 
    id: '1', 
    title: '동절기 안전수칙 강화 안내', 
    content: '동절기 안전수칙을 강화하오니 각 부대에서는 철저히 준수하시기 바랍니다.\n\n1. 난방기구 사용 시 화재 예방\n2. 결빙 구역 미끄럼 주의\n3. 저체온증 예방 조치',
    target: 'all', 
    targetLabel: '전체',
    hasVideo: true,
    hasAttachment: true,
    author: '김철수 대령',
    authorId: '1',
    status: 'active',
    createdAt: '2024-12-13',
  },
  { 
    id: '2', 
    title: '시스템 정기점검 안내 (12/20)', 
    content: '시스템 정기점검이 예정되어 있습니다.\n\n점검일시: 2024년 12월 20일 02:00 ~ 06:00\n점검내용: 서버 업데이트 및 보안 패치',
    target: 'all', 
    targetLabel: '전체',
    hasVideo: false,
    hasAttachment: false,
    author: '김철수 대령',
    authorId: '1',
    status: 'active',
    createdAt: '2024-12-10',
  },
  { 
    id: '3', 
    title: '야외훈련 간 사고예방 1분 안전학습', 
    content: '야외훈련 시 안전사고 예방을 위한 1분 안전학습 자료입니다.',
    target: 'division', 
    targetLabel: '제32보병사단',
    hasVideo: true,
    hasAttachment: true,
    author: '이영희 준장',
    authorId: '2',
    status: 'active',
    createdAt: '2024-12-08',
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: '군용 차량 빙판길 미끄러짐, 운전병 경상',
    description: '새벽 이동 간 결빙 구간에서 군용 트럭 미끄러짐 발생. 운전병 경미한 타박상으로 의무대 치료 후 복귀.',
    incidentDate: '2026-01-05',
    location: '제3보병사단 이동로',
    category: '교통',
    severity: 'medium',
    author: '김준혁 대위',
    authorId: '1',
    createdAt: '2026-01-05',
  },
  {
    id: '2',
    title: 'GOP 경계근무 중 동상 발생, 의무대 후송',
    description: 'GOP 철책 경계근무 중 장시간 노출로 인한 2도 동상 발생. 의무대 후송 후 치료 중.',
    incidentDate: '2026-01-04',
    location: '제22보병사단 GOP',
    category: '한랭질환',
    severity: 'high',
    author: '박성민 중위',
    authorId: '2',
    createdAt: '2026-01-04',
  },
  {
    id: '3',
    title: '생활관 전열기 과부하로 연기 발생, 조기 진화',
    description: '생활관 내 비인가 전열기 사용으로 콘센트 과부하 발생. 연기 감지 후 조기 진화, 인명피해 없음.',
    incidentDate: '2026-01-03',
    location: '제1기갑여단 생활관',
    category: '화재',
    severity: 'medium',
    author: '이동훈 상사',
    authorId: '3',
    createdAt: '2026-01-03',
  },
  {
    id: '4',
    title: '정비창 중량물 낙하, 정비병 골절상 후송',
    description: '정비창 작업 중 장비 부품 낙하로 정비병 발목 골절. 국군병원 후송 치료 중.',
    incidentDate: '2026-01-02',
    location: '제8기계화사단 정비창',
    category: '훈련',
    severity: 'high',
    author: '정현우 준위',
    authorId: '4',
    createdAt: '2026-01-02',
  },
  {
    id: '5',
    title: '혹한기 완전군장 행군 중 저체온증 발생',
    description: '행군 훈련 중 저체온증 초기 증상 발생. 현장 응급조치 후 의무대 이송, 회복 후 복귀.',
    incidentDate: '2026-01-01',
    location: '제5보병사단 훈련장',
    category: '한랭질환',
    severity: 'medium',
    author: '최재원 대위',
    authorId: '5',
    createdAt: '2026-01-01',
  },
];

let mockNotices = [...MOCK_NOTICES];
let mockIncidents = [...MOCK_INCIDENTS];

// ============================================
// 공지사항 API
// ============================================

/**
 * 공지사항 목록 조회
 */
export async function getNotices(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<Notice>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockNotices];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      notice =>
        notice.title.toLowerCase().includes(search) ||
        notice.content.toLowerCase().includes(search) ||
        notice.author.toLowerCase().includes(search)
    );
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(notice => notice.status === filters.status);
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
 * 공지사항 상세 조회
 */
export async function getNotice(id: string): Promise<ApiResponse<Notice>> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const notice = mockNotices.find(n => n.id === id);
  if (!notice) throw new Error('공지사항을 찾을 수 없습니다.');
  
  return { success: true, data: notice };
}

/**
 * 공지사항 생성
 */
export async function createNotice(data: CreateNoticeDto): Promise<ApiResponse<Notice>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newNotice: Notice = {
    id: Date.now().toString(),
    title: data.title,
    content: data.content,
    target: data.target,
    videoUrl: data.videoUrl,
    attachments: data.attachments?.map((a, i) => ({ ...a, id: `new-${i}` })),
    targetLabel: data.target === 'all' ? '전체' : data.target,
    hasVideo: !!data.videoUrl,
    hasAttachment: !!data.attachments?.length,
    author: '현재 사용자',
    authorId: 'current',
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
  };

  mockNotices = [newNotice, ...mockNotices];

  return { success: true, data: newNotice };
}

/**
 * 공지사항 수정
 */
export async function updateNotice(id: string, data: UpdateNoticeDto): Promise<ApiResponse<Notice>> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockNotices.findIndex(n => n.id === id);
  if (index === -1) throw new Error('공지사항을 찾을 수 없습니다.');

  const updated: Notice = {
    ...mockNotices[index],
    title: data.title ?? mockNotices[index].title,
    content: data.content ?? mockNotices[index].content,
    target: data.target ?? mockNotices[index].target,
    videoUrl: data.videoUrl ?? mockNotices[index].videoUrl,
    attachments: data.attachments?.map((a, i) => ({ ...a, id: `upd-${i}` })) ?? mockNotices[index].attachments,
    status: data.status ?? mockNotices[index].status,
    targetLabel: data.target === 'all' ? '전체' : (data.target || mockNotices[index].targetLabel),
    hasVideo: data.videoUrl !== undefined ? !!data.videoUrl : mockNotices[index].hasVideo,
    hasAttachment: data.attachments !== undefined ? !!data.attachments?.length : mockNotices[index].hasAttachment,
    updatedAt: new Date().toISOString(),
  };

  mockNotices = mockNotices.map((n, i) => (i === index ? updated : n));

  return { success: true, data: updated };
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(id: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockNotices.findIndex(n => n.id === id);
  if (index === -1) throw new Error('공지사항을 찾을 수 없습니다.');

  mockNotices = mockNotices.filter(n => n.id !== id);

  return { success: true, data: undefined };
}

// ============================================
// 사고 사례 API
// ============================================

/**
 * 사고 사례 목록 조회
 */
export async function getIncidents(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<Incident>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockIncidents];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      incident =>
        incident.title.toLowerCase().includes(search) ||
        incident.description.toLowerCase().includes(search) ||
        incident.location.toLowerCase().includes(search)
    );
  }

  if (filters?.severity) {
    filtered = filtered.filter(incident => incident.severity === filters.severity);
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
 * 사고 사례 상세 조회
 */
export async function getIncident(id: string): Promise<ApiResponse<Incident>> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const incident = mockIncidents.find(i => i.id === id);
  if (!incident) throw new Error('사고 사례를 찾을 수 없습니다.');
  
  return { success: true, data: incident };
}

/**
 * 사고 사례 생성
 */
export async function createIncident(data: CreateIncidentDto): Promise<ApiResponse<Incident>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newIncident: Incident = {
    id: Date.now().toString(),
    ...data,
    author: '현재 사용자',
    authorId: 'current',
    createdAt: new Date().toISOString().split('T')[0],
  };

  mockIncidents = [newIncident, ...mockIncidents];

  return { success: true, data: newIncident };
}

/**
 * 사고 사례 수정
 */
export async function updateIncident(id: string, data: UpdateIncidentDto): Promise<ApiResponse<Incident>> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockIncidents.findIndex(i => i.id === id);
  if (index === -1) throw new Error('사고 사례를 찾을 수 없습니다.');

  const updated: Incident = {
    ...mockIncidents[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockIncidents = mockIncidents.map((i, idx) => (idx === index ? updated : i));

  return { success: true, data: updated };
}

/**
 * 사고 사례 삭제
 */
export async function deleteIncident(id: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockIncidents.findIndex(i => i.id === id);
  if (index === -1) throw new Error('사고 사례를 찾을 수 없습니다.');

  mockIncidents = mockIncidents.filter(i => i.id !== id);

  return { success: true, data: undefined };
}

// ============================================
// 헬퍼 함수
// ============================================

export const getSeverityLabel = (severity: 'low' | 'medium' | 'high'): string => {
  const labels = { low: '경미', medium: '보통', high: '심각' };
  return labels[severity];
};

export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  const colors = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' };
  return colors[severity];
};
