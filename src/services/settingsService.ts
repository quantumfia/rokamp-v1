/**
 * 시스템 설정 서비스
 * IP 접근 제어, 감사 로그 관련 API 호출
 */

import type { ApiResponse, PaginationParams, FilterParams } from '@/lib/apiClient';
import type { AllowedIP, AuditLog, PaginatedResponse } from '@/types/entities';

// ============================================
// Mock 데이터
// ============================================

const MOCK_ALLOWED_IPS: AllowedIP[] = [
  { id: '1', ipAddress: '10.10.0.0/16', unitName: '육군본부', createdAt: '2024-01-01' },
  { id: '2', ipAddress: '10.20.0.0/16', unitName: '제1군단', createdAt: '2024-01-01' },
  { id: '3', ipAddress: '10.30.0.0/16', unitName: '제2군단', createdAt: '2024-01-01' },
  { id: '4', ipAddress: '10.40.0.0/16', unitName: '제3군단', createdAt: '2024-01-01' },
  { id: '5', ipAddress: '10.50.0.0/16', unitName: '수도군단', createdAt: '2024-01-01' },
  { id: '6', ipAddress: '10.60.0.0/16', unitName: '제5군단', createdAt: '2024-01-01' },
  { id: '7', ipAddress: '10.70.0.0/16', unitName: '제7군단', createdAt: '2024-01-01' },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1', accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '로그인', target: '-', timestamp: '2024-12-14 09:15:23', status: 'success', createdAt: '2024-12-14' },
  { id: '2', accountId: 'C1D1-001', militaryId: '17-681542', userName: '이영희', rank: '소령', ipAddress: '10.10.2.55', action: '보고서 조회', target: '12월 2주차 통계보고서', timestamp: '2024-12-14 09:12:45', status: 'success', createdAt: '2024-12-14' },
  { id: '3', accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '사용자 생성', target: 'SWC-001', timestamp: '2024-12-14 08:55:12', status: 'success', createdAt: '2024-12-14' },
  { id: '4', accountId: '-', militaryId: '-', userName: '-', rank: '-', ipAddress: '192.168.1.50', action: '로그인 시도', target: '-', timestamp: '2024-12-14 08:30:05', status: 'failed', createdAt: '2024-12-14' },
  { id: '5', accountId: 'C3D12-001', militaryId: '21-392847', userName: '박민수', rank: '중령', ipAddress: '10.10.3.22', action: '데이터 조회', target: '제1사단 위험도', timestamp: '2024-12-14 08:22:18', status: 'success', createdAt: '2024-12-14' },
  { id: '6', accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '공지사항 등록', target: '동절기 안전수칙', timestamp: '2024-12-13 17:45:30', status: 'success', createdAt: '2024-12-13' },
  { id: '7', accountId: 'C1D1-001', militaryId: '17-681542', userName: '이영희', rank: '소령', ipAddress: '10.10.2.55', action: '로그아웃', target: '-', timestamp: '2024-12-13 17:30:00', status: 'success', createdAt: '2024-12-13' },
  { id: '8', accountId: 'C3D12-001', militaryId: '21-392847', userName: '박민수', rank: '중령', ipAddress: '10.10.3.22', action: '로그인', target: '-', timestamp: '2024-12-13 14:20:15', status: 'success', createdAt: '2024-12-13' },
];

let mockAllowedIPs = [...MOCK_ALLOWED_IPS];
let ipWhitelistEnabled = true;

// ============================================
// IP 접근 제어 API
// ============================================

/**
 * IP 화이트리스트 상태 조회
 */
export async function getIPWhitelistStatus(): Promise<ApiResponse<{ enabled: boolean }>> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true, data: { enabled: ipWhitelistEnabled } };
}

/**
 * IP 화이트리스트 상태 설정
 */
export async function setIPWhitelistStatus(enabled: boolean): Promise<ApiResponse<{ enabled: boolean }>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  ipWhitelistEnabled = enabled;
  return { success: true, data: { enabled } };
}

/**
 * 허용 IP 목록 조회
 */
