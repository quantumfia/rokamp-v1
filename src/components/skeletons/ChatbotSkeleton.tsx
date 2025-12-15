import { Skeleton } from "@/components/ui/skeleton";

export function ChatbotSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Skeleton */}
      <div className="shrink-0 p-6 pb-4 border-b border-border">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Initial Message */}
        <div className="flex gap-3">
          <Skeleton className="w-6 h-6 rounded-sm flex-shrink-0" />
          <div className="max-w-[70%] space-y-2">
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Suggested Questions Skeleton */}
      <div className="px-4 pb-3">
        <Skeleton className="h-3 w-16 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-8 w-44 rounded" />
          <Skeleton className="h-8 w-36 rounded" />
          <Skeleton className="h-8 w-48 rounded" />
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded" />
          <Skeleton className="w-10 h-10 rounded" />
        </div>
      </div>
    </div>
  );
}
