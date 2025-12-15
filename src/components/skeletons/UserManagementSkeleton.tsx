import { Skeleton } from "@/components/ui/skeleton";

export function UserManagementSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <Skeleton className="h-6 w-28 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-28 rounded" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-6" />

      {/* Search Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32 rounded" />
        </div>
        <Skeleton className="h-9 w-64 rounded" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-[100px_100px_60px_1fr_100px_80px_40px] gap-4 py-3 border-y border-border">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-4" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-border">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-[100px_100px_60px_1fr_100px_80px_40px] gap-4 py-3 items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
