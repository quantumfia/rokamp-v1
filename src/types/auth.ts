/**
 * 인증 관련 타입 정의
 * entities.ts의 UserRole을 재사용
 */

export type UserRole = 'ROLE_HQ' | 'ROLE_DIV' | 'ROLE_BN';

export interface User {
  id: string;
  militaryId: string;     // 군번
  name: string;
  rank: string;           // 계급
  unit: string;           // 소속 부대명 (표시용)
  unitId: string;         // 소속 부대 ID (armyUnits.ts에서의 id)
  role: UserRole;
  ipAddress?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  'ROLE_HQ': 'Super Admin',
  'ROLE_DIV': 'Admin',
  'ROLE_BN': 'User',
};
