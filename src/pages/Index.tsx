import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '@/components/splash/SplashScreen';

const Index = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <SplashScreen onComplete={handleComplete} />;
};

export default Index;
