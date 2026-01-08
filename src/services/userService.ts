/**
 * 사용자 서비스
 * 사용자 관련 API 호출 및 비즈니스 로직
 */

import { apiClient, ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { User, CreateUserDto, UpdateUserDto, PaginatedResponse, UserStatus, UserRole, USER_STATUS_LABELS } from '@/types/entities';
import { getUnitById, getUnitFullName } from '@/data/armyUnits';

// ============================================
// Mock 데이터 (추후 API 연동 시 제거)
// ============================================

const MOCK_USERS: User[] = [
  { id: '1', accountId: 'HQ-001', militaryId: '18-702341', name: '김철수', rank: '대령', unitId: 'hq', role: 'ROLE_HQ', status: 'ACTIVE', createdAt: '2024-01-01' },
  { id: '2', accountId: 'C1D1-001', militaryId: '17-681542', name: '이영희', rank: '준장', unitId: 'corps-1-div-1', role: 'ROLE_DIV', status: 'ACTIVE', createdAt: '2024-01-02' },
  { id: '3', accountId: 'C5D3-001', militaryId: '19-723185', name: '박민호', rank: '대령', unitId: 'corps-5-div-3', role: 'ROLE_DIV', status: 'ACTIVE', createdAt: '2024-01-03' },
  { id: '4', accountId: 'C1D9-001', militaryId: '20-751294', name: '최지훈', rank: '중령', unitId: 'corps-1-div-9', role: 'ROLE_BN', status: 'ACTIVE', createdAt: '2024-01-04' },
  { id: '5', accountId: 'C1D25-001', militaryId: '21-782456', name: '정수민', rank: '중령', unitId: 'corps-1-div-25', role: 'ROLE_BN', status: 'LOCKED', createdAt: '2024-01-05' },
  { id: '6', accountId: 'C1-001', militaryId: '16-659823', name: '홍길동', rank: '중장', unitId: 'corps-1', role: 'ROLE_DIV', status: 'ACTIVE', createdAt: '2024-01-06' },
  { id: '7', accountId: 'C2D7-001', militaryId: '22-803571', name: '김대위', rank: '대령', unitId: 'corps-2-div-7', role: 'ROLE_BN', status: 'ACTIVE', createdAt: '2024-01-07' },
  { id: '8', accountId: 'SWC-001', militaryId: '23-824693', name: '강특전', rank: '중령', unitId: 'swc-bde-sf-1', role: 'ROLE_BN', status: 'ACTIVE', createdAt: '2024-01-08' },
  { id: '9', accountId: 'GOC-001', militaryId: '15-638712', name: '이작전', rank: '대장', unitId: 'goc', role: 'ROLE_HQ', status: 'ACTIVE', createdAt: '2024-01-09' },
  { id: '10', accountId: 'C3D12-001', militaryId: '19-745821', name: '송준혁', rank: '소령', unitId: 'corps-3-div-12', role: 'ROLE_BN', status: 'ACTIVE', createdAt: '2024-01-10' },
  { id: '11', accountId: 'C2D15-001', militaryId: '20-768432', name: '윤서연', rank: '중령', unitId: 'corps-2-div-15', role: 'ROLE_DIV', status: 'DORMANT', createdAt: '2024-01-11' },
  { id: '12', accountId: 'C3D21-001', militaryId: '21-791543', name: '장민석', rank: '소령', unitId: 'corps-3-div-21', role: 'ROLE_BN', status: 'WITHDRAWN', createdAt: '2024-01-12' },
];

let mockUsers = [...MOCK_USERS];

// ============================================
// 헬퍼 함수
// ============================================

/** 부대 이름 조회 */
export const getUserUnitName = (unitId: string): string => {
  const unit = getUnitById(unitId);
  return unit?.name || unitId;
};

/** 부대 전체 경로 조회 */
export const getUserUnitFullPath = (unitId: string): string => {
  return getUnitFullName(unitId);
};

/** 역할 라벨 조회 */
export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    'ROLE_HQ': 'Super Admin',
    'ROLE_DIV': 'Admin',
    'ROLE_BN': 'User',
  };
  return labels[role] || role;
};

