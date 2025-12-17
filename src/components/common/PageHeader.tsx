import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative">
      {/* Subtle glow effect */}
      <div 
        className="absolute -top-8 -left-8 w-48 h-48 opacity-[0.04] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
        }}
      />
      
      <div className="relative flex items-start justify-between pb-6">
        <div className="flex items-start gap-4">
          {/* Accent line */}
          <div className="hidden sm:block w-1 h-12 rounded-full bg-gradient-to-b from-primary to-primary/20" />
          
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Bottom border with gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-border via-border to-transparent" />
    </div>
  );
}
