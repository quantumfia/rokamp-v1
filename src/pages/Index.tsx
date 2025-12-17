import { useNavigate, useSearchParams } from 'react-router-dom';
import { SplashScreen } from '@/components/splash/SplashScreen';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 로그아웃 시 스플래시 스킵하고 바로 로그인 폼 표시
  const skipSplash = searchParams.get('logout') === 'true';

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <SplashScreen onComplete={handleComplete} skipSplash={skipSplash} />;
};

export default Index;