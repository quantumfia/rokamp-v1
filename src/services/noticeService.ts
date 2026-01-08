/**
 * 공지사항 서비스
 * 공지사항 및 사고 사례 관련 API 호출
 */

import type { ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { 
  Notice, 
  Incident, 
  CreateNoticeDto, 
  UpdateNoticeDto, 
  CreateIncidentDto, 
  UpdateIncidentDto, 
  PaginatedResponse,
  IncidentSeverity,
  LocationType,
  INCIDENT_SEVERITY_LABELS,
  LOCATION_TYPE_LABELS
} from '@/types/entities';

// ============================================
// Mock 데이터
// ============================================

const MOCK_NOTICES: Notice[] = [
  { 
    id: '1', 
    title: '동절기 안전수칙 강화 안내', 
    content: '동절기 안전수칙을 강화하오니 각 부대에서는 철저히 준수하시기 바랍니다.\n\n1. 난방기구 사용 시 화재 예방\n2. 결빙 구역 미끄럼 주의\n3. 저체온증 예방 조치',
    targetUnitId: null, 
    targetLabel: '전체',
    isPopup: true,
    hasVideo: true,
    hasAttachment: true,
    viewCount: 245,
    startAt: '2024-12-01',
    endAt: '2025-02-28',
    author: '김철수 대령',
    authorId: '1',
    status: 'active',
    createdAt: '2024-12-13',
  },
  { 
    id: '2', 
    title: '시스템 정기점검 안내 (12/20)', 
    content: '시스템 정기점검이 예정되어 있습니다.\n\n점검일시: 2024년 12월 20일 02:00 ~ 06:00\n점검내용: 서버 업데이트 및 보안 패치',
    targetUnitId: null, 
    targetLabel: '전체',
    isPopup: false,
    hasVideo: false,
    hasAttachment: false,
    viewCount: 128,
    startAt: '2024-12-10',
    endAt: '2024-12-21',
    author: '김철수 대령',
    authorId: '1',
    status: 'active',
    createdAt: '2024-12-10',
  },
  { 
    id: '3', 
    title: '야외훈련 간 사고예방 1분 안전학습', 
    content: '야외훈련 시 안전사고 예방을 위한 1분 안전학습 자료입니다.',
    targetUnitId: 'soc-2-div-32', 
    targetLabel: '제32보병사단',
    isPopup: false,
    hasVideo: true,
    hasAttachment: true,
    viewCount: 89,
    startAt: '2024-12-08',
    endAt: '2025-01-31',
    author: '이영희 준장',
    authorId: '2',
    status: 'active',
    createdAt: '2024-12-08',
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    incidentNo: 'INC-2026-0005',
    occurredAt: '2026-01-05T06:30:00',
    unitId: 'corps-3-div-12',
    typeLarge: '안전사고',
    typeMedium: '교통사고',
    rankCode: 'PVT',
    severity: 'SERIOUS',
    locationType: 'OUT_BASE',
    description: '새벽 이동 간 결빙 구간에서 군용 트럭 미끄러짐 발생. 운전병 경미한 타박상으로 의무대 치료 후 복귀.',
    casualties: { militaryDeaths: 0, civilianDeaths: 0, militaryInjuries: 1, civilianInjuries: 0 },
    author: '김준혁 대위',
    authorId: '1',
    createdAt: '2026-01-05',
  },
  {
    id: '2',
    incidentNo: 'INC-2026-0004',
    occurredAt: '2026-01-04T22:15:00',
    unitId: 'corps-3-div-22',
    typeLarge: '안전사고',
    typeMedium: '한랭질환',
    rankCode: 'CPL',
    severity: 'CRITICAL',
    locationType: 'IN_BASE',
    description: 'GOP 철책 경계근무 중 장시간 노출로 인한 2도 동상 발생. 의무대 후송 후 치료 중.',
    casualties: { militaryDeaths: 0, civilianDeaths: 0, militaryInjuries: 1, civilianInjuries: 0 },
    author: '박성민 중위',
    authorId: '2',
    createdAt: '2026-01-04',
  },
  {
    id: '3',
    incidentNo: 'INC-2026-0003',
    occurredAt: '2026-01-03T14:45:00',
    unitId: 'corps-1-bde-armor-2',
    typeLarge: '안전사고',
    typeMedium: '화재사고',
    rankCode: 'SGT',
    severity: 'MINOR',
    locationType: 'IN_BASE',
    description: '생활관 내 비인가 전열기 사용으로 콘센트 과부하 발생. 연기 감지 후 조기 진화, 인명피해 없음.',
    author: '이동훈 상사',
    authorId: '3',
    createdAt: '2026-01-03',
  },
  {
    id: '4',
    incidentNo: 'INC-2026-0002',
    occurredAt: '2026-01-02T10:20:00',
    unitId: 'corps-7-div-8',
    typeLarge: '안전사고',
    typeMedium: '작업사고',
    rankCode: 'PFC',
    severity: 'CRITICAL',
    locationType: 'IN_BASE',
    description: '정비창 작업 중 장비 부품 낙하로 정비병 발목 골절. 국군병원 후송 치료 중.',
    casualties: { militaryDeaths: 0, civilianDeaths: 0, militaryInjuries: 1, civilianInjuries: 0 },
    author: '정현우 준위',
    authorId: '4',
    createdAt: '2026-01-02',
  },
  {
    id: '5',
    incidentNo: 'INC-2026-0001',
    occurredAt: '2026-01-01T08:00:00',
    unitId: 'corps-5-div-5',
    typeLarge: '안전사고',
    typeMedium: '한랭질환',
    rankCode: 'PVT',
    severity: 'SERIOUS',
    locationType: 'TRAINING_SITE',
    description: '행군 훈련 중 저체온증 초기 증상 발생. 현장 응급조치 후 의무대 이송, 회복 후 복귀.',
    casualties: { militaryDeaths: 0, civilianDeaths: 0, militaryInjuries: 1, civilianInjuries: 0 },
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
  
  // 조회수 증가
  notice.viewCount = (notice.viewCount || 0) + 1;
  
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
    targetUnitId: data.targetUnitId,
    videoUrls: data.videoUrls,
    videoUrl: data.videoUrl,
    attachments: data.attachments?.map((a, i) => ({ ...a, id: `new-${i}` })),
    targetLabel: data.targetUnitId ? data.targetUnitId : '전체',
    isPopup: data.isPopup || false,
    hasVideo: !!(data.videoUrls && data.videoUrls.length > 0) || !!data.videoUrl,
    hasAttachment: !!data.attachments?.length,
    startAt: data.startAt,
    endAt: data.endAt,
    viewCount: 0,
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
    targetUnitId: data.targetUnitId ?? mockNotices[index].targetUnitId,
    videoUrls: data.videoUrls ?? mockNotices[index].videoUrls,
    videoUrl: data.videoUrl ?? mockNotices[index].videoUrl,
    attachments: data.attachments?.map((a, i) => ({ ...a, id: `upd-${i}` })) ?? mockNotices[index].attachments,
    status: data.status ?? mockNotices[index].status,
    isPopup: data.isPopup ?? mockNotices[index].isPopup,
    startAt: data.startAt ?? mockNotices[index].startAt,
    endAt: data.endAt ?? mockNotices[index].endAt,
    targetLabel: data.targetUnitId === null ? '전체' : (data.targetUnitId || mockNotices[index].targetLabel),
    hasVideo: data.videoUrls !== undefined ? !!(data.videoUrls && data.videoUrls.length > 0) : mockNotices[index].hasVideo,
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
        incident.incidentNo.toLowerCase().includes(search) ||
        incident.typeLarge.toLowerCase().includes(search) ||
        incident.typeMedium.toLowerCase().includes(search) ||
        (incident.description || '').toLowerCase().includes(search)
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

  const incidentNo = `INC-${new Date().getFullYear()}-${String(mockIncidents.length + 1).padStart(4, '0')}`;

  const newIncident: Incident = {
    id: Date.now().toString(),
    incidentNo,
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

export const getSeverityLabel = (severity: IncidentSeverity): string => {
  const labels: Record<IncidentSeverity, string> = {
    'MINOR': '경미',
    'SERIOUS': '중상',
    'CRITICAL': '치명',
    'CATASTROPHIC': '재난',
  };
  return labels[severity];
};

export const getSeverityColor = (severity: IncidentSeverity): string => {
  const colors: Record<IncidentSeverity, string> = {
    'MINOR': 'text-green-600',
    'SERIOUS': 'text-yellow-600',
    'CRITICAL': 'text-orange-600',
    'CATASTROPHIC': 'text-red-600',
  };
  return colors[severity];
};

export const getLocationTypeLabel = (locationType: LocationType): string => {
  const labels: Record<LocationType, string> = {
    'IN_BASE': '영내',
    'OUT_BASE': '영외',
    'TRAINING_SITE': '훈련장',
    'OPERATION': '작전지역',
    'VACATION': '휴가/외박 중',
  };
  return labels[locationType];
};
