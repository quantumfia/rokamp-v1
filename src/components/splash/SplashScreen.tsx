import { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import landingHero from '@/assets/landing-hero.png';
import armyLogo from '@/assets/army-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [pulseText, setPulseText] = useState(true);
  
  // Login form state
  const [militaryId, setMilitaryId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  useEffect(() => {
    // Show elements with delay
    setTimeout(() => setShowElements(true), 300);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setLoadingComplete(true), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  // Pulsing text animation
  useEffect(() => {
    if (loadingComplete && !showLoginForm) {
      const pulseInterval = setInterval(() => {
        setPulseText(prev => !prev);
      }, 1000);
      return () => clearInterval(pulseInterval);
    }
  }, [loadingComplete, showLoginForm]);

  const handleClick = useCallback(() => {
    if (loadingComplete && !showLoginForm) {
      setShowLoginForm(true);
    }
  }, [loadingComplete, showLoginForm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!militaryId || !password) {
      setError('군번과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(militaryId, password);
      onComplete();
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Hero image background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main hero image */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'float-slow 8s ease-in-out infinite',
          }}
        >
          <img 
            src={landingHero}
            alt="Hero visualization"
            className="w-full h-full object-cover opacity-70"
            style={{
              filter: 'brightness(0.9)',
              objectPosition: '40% 60%',
            }}
          />
        </div>

        {/* Subtle glow overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 70%)',
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${showElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo with glow */}
        <div className="relative mb-8">
          <div 
            className="absolute -inset-20 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsl(210, 75%, 50%, 0.3) 0%, transparent 70%)',
              animation: 'logo-glow 3s ease-in-out infinite',
            }}
          />
          <div 
            className={`relative transition-all duration-700 ${showLoginForm ? 'scale-75' : 'scale-100'}`}
            style={{
              filter: 'drop-shadow(0 0 40px hsl(210, 75%, 50%, 0.5))',
            }}
          >
            <img src={armyLogo} alt="육군본부" className="w-24 h-24" />
          </div>
        </div>

        {/* Title */}
        <h1 
          className={`text-4xl md:text-5xl font-bold text-white tracking-[0.4em] mb-3 font-mono transition-all duration-500 ${showLoginForm ? 'text-3xl' : ''}`}
          style={{
            textShadow: '0 0 40px hsl(210, 75%, 50%, 0.5)',
          }}
        >
          ROKA-MP
        </h1>
        
        <p 
          className="text-primary text-sm tracking-[0.3em] uppercase mb-2"
          style={{
            textShadow: '0 0 20px hsl(210, 75%, 50%, 0.8)',
          }}
        >
          Safety Accident Prediction System
        </p>
        <p className="text-white/40 text-xs tracking-wider mb-10">
          육군 안전사고 예측 시스템
        </p>

        {/* Progress bar - always visible until login form shows */}
        {!showLoginForm && (
          <div className={`w-64 transition-all duration-500 ${loadingComplete ? 'opacity-50' : 'opacity-100'}`}>
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full transition-all duration-100"
                style={{ 
                  width: `${loadingProgress}%`,
                  boxShadow: '0 0 20px hsl(210, 75%, 50%, 0.8)',
                }}
              />
            </div>
            
            {/* Click to continue text */}
            {loadingComplete ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-white text-base font-semibold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Click to continue</span>
                <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
              </div>
            ) : (
              <p className="mt-4 text-white text-xs text-center font-medium tracking-widest uppercase">
                Initializing system...
              </p>
            )}
          </div>
        )}

        {/* Login form */}
        {showLoginForm && (
          <form 
            onClick={(e) => e.stopPropagation()} 
            onSubmit={handleLogin}
            className="w-80 space-y-4 animate-fade-in"
          >
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="군번 (Military ID)"
                  value={militaryId}
                  onChange={(e) => setMilitaryId(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  style={{
                    boxShadow: militaryId ? '0 0 20px hsl(210, 75%, 50%, 0.1)' : 'none',
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="비밀번호 (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  style={{
                    boxShadow: password ? '0 0 20px hsl(210, 75%, 50%, 0.1)' : 'none',
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary/80 to-primary text-primary-foreground font-medium tracking-wider uppercase text-sm hover:from-primary hover:to-primary/90 transition-all"
              style={{
                boxShadow: '0 0 30px hsl(210, 75%, 50%, 0.3)',
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Login'
              )}
            </Button>

            <p className="text-white/20 text-[10px] text-center tracking-wide mt-4">
              테스트: 아무 ID/PW 입력 후 로그인
            </p>
          </form>
        )}
      </div>

      {/* Version info */}
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-white/20">
        v2.1.0 | Build 2024.12
      </div>

      {/* Bottom scan line effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{
          animation: 'scan-line 3s linear infinite',
        }}
      />

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-10px); }
        }
        
        @keyframes logo-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
