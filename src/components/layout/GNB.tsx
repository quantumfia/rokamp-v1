import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, User, Menu } from 'lucide-react';
import armyLogo from '@/assets/army-logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';

interface GNBProps {
  onNotificationClick: () => void;
  onSidebarToggle?: () => void;
  isSidebarExpanded?: boolean;
}

export function GNB({ onNotificationClick, onSidebarToggle, isSidebarExpanded }: GNBProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasNotifications = true;

  return (
    <header className="h-12 bg-sidebar flex items-center justify-between px-3 sticky top-0 z-[100] border-b border-sidebar-border">
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
            <img src={armyLogo} alt="육군본부" className="w-7 h-7 object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-sidebar-foreground tracking-tight">ROKA-MP</h1>
          </div>
        </button>

        <div className="hidden lg:flex items-center ml-3">
          <span className="text-xs text-sidebar-muted px-2 py-1 rounded bg-sidebar-accent">
            안전사고 예측 시스템
          </span>
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
              className="gap-2 h-auto py-1 px-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] text-sidebar-muted leading-tight">
                  {user?.militaryId || '24-503994'} ({user?.name || '홍길동'})
                </p>
                <p className="text-[10px] text-primary leading-tight">
                  {user?.role ? ROLE_LABELS[user.role] : 'Super Admin'}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-sidebar-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-sidebar border-sidebar-border">
            <div className="p-2">
              <p className="text-sm font-medium text-sidebar-foreground">{user?.name || '홍길동'}</p>
              <p className="text-xs text-sidebar-muted">{user?.militaryId || '24-503994'}</p>
              <p className="text-xs text-sidebar-muted mt-1">
                {user?.rank || '대령'} · {user?.unit || '육군본부'}
              </p>
              <p className="text-[10px] text-primary mt-1">
                권한: {user?.role ? ROLE_LABELS[user.role] : 'Super Admin'}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuItem 
              onClick={() => {
                logout();
                navigate('/login');
              }} 
              className="text-status-error hover:bg-sidebar-accent cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
