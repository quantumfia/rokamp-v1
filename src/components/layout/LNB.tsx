import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  Database,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const MAIN_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'forecast', label: '예보 분석', icon: TrendingUp, path: '/forecast' },
  { id: 'reports', label: '보고서', icon: FileText, path: '/reports' },
  { id: 'chatbot', label: '챗봇', icon: MessageSquare, path: '/chatbot' },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  { id: 'data', label: '데이터 관리', icon: Database, path: '/data' },
  { id: 'users', label: '사용자 관리', icon: Users, path: '/admin/users' },
  { id: 'settings', label: '시스템 설정', icon: Settings, path: '/admin/settings' },
];

interface LNBProps {
  isExpanded: boolean;
}

export function LNB({ isExpanded }: LNBProps) {
  const location = useLocation();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const Icon = item.icon;

    const linkContent = (
      <NavLink
        to={item.path}
        className={cn(
          'flex items-center gap-2.5 h-9 px-2.5 rounded transition-all duration-150 group relative',
          isActive
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-r" />
        )}
        <Icon className="w-4 h-4 flex-shrink-0" />
        {isExpanded && (
          <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
        )}
      </NavLink>
    );

    if (!isExpanded) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar border-sidebar-border text-sidebar-foreground">
            <p className="text-xs">{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.id}>{linkContent}</div>;
  };

  return (
    <aside
      className={cn(
        'h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 sticky top-12 flex-shrink-0',
        isExpanded ? 'w-44' : 'w-12'
      )}
    >
      {/* Main Menu */}
      <nav className="flex-1 py-3 px-1.5 space-y-1">
        {isExpanded && (
          <p className="text-[10px] text-sidebar-muted uppercase tracking-wider px-2.5 mb-2">메인</p>
        )}
        {MAIN_MENU_ITEMS.map(renderMenuItem)}

        {/* Divider */}
        <div className={cn('border-t border-sidebar-border', isExpanded ? 'my-3 mx-2' : 'my-3')} />

        {/* Admin Menu */}
        {isExpanded && (
          <p className="text-[10px] text-sidebar-muted uppercase tracking-wider px-2.5 mb-2">관리</p>
        )}
        {ADMIN_MENU_ITEMS.map(renderMenuItem)}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        {isExpanded ? (
          <p className="text-[9px] text-sidebar-muted text-center">v1.0.0</p>
        ) : (
          <p className="text-[9px] text-sidebar-muted text-center">v1</p>
        )}
      </div>
    </aside>
  );
}
