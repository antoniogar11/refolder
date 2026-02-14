import { Skeleton } from "@/components/ui/skeleton";

export default function PresupuestosLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-10 w-80 mb-6" />
      <div className="rounded-lg border">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
