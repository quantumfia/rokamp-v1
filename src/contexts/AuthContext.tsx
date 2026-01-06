import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthState, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (militaryId: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (militaryId: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 테스트용: 아무 ID/비밀번호나 허용
    const testUser: User = {
      id: '1',
      militaryId: militaryId || 'TEST001',
      name: '테스트 사용자',
      rank: '대령',
      unit: '육군본부 군사경찰실',
      unitId: 'hq', // 육군본부
      role: 'ROLE_HQ',
    };
    
    setAuthState({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // 역할 전환 (프론트엔드 테스트용)
  // 실제 부대 목데이터 기반 설정:
  // - ROLE_HQ: 육군본부 (hq)
  // - ROLE_DIV: 제1군단 제9보병사단 (corps-1-div-9) - 예하에 다른 사단/여단이 없어 자체 테스트용
  // - ROLE_BN: 제1군단 제11화생방대대 (corps-1-bn-cbrn-11) - 군단 직할 대대
  const switchRole = useCallback((role: UserRole) => {
    const roleUserData: Record<UserRole, Partial<User>> = {
      'ROLE_HQ': {
        name: '김본부',
        rank: '대령',
        unit: '육군본부 군사경찰실',
        unitId: 'hq',
      },
      'ROLE_DIV': {
        name: '이사단',
        rank: '소장',
        unit: '제9보병사단',
        unitId: 'corps-1-div-9', // 제1군단 > 제9보병사단 (경기 연천)
      },
      'ROLE_BN': {
        name: '박대대',
        rank: '중령',
        unit: '제11화생방대대',
        unitId: 'corps-1-bn-cbrn-11', // 제1군단 직할 제11화생방대대
      },
    };

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        ...roleUserData[role],
        role,
      } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
