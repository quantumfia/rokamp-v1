import { useState, useEffect, useCallback } from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

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
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moving spotlight effect 1 */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(187, 85%, 43%) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'spotlight-pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* Moving spotlight effect 2 */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(187, 85%, 60%) 0%, transparent 60%)',
            top: '30%',
            left: '30%',
            animation: 'spotlight-float 8s ease-in-out infinite',
          }}
        />
        
        {/* Moving spotlight effect 3 */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(187, 85%, 50%) 0%, transparent 60%)',
            bottom: '20%',
            right: '20%',
            animation: 'spotlight-float 10s ease-in-out infinite reverse',
          }}
        />

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(187, 85%, 43%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(187, 85%, 43%) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'grid-move 20s linear infinite',
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
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
              background: 'radial-gradient(circle, hsl(187, 85%, 43%, 0.3) 0%, transparent 70%)',
              animation: 'logo-glow 3s ease-in-out infinite',
            }}
          />
          <div 
            className={`relative w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl transition-all duration-700 ${showLoginForm ? 'scale-75' : 'scale-100'}`}
            style={{
              boxShadow: '0 0 60px hsl(187, 85%, 43%, 0.4), 0 0 100px hsl(187, 85%, 43%, 0.2)',
            }}
          >
            <Shield className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 
          className={`text-4xl md:text-5xl font-bold text-white tracking-[0.4em] mb-3 font-mono transition-all duration-500 ${showLoginForm ? 'text-3xl' : ''}`}
          style={{
            textShadow: '0 0 40px hsl(187, 85%, 43%, 0.5)',
          }}
        >
          ROKA-MP
        </h1>
        
        <p 
          className="text-primary text-sm tracking-[0.3em] uppercase mb-2"
          style={{
            textShadow: '0 0 20px hsl(187, 85%, 43%, 0.8)',
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
                  boxShadow: '0 0 20px hsl(187, 85%, 43%, 0.8)',
                }}
              />
            </div>
            
            {/* Click to continue text */}
            {loadingComplete ? (
              <div className={`mt-6 flex items-center justify-center gap-2 transition-opacity duration-500 ${pulseText ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-white/60 text-xs tracking-widest uppercase">Click to continue</span>
                <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
              </div>
            ) : (
              <p className="mt-4 text-white/30 text-[10px] text-center tracking-widest uppercase">
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
                    boxShadow: militaryId ? '0 0 20px hsl(187, 85%, 43%, 0.1)' : 'none',
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
                    boxShadow: password ? '0 0 20px hsl(187, 85%, 43%, 0.1)' : 'none',
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
                boxShadow: '0 0 30px hsl(187, 85%, 43%, 0.3)',
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
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes spotlight-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(50px, -30px); }
          50% { transform: translate(20px, 40px); }
          75% { transform: translate(-30px, 20px); }
        }
        
        @keyframes logo-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
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
