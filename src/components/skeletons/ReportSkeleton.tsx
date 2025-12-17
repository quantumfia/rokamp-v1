import { Skeleton } from '@/components/ui/skeleton';

// 전체 페이지 스켈레톤 (목록 화면)
export function ReportsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-4">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Tab Skeleton */}
      <div className="flex gap-6 border-b border-border pb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Skeleton className="h-10 w-40 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
        <Skeleton className="h-10 w-48 rounded" />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 p-3 border-b border-border">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Table Rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-3 border-b border-border items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportFormSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
}

export function ReportPreviewSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      
      <div className="p-6 rounded-lg bg-muted/20 space-y-4 min-h-[300px]">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2 pl-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        
        <Skeleton className="h-5 w-28 mt-6" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <Skeleton className="h-5 w-24 mt-6" />
        <div className="space-y-2 pl-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function StatisticsReportListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Skeleton className="h-10 w-40 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
        <Skeleton className="h-10 w-48 rounded" />
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 p-3 border-b border-border">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Table Rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-3 border-b border-border items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
