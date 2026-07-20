import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/ui/ProductSkeleton";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-12 bg-background/50 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        {/* Banner Skeleton */}
        <div className="w-full h-72 md:h-96 rounded-3xl overflow-hidden shadow-sm relative">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Title and Subtitle Skeleton */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-10 w-64 md:w-96 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>
        
        {/* Products Grid Skeleton */}
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
