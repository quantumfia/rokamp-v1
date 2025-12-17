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
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  // 로그인 직후 공지사항 팝업 표시 (COM-002)
  useEffect(() => {
    const hideUntil = localStorage.getItem('hideNoticeUntil');
    const hasShownThisSession = sessionStorage.getItem('noticeShown');

    if (!hasShownThisSession) {
      // 오늘 하루 보지 않기 체크 확인
      if (hideUntil) {
        const expiry = new Date(hideUntil);
        if (new Date() < expiry) {
          sessionStorage.setItem('noticeShown', 'true');
          return;
        }
      }
      // 팝업 공지가 있으면 표시
      setShowNotice(true);
      sessionStorage.setItem('noticeShown', 'true');
    }
  }, []);

  const handleSearchSelect = (unitId: string) => {
    // 대시보드로 이동하고 해당 부대 선택
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      // 페이지 이동 후 충분한 시간 대기
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

  return (
    <SearchContext.Provider value={{ selectedUnitFromSearch, setSelectedUnitFromSearch }}>
      <div className="min-h-screen bg-background">
        <GNB onNotificationClick={handleNotificationClick} onSearchSelect={handleSearchSelect} />

        <div className={isDashboard ? 'flex h-[calc(100vh-3rem)] min-h-0' : 'flex'}>
          <LNB />

          <main
            className={
              isDashboard
                ? 'flex-1 min-w-0 min-h-0 overflow-hidden bg-background'
                : 'flex-1 min-w-0 min-h-[calc(100vh-3rem)] overflow-x-hidden bg-background'
            }
          >
            <Outlet />
          </main>
        </div>

        {/* 알림 패널 (COM-GNB 알림 이력) */}
        {showNotificationPanel && (
          <NotificationPanel
            onClose={() => setShowNotificationPanel(false)}
            onShowNotice={handleShowNoticeFromHistory}
          />
        )}

        {/* 필수 공지사항 모달 (COM-002) */}
        {showNotice && <NoticeModal onClose={() => setShowNotice(false)} />}
      </div>
    </SearchContext.Provider>
  );
}