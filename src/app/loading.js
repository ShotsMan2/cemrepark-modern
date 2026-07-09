import { ProductGridSkeleton } from "../components/ui/ProductSkeleton";
import { Skeleton } from "../components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black z-10">
      {/* HERO SECTION SKELETON */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        <div className="relative z-20 text-center flex flex-col items-center justify-center h-full w-full bg-black/40 backdrop-blur-sm p-4">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-16 w-3/4 max-w-2xl mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 clip-angled" />
            <Skeleton className="h-12 w-40 clip-angled" />
          </div>
        </div>
      </div>

      {/* BEST SELLERS SKELETON */}
      <section className="py-24 relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-24 hidden md:block" />
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    </div>
  );
}
