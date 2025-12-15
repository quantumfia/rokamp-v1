import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);

  const bootSequence = [
    'Initializing secure connection...',
    'Loading system modules...',
    'Authenticating credentials...',
    'Establishing data link...',
    'System ready.',
  ];

  useEffect(() => {
    // Boot sequence animation
    bootSequence.forEach((line, index) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
      }, 200 + index * 350);
    });

    // Logo appears
    setTimeout(() => setShowLogo(true), 400);
    
    // Text appears
    setTimeout(() => setShowText(true), 900);
    
    // Progress bar appears
    setTimeout(() => setShowProgress(true), 1300);
    
    // Start loading progress
    setTimeout(() => setLoadingProgress(100), 1500);

    // Start fade out
    setTimeout(() => setFadeOut(true), 3200);

    // Complete splash
    setTimeout(() => onComplete(), 3700);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-terminal-bg flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)'
        }}
      />


      <div className="flex flex-col items-center justify-center relative">
        {/* Logo with smooth entrance */}
        <div 
          className={`relative transition-all duration-700 ease-out ${
            showLogo 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-90 translate-y-4'
          }`}
        >
          <div className={`absolute -inset-16 bg-primary/10 rounded-full blur-3xl transition-opacity duration-1000 ${
            showLogo ? 'opacity-100' : 'opacity-0'
          }`} />
          <div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center relative">
            <Shield className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title with delayed entrance */}
        <div className={`transition-all duration-500 ease-out delay-100 ${
          showText 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-3'
        }`}>
          <h1 className="mt-6 text-3xl font-semibold text-white tracking-[0.3em] text-center font-mono">
            ROKA-MP
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`transition-all duration-500 ease-out delay-200 ${
          showText 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-3'
        }`}>
          <p className="mt-2 text-terminal-accent text-xs tracking-[0.2em] uppercase">
            Safety Accident Prediction System
          </p>
          <p className="mt-1 text-terminal-muted text-[10px] tracking-wider text-center">
            육군 안전사고 예측 시스템
          </p>
        </div>
        
        {/* Progress bar */}
        <div className={`mt-10 transition-all duration-400 ease-out ${
          showProgress 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1'
        }`}>
          <div className="w-56 h-0.5 bg-terminal-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-terminal-accent rounded-full transition-all duration-[1500ms] ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="mt-3 text-terminal-muted text-[10px] text-center tracking-widest uppercase">
            Establishing secure connection
          </p>
        </div>
      </div>

      {/* Version info - bottom right */}
      <div className="absolute bottom-8 right-8 font-mono text-[10px] text-terminal-muted/50">
        v2.1.0 | Build 2024.12
      </div>
    </div>
  );
}