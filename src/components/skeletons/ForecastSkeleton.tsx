import { Skeleton } from "@/components/ui/skeleton";

export function ForecastSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-4">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-6 border-b border-border pb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Weekly Forecast Section */}
      <div className="space-y-6">
        {/* Weekly Risk Summary */}
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="text-center py-3">
                <Skeleton className="h-3 w-10 mx-auto mb-2" />
                <Skeleton className="h-7 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6" />

        {/* Chart Section */}
        <div>
          <Skeleton className="h-4 w-44 mb-1" />
          <Skeleton className="h-3 w-56 mb-4" />
          <Skeleton className="h-[200px] w-full rounded" />
        </div>

        <div className="border-t border-border pt-6" />

        {/* Rank Risk Section */}
        <div>
          <Skeleton className="h-4 w-36 mb-3" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center py-3">
                <Skeleton className="h-3 w-10 mx-auto mb-2" />
                <Skeleton className="h-7 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6" />

        {/* Unit Forecast Section */}
        <div>
          <Skeleton className="h-4 w-44 mb-1" />
          <Skeleton className="h-3 w-80 mb-4" />
          <div className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-3">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="flex flex-col items-center gap-1">
                      <Skeleton className="h-2 w-4" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
