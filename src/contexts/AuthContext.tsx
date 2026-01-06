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
  const switchRole = useCallback((role: UserRole) => {
    const roleUserData: Record<UserRole, Partial<User>> = {
      'ROLE_HQ': {
        name: '김본부',
        rank: '대령',
        unit: '육군본부 군사경찰실',
      },
      'ROLE_DIV': {
        name: '이사단',
        rank: '준장',
        unit: '제1보병사단',
      },
      'ROLE_BN': {
        name: '박대대',
        rank: '중령',
        unit: '제1보병사단 제1연대 제1대대',
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
