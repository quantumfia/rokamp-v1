import { useState } from 'react';
import { Shield, User, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [militaryId, setMilitaryId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!militaryId || !password) {
      setError('군번과 비밀번호를 입력해주세요.');
      return;
    }

    const success = await login(militaryId, password);
    
    if (success) {
      onSuccess();
    } else {
      setError('군번 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary mb-4">
          <Shield className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground tracking-wide">
          ROKA-MP
        </h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-wider">
          안전사고 예측 시스템
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-card rounded-lg shadow-2xl border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="militaryId" className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
              군번 (ID)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <Input
                id="militaryId"
                type="text"
                value={militaryId}
                onChange={(e) => setMilitaryId(e.target.value)}
                placeholder="군번을 입력하세요"
                className="pl-9 h-10 text-sm bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-foreground/40"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
              비밀번호
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="pl-9 h-10 text-sm bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-foreground/40"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                인증 중...
              </>
            ) : (
              <>
                로그인
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center mb-2 uppercase tracking-wider">
            테스트 계정
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="p-2 rounded bg-muted/50 text-center border border-border/50">
              <div className="font-medium text-foreground">육본</div>
              <div className="text-muted-foreground mt-0.5">HQ001</div>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center border border-border/50">
              <div className="font-medium text-foreground">사단</div>
              <div className="text-muted-foreground mt-0.5">DIV001</div>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center border border-border/50">
              <div className="font-medium text-foreground">대대</div>
              <div className="text-muted-foreground mt-0.5">BN001</div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            비밀번호: <span className="font-mono text-foreground">admin123</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground mt-5 tracking-wide">
        © 2024 대한민국 육군. All rights reserved.
      </p>
    </div>
  );
}