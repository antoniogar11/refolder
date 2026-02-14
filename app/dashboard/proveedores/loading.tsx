import { Skeleton } from "@/components/ui/skeleton";

export default function ProveedoresLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-32" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-96 w-full rounded-lg" />
    </div>
  );
}
