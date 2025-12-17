import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 전환 시 스크롤 위치 초기화
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
