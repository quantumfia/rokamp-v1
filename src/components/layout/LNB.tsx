import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  Database,
  Users,
  ChevronLeft,
  ChevronRight,
  Layers,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: Array<'ROLE_HQ' | 'ROLE_DIV' | 'ROLE_BN'>;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'forecast',
    label: '예보 분석',
    icon: TrendingUp,
    path: '/forecast',
  },
  {
    id: 'chatbot',
    label: '챗봇',
    icon: MessageSquare,
    path: '/chatbot',
  },
  {
    id: 'reports',
    label: '보고서',
    icon: FileText,
    path: '/reports',
  },
  {
    id: 'data',
    label: '데이터 관리',
    icon: Database,
    path: '/data',
    roles: ['ROLE_HQ'],
  },
  {
    id: 'users',
    label: '사용자 관리',
    icon: Users,
    path: '/admin/users',
    roles: ['ROLE_HQ', 'ROLE_DIV'],
  },
  {
    id: 'settings',
    label: '시스템 설정',
    icon: Settings,
    path: '/admin/settings',
    roles: ['ROLE_HQ'],
  },
];

export function LNB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Super Admin 권한: 모든 메뉴 항상 표시
  const filteredMenuItems = MENU_ITEMS;

  return (
    <aside
      className={cn(
        'h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 sticky top-12 flex-shrink-0',
        isExpanded ? 'w-48' : 'w-12'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Menu Items */}
      <nav className="flex-1 py-2 space-y-0.5 px-1.5">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          const linkContent = (
            <NavLink
              key={item.id}
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
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap transition-opacity duration-150',
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );

          if (!isExpanded) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-sidebar border-sidebar-border text-sidebar-foreground">
                  <p className="text-xs">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-2 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center gap-2 text-sidebar-muted transition-opacity duration-150',
          isExpanded ? 'opacity-100' : 'opacity-0'
        )}>
          <Activity className="w-3 h-3 text-status-success" />
          <span className="text-[10px]">시스템 정상</span>
        </div>
      </div>
    </aside>
  );
}