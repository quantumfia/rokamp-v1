import { Skeleton } from "@/components/ui/skeleton";

export function DataManagementSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-4">
        <Skeleton className="h-6 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Tab Skeleton */}
      <div className="flex gap-6 border-b border-border pb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Uploader Skeleton */}
      <div className="flex items-center justify-between py-4 px-4 bg-muted/30 border border-dashed border-border rounded-lg">
        <div>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded" />
      </div>

      {/* Table Section Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Table Header Skeleton */}
        <div className="grid grid-cols-[1fr_60px_60px_140px_80px_60px_40px] gap-4 py-3 border-y border-border">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-4" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_60px_140px_80px_60px_40px] gap-4 py-3 items-center">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-10 mx-auto" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
