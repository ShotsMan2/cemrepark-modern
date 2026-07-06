import { Skeleton } from "./Skeleton";

export function ProductSkeleton() {
  return (
    <div className="glass-card relative overflow-hidden clip-angled p-2 flex flex-col h-full">
      <Skeleton className="h-96 w-full clip-angled mb-4 rounded-t-lg" />
      <div className="p-4 flex-1 flex flex-col justify-end">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <div className="flex justify-between items-center mt-auto">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
