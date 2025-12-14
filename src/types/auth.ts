export type UserRole = 'ROLE_HQ' | 'ROLE_DIV' | 'ROLE_BN' | 'ROLE_MP';

export interface User {
  id: string;
  militaryId: string; // 군번
  name: string;
  rank: string; // 계급
  unit: string; // 소속 부대
  role: UserRole;
  ipAddress?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  'ROLE_HQ': '육군본부',
  'ROLE_DIV': '사단급',
  'ROLE_BN': '대대급',
  'ROLE_MP': '군사경찰',
};
