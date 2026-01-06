import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Key, User, Menu, Eye, EyeOff } from 'lucide-react';
import rokaLogo from '@/assets/roka-logo.svg';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// 실시간 시계 컴포넌트
function HeaderClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </span>
  );
}

interface GNBProps {
  onNotificationClick: () => void;
  onSidebarToggle?: () => void;
  isSidebarExpanded?: boolean;
}

export function GNB({ onNotificationClick, onSidebarToggle, isSidebarExpanded }: GNBProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasNotifications = true;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: '입력 오류',
        description: '모든 필드를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast({
        title: '비밀번호 불일치',
        description: '새 비밀번호가 일치하지 않습니다.',
        variant: 'destructive'
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({
        title: '비밀번호 정책 위반',
        description: '비밀번호는 8자 이상이어야 합니다.',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: '비밀번호 변경 완료',
      description: '비밀번호가 성공적으로 변경되었습니다.',
    });
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/?logout=true');
  };

  const roleLabel = user?.role ? ROLE_LABELS[user.role] : 'Super Admin';
  const userName = user?.name || '홍길동';
  const userRank = user?.rank || '대령';
  const userUnit = user?.unit || '육군본부';

  return (
    <>
      <header className="h-12 bg-[hsl(220_14%_93%)] dark:bg-sidebar flex items-center justify-between px-3 sticky top-0 z-[100] border-b border-border">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onSidebarToggle}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-7 h-7">
              <img src={rokaLogo} alt="육군본부" className="w-7 h-7 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-sidebar-foreground tracking-wider font-display">대한민국 육군</h1>
            </div>
          </button>

          <div className="hidden lg:flex items-center ml-3 gap-2 text-xs text-sidebar-muted">
            <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
            <HeaderClock />
          </div>
        </div>

        {/* Center - Empty for clean look */}
        <div className="flex-1" />

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onNotificationClick}
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-error rounded-full" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-1.5 h-auto py-1.5 px-2.5 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <User className="w-4 h-4 text-sidebar-muted" />
                <span className="hidden md:inline text-xs font-medium text-sidebar-foreground">
                  {userRank} {userName}
                </span>
                <ChevronDown className="w-3 h-3 text-sidebar-muted" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-sidebar border-sidebar-border">
              {/* User Info Header */}
              <div className="px-3 py-3 border-b border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {userRank} {userName}
                </p>
                <p className="text-xs text-sidebar-muted mt-0.5">
                  {userUnit}
                </p>
                <p className="text-[11px] text-sidebar-primary mt-1">
                  {roleLabel}
                </p>
              </div>
              
              {/* Menu Items */}
              <div className="py-1">
                <DropdownMenuItem 
                  onClick={() => setShowPasswordModal(true)}
                  className="text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer mx-1 rounded"
                >
                  <Key className="w-4 h-4 mr-2" />
                  비밀번호 변경
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator className="bg-sidebar-border" />
              
              <div className="py-1">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-status-error hover:bg-sidebar-accent cursor-pointer mx-1 rounded"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">현재 비밀번호</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="현재 비밀번호 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="새 비밀번호 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">새 비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="새 비밀번호 재입력"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Policy */}
            <div className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2.5 space-y-0.5">
              <p>• 8자 이상, 대문자/특수문자/숫자 포함 필수</p>
              <p>• 이전 3개 비밀번호와 동일 불가</p>
              <p>• 90일마다 변경 필요</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              취소
            </Button>
            <Button onClick={handlePasswordChange}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}