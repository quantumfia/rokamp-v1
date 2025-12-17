import { Skeleton } from "@/components/ui/skeleton";

export function ChatbotSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Background effect placeholder */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Welcome Screen Skeleton */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-48 mb-2" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        {/* Suggested Questions Grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 border border-border rounded-lg"
            >
              <Skeleton className="w-5 h-5 mt-0.5 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>

        {/* Search Scope & Input */}
        <div className="w-full max-w-2xl space-y-3">
          {/* Search scope button */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>

          {/* Input field */}
          <div className="relative">
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>

          {/* Disclaimer text */}
          <div className="flex justify-center">
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
      </div>
    </div>
  );
}
