import { UserRole } from '@/types/auth';

// 페이지별 접근 권한
export const PAGE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard': ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  '/forecast': ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  '/chatbot': ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  '/reports': ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  '/admin/notice': ['ROLE_HQ', 'ROLE_DIV'],
  '/admin/schedule': ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  '/data': ['ROLE_HQ'],
  '/admin/users': ['ROLE_HQ', 'ROLE_DIV'],
  '/admin/settings': ['ROLE_HQ'],
  '/admin/chatbot-starter': ['ROLE_HQ'],
};

// LNB 메뉴별 접근 권한
export const MENU_ACCESS: Record<string, UserRole[]> = {
  dashboard: ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  forecast: ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  chatbot: ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  reports: ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  notice: ['ROLE_HQ', 'ROLE_DIV'],
  schedule: ['ROLE_HQ', 'ROLE_DIV', 'ROLE_BN'],
  data: ['ROLE_HQ'],
  users: ['ROLE_HQ', 'ROLE_DIV'],
  settings: ['ROLE_HQ'],
};

// 페이지 접근 권한 확인
export function canAccessPage(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  
  // 정확한 경로 매칭
  if (PAGE_ACCESS[path]) {
    return PAGE_ACCESS[path].includes(role);
  }
  
  // 부분 경로 매칭 (예: /admin/notice/new -> /admin/notice)
  const basePaths = Object.keys(PAGE_ACCESS).sort((a, b) => b.length - a.length);
  for (const basePath of basePaths) {
    if (path.startsWith(basePath + '/') || path === basePath) {
      return PAGE_ACCESS[basePath].includes(role);
    }
  }
  
  return true; // 정의되지 않은 경로는 접근 허용
}

// 메뉴 접근 권한 확인
export function canAccessMenu(role: UserRole | undefined, menuId: string): boolean {
  if (!role) return false;
  return MENU_ACCESS[menuId]?.includes(role) ?? true;
}

// 역할별 데이터 접근 범위 설명
export const ROLE_SCOPE_LABELS: Record<UserRole, string> = {
  'ROLE_HQ': '전군',
  'ROLE_DIV': '예하 부대',
  'ROLE_BN': '본인 부대',
};

// ============================================
// 세부 권한 (페이지 내 기능별)
// ============================================

// 본인 작성 여부 확인 (작성자 이름 기반)
export function isOwnContent(role: UserRole | undefined, authorName: string, currentUserName: string): boolean {
  if (!role) return false;
  if (role === 'ROLE_HQ') return true; // HQ는 모든 콘텐츠 수정/삭제 가능
  return authorName === currentUserName;
}

// 수정/삭제 권한 (공지, 보고서 등)
export function canEditContent(role: UserRole | undefined, authorName: string, currentUserName: string): boolean {
  if (!role) return false;
  if (role === 'ROLE_HQ') return true;
  return authorName === currentUserName;
}

export function canDeleteContent(role: UserRole | undefined, authorName: string, currentUserName: string): boolean {
  return canEditContent(role, authorName, currentUserName);
}

// 사용자 관리: 역할 변경 권한
export function canChangeUserRole(role: UserRole | undefined): boolean {
  return role === 'ROLE_HQ';
}

// 콘텐츠 생성 권한
export function canCreateContent(role: UserRole | undefined, pageType: 'notice' | 'schedule' | 'report' | 'user'): boolean {
  if (!role) return false;
  
  switch (pageType) {
    case 'notice':
      return role === 'ROLE_HQ' || role === 'ROLE_DIV';
    case 'schedule':
      return true; // 모든 역할 가능
    case 'report':
      return true; // 모든 역할 가능
    case 'user':
      return role === 'ROLE_HQ' || role === 'ROLE_DIV';
    default:
      return false;
  }
}
