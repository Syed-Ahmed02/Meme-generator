import { Skeleton } from "@/components/ui/skeleton"

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-px" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Canvas skeleton */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex gap-1 px-3 py-2 border-b border-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <Skeleton className="w-[600px] h-[500px] max-w-full rounded-lg" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-80 shrink-0 border-l border-border bg-card p-3 space-y-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