export async function getAllowedIPs(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<AllowedIP>>> {
  await new Promise(resolve => setTimeout(resolve, 200));

  let filtered = [...mockAllowedIPs];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      ip =>
        ip.ipAddress.toLowerCase().includes(search) ||
        (ip.unitName?.toLowerCase().includes(search) ?? false)
    );
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
 * 허용 IP 추가
 */
export async function addAllowedIP(ipAddress: string, unitName: string): Promise<ApiResponse<AllowedIP>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const newIP: AllowedIP = {
    id: Date.now().toString(),
    ipAddress,
    unitName,
    createdAt: new Date().toISOString(),
  };

  mockAllowedIPs = [...mockAllowedIPs, newIP];

  return { success: true, data: newIP };
}

/**
 * 허용 IP 수정
 */
export async function updateAllowedIP(id: string, ipAddress: string, unitName: string): Promise<ApiResponse<AllowedIP>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockAllowedIPs.findIndex(item => item.id === id);
  if (index === -1) throw new Error('IP를 찾을 수 없습니다.');

  const updated: AllowedIP = {
    ...mockAllowedIPs[index],
    ipAddress,
    unitName,
    updatedAt: new Date().toISOString(),
  };

  mockAllowedIPs = mockAllowedIPs.map((item, i) => (i === index ? updated : item));

  return { success: true, data: updated };
}

/**
 * 허용 IP 삭제
 */
export async function deleteAllowedIP(id: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = mockAllowedIPs.findIndex(item => item.id === id);
  if (index === -1) throw new Error('IP를 찾을 수 없습니다.');

  mockAllowedIPs = mockAllowedIPs.filter(item => item.id !== id);

  return { success: true, data: undefined };
}

// ============================================
// 감사 로그 API
// ============================================

/**
 * 감사 로그 목록 조회
 */
export async function getAuditLogs(
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...MOCK_AUDIT_LOGS];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      log =>
        log.userName?.toLowerCase().includes(search) ||
        log.accountId?.toLowerCase().includes(search) ||
        log.militaryId?.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        (log.ipAddress?.toLowerCase().includes(search) ?? false)
    );
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter(log => log.timestamp >= filters.dateFrom!);
  }

  if (filters?.dateTo) {
    filtered = filtered.filter(log => log.timestamp <= filters.dateTo!);
  }

  if (filters?.status) {
    filtered = filtered.filter(log => log.status === filters.status);
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
 * 감사 로그 내보내기
 */
export async function exportAuditLogs(filters?: FilterParams): Promise<ApiResponse<Blob>> {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...MOCK_AUDIT_LOGS];

  if (filters?.dateFrom) {
    filtered = filtered.filter(log => log.timestamp >= filters.dateFrom!);
  }
  if (filters?.dateTo) {
    filtered = filtered.filter(log => log.timestamp <= filters.dateTo!);
  }

  // CSV 생성
  const headers = ['타임스탬프', '계정 ID', '군번', '사용자명', '계급', 'IP', '행동', '대상', '상태'];
  const rows = filtered.map(log => [
    log.timestamp,
    log.accountId,
    log.militaryId,
    log.userName,
    log.rank,
    log.ip,
    log.action,
    log.target,
    log.status === 'success' ? '성공' : '실패',
  ]);

  const BOM = '\uFEFF';
  const csvContent = BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return { success: true, data: blob };
}

/**
 * 강제 로그아웃
 */
export async function forceLogout(accountId: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock: 로그아웃 처리
  console.log(`Force logout: ${accountId}`);
  
  return { success: true, data: undefined };
}

// ============================================
// 보안 정책 API
// ============================================

export interface SecurityPolicy {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  auditLogRetentionDays: number;
}

const defaultSecurityPolicy: SecurityPolicy = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  auditLogRetentionDays: 365,
};

let currentSecurityPolicy = { ...defaultSecurityPolicy };

/**
 * 보안 정책 조회
 */
export async function getSecurityPolicy(): Promise<ApiResponse<SecurityPolicy>> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true, data: { ...currentSecurityPolicy } };
}

/**
 * 보안 정책 수정
 */
export async function updateSecurityPolicy(policy: Partial<SecurityPolicy>): Promise<ApiResponse<SecurityPolicy>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  currentSecurityPolicy = { ...currentSecurityPolicy, ...policy };
  return { success: true, data: currentSecurityPolicy };
}