/** 상태 라벨 조회 */
export const getStatusLabel = (status: UserStatus): string => {
  const labels: Record<UserStatus, string> = {
    'ACTIVE': '활성',
    'LOCKED': '잠김',
    'DORMANT': '휴면',
    'WITHDRAWN': '탈퇴',
  };
  return labels[status] || status;
};

/** 상태 색상 조회 */
export const getStatusColor = (status: UserStatus): string => {
  const colors: Record<UserStatus, string> = {
    'ACTIVE': 'text-green-600',
    'LOCKED': 'text-red-600',
    'DORMANT': 'text-yellow-600',
    'WITHDRAWN': 'text-gray-600',
  };
  return colors[status] || 'text-gray-600';
};

// ============================================
// API 함수 (Mock 구현 - 추후 실제 API로 교체)
// ============================================

/**
 * 사용자 목록 조회
 */
export async function getUsers(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<User>>> {
  // Mock 지연
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...mockUsers];

  // 검색 필터
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      user =>
        user.name.toLowerCase().includes(search) ||
        user.accountId.toLowerCase().includes(search) ||
        user.militaryId.toLowerCase().includes(search) ||
        getUserUnitName(user.unitId).toLowerCase().includes(search)
    );
  }

  // 상태 필터
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(user => user.status === filters.status);
  }

  // 부대 필터
  if (filters?.unitId) {
    filtered = filtered.filter(user => user.unitId === filters.unitId);
  }

  // 페이지네이션
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: {
      items,
      pagination: { page, pageSize, total, totalPages },
    },
  };
}

/**
 * 사용자 상세 조회
 */
export async function getUser(id: string): Promise<ApiResponse<User>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  return { success: true, data: user };
}

/**
 * 사용자 생성
 */
export async function createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newUser: User = {
    id: Date.now().toString(),
    ...data,
    role: data.role || 'ROLE_BN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  mockUsers = [...mockUsers, newUser];

  return { success: true, data: newUser };
}

/**
 * 사용자 수정
 */
export async function updateUser(id: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  const updatedUser: User = {
    ...mockUsers[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockUsers = mockUsers.map((u, i) => (i === index ? updatedUser : u));

  return { success: true, data: updatedUser };
}

/**
 * 사용자 삭제
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  mockUsers = mockUsers.filter(u => u.id !== id);

  return { success: true, data: undefined };
}

/**
 * 사용자 비밀번호 초기화
 */
export async function resetUserPassword(id: string): Promise<ApiResponse<{ tempPassword: string }>> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  // Mock: 임시 비밀번호 생성
  const tempPassword = Math.random().toString(36).slice(-8) + '!1';

  return { success: true, data: { tempPassword } };
}

/**
 * 사용자 일괄 등록
 */
export async function bulkCreateUsers(file: File): Promise<ApiResponse<{ created: number; failed: number; errors: string[] }>> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock: 파일 처리 시뮬레이션
  return {
    success: true,
    data: {
      created: 5,
      failed: 1,
      errors: ['3행: 군번 형식 오류'],
    },
  };
}

// ============================================
// 통계 함수
// ============================================

export interface UserStats {
  total: number;
  active: number;
  locked: number;
  dormant: number;
  withdrawn: number;
  byRole: Record<string, number>;
  byUnit: Record<string, number>;
}

/**
 * 사용자 통계 조회
 */
export async function getUserStats(): Promise<ApiResponse<UserStats>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const stats: UserStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'ACTIVE').length,
    locked: mockUsers.filter(u => u.status === 'LOCKED').length,
    dormant: mockUsers.filter(u => u.status === 'DORMANT').length,
    withdrawn: mockUsers.filter(u => u.status === 'WITHDRAWN').length,
    byRole: mockUsers.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byUnit: mockUsers.reduce((acc, u) => {
      const unitName = getUserUnitName(u.unitId);
      acc[unitName] = (acc[unitName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return { success: true, data: stats };
}
