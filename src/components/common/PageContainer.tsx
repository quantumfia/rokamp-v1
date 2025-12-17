import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`relative p-6 min-h-full ${className}`}>
      {/* Subtle top-right glow */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[300px] opacity-[0.03] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, hsl(var(--primary)) 0%, transparent 70%)',
        }}
      />
      
      {/* Content */}
      <div className="relative space-y-6 animate-page-enter">
        {children}
      </div>
    </div>
  );
}
