import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { GNB } from './GNB';
import { LNB } from './LNB';
import { NoticeModal } from '../notice/NoticeModal';
import { NotificationPanel } from '../notice/NotificationPanel';

// 검색 결과를 전달하기 위한 Context
interface SearchContextType {
  selectedUnitFromSearch: string | null;
  setSelectedUnitFromSearch: (unitId: string | null) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function useSearchContext() {
  return useContext(SearchContext);
}

export function MainLayout() {
  const [showNotice, setShowNotice] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedUnitFromSearch, setSelectedUnitFromSearch] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isChatbot = location.pathname === '/chatbot';
  const isFixedHeightMain = isDashboard || isChatbot;

  // 대시보드 페이지에서만 공지사항 팝업 표시 (COM-002)
  useEffect(() => {
    if (!isDashboard) return;
    
    const hideUntil = localStorage.getItem('hideNoticeUntil');
    const hasShownThisSession = sessionStorage.getItem('noticeShown');

    if (!hasShownThisSession) {
      if (hideUntil) {
        const expiry = new Date(hideUntil);
        if (new Date() < expiry) {
          sessionStorage.setItem('noticeShown', 'true');
          return;
        }
      }
      setShowNotice(true);
      sessionStorage.setItem('noticeShown', 'true');
    }
  }, [isDashboard]);

  const handleSearchSelect = (unitId: string) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => setSelectedUnitFromSearch(unitId), 500);
    } else {
      setSelectedUnitFromSearch(unitId);
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationPanel(!showNotificationPanel);
  };

  const handleShowNoticeFromHistory = () => {
    setShowNotificationPanel(false);
    setShowNotice(true);
  };

  const handleSidebarToggle = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  return (
    <SearchContext.Provider value={{ selectedUnitFromSearch, setSelectedUnitFromSearch }}>
      <div className="min-h-screen bg-background">
        <GNB
          onNotificationClick={handleNotificationClick}
          onSidebarToggle={handleSidebarToggle}
          isSidebarExpanded={isSidebarExpanded}
        />

        <div className={isFixedHeightMain ? 'flex h-[calc(100vh-3rem)] min-h-0' : 'flex'}>
          <LNB isExpanded={isSidebarExpanded} />

          <main
            className={
              isFixedHeightMain
                ? 'flex-1 min-w-0 min-h-0 overflow-hidden bg-background'
                : 'flex-1 min-w-0 min-h-[calc(100vh-3rem)] overflow-x-hidden overflow-y-auto bg-background'
            }
          >
            <Outlet />
          </main>
        </div>

        {/* 알림 패널 */}
        {showNotificationPanel && (
          <NotificationPanel
            onClose={() => setShowNotificationPanel(false)}
            onShowNotice={handleShowNoticeFromHistory}
          />
        )}

        {/* 필수 공지사항 모달 */}
        {showNotice && <NoticeModal onClose={() => setShowNotice(false)} />}
      </div>
    </SearchContext.Provider>
  );
}
