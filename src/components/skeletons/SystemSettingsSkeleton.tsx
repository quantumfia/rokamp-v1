import { Skeleton } from "@/components/ui/skeleton";

export function SystemSettingsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <Skeleton className="h-6 w-28 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded" />
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-border pb-2">
        <div className="flex gap-0">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 mr-2 rounded" />
          ))}
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-64 mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded" />
            <div className="flex justify-between">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-10" />
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Section 2 */}
        <section>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-72 mb-4" />
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
