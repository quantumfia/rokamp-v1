import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings, User, MapPin, Menu } from 'lucide-react';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import { getSearchableUnits, LEVEL_LABELS, type ArmyUnit } from '@/data/armyUnits';

interface GNBProps {
  onNotificationClick: () => void;
  onSearchSelect?: (unitId: string) => void;
}

// 검색 가능한 부대 목록
const SEARCHABLE_UNITS = getSearchableUnits();

export function GNB({ onNotificationClick, onSearchSelect }: GNBProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 검색 결과 필터링
  const searchResults = searchQuery.trim()
    ? SEARCHABLE_UNITS.filter(
        (unit) =>
          unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // 외부 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectUnit(searchResults[0]);
    }
  };

  const handleSelectUnit = (unit: ArmyUnit) => {
    setSearchQuery('');
    setShowResults(false);
    
    // 대시보드가 아니면 대시보드로 이동
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
    
    // 부대 선택 콜백 호출 (지도 이동 + 정보 패널)
    onSearchSelect?.(unit.id);
  };

  const getRiskColor = (risk: number | undefined) => {
    if (!risk) return 'text-muted-foreground';
    if (risk < 25) return 'text-status-success';
    if (risk < 50) return 'text-status-warning';
    if (risk < 75) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <header className="h-12 bg-sidebar flex items-center justify-between px-4 sticky top-0 z-[100] border-b border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-sidebar-foreground tracking-tight">ROKA-MP</h1>
        </div>
        <div className="hidden lg:flex items-center gap-1 ml-4">
          <span className="text-xs text-sidebar-muted px-2 py-1 rounded bg-sidebar-accent">안전사고 예측 시스템</span>
        </div>
      </div>

      {/* Search with Autocomplete */}
      <div ref={searchRef} className="flex-1 max-w-md mx-4 relative">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-muted" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="부대명 검색..."
              className="pl-9 h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-sidebar-border rounded shadow-xl overflow-hidden z-[200]">
            {searchResults.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleSelectUnit(unit)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-sidebar-accent transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-sidebar-muted" />
                  <div>
                    <p className="text-xs font-medium text-sidebar-foreground">{unit.name}</p>
                    <p className="text-[10px] text-sidebar-muted">{LEVEL_LABELS[unit.level]}</p>
                  </div>
                </div>
                {unit.risk !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-sidebar-muted">위험도</span>
                    <span className={cn('text-xs font-semibold tabular-nums', getRiskColor(unit.risk))}>
                      {unit.risk}%
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {showResults && searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-sidebar-border rounded shadow-xl p-3 z-[200]">
            <p className="text-xs text-sidebar-muted text-center">
              "{searchQuery}"에 해당하는 부대가 없습니다
            </p>
          </div>
        )}
      </div>

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
            <Button variant="ghost" className="gap-2 h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-none text-sidebar-foreground">{user?.name}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-sidebar-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-sidebar border-sidebar-border">
            <div className="p-2">
              <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
              <p className="text-xs text-sidebar-muted">{user?.militaryId}</p>
              <p className="text-xs text-sidebar-muted mt-1">
                {user?.rank} · {user?.unit}
              </p>
              <p className="text-[10px] text-primary mt-1">
                권한: {user?.role && ROLE_LABELS[user.role]}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuItem onClick={logout} className="text-status-error hover:bg-sidebar-accent">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}