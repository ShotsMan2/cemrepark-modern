import { ProductGridSkeleton } from "../../components/ui/ProductSkeleton";
import { Skeleton } from "../../components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden container mx-auto px-4 z-10">
      {/* Search Header Skeleton */}
      <div className="glass-panel p-8 clip-angled mb-12 text-center flex flex-col items-center">
        <Skeleton className="h-12 w-3/4 max-w-lg mb-4" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR FILTER SKELETON */}
        <div className="w-full lg:w-1/4">
          <div className="glass-panel p-6 clip-angled sticky top-32">
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="mb-8">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
            <div className="mb-8">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>
            <div className="mb-8">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full clip-angled" />
                ))}
              </div>
            </div>
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>

        {/* PRODUCT GRID SKELETON */}
        <div className="w-full lg:w-3/4 min-h-screen">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
