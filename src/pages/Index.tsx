import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SplashScreen } from '@/components/splash/SplashScreen';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // /login 경로면 바로 로그인 폼 표시
  const isLoginPage = location.pathname === '/login';
  // 로그아웃 시에도 스플래시 스킵
  const skipSplash = isLoginPage || searchParams.get('logout') === 'true';

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleClickToContinue = () => {
    navigate('/login');
  };

  return (
    <SplashScreen 
      onComplete={handleComplete} 
      skipSplash={skipSplash}
      onClickToContinue={isLoginPage ? undefined : handleClickToContinue}
    />
  );
};

export default Index;