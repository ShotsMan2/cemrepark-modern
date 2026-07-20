import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="container-premium py-12 min-h-[80vh]">
      {/* Breadcrumb Skeleton */}
      <Skeleton className="h-6 w-48 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="flex flex-col space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-32 w-full rounded-xl" />
          
          {/* Options (Color, Size) */}
          <div className="space-y-4 pt-4 border-t border-glass-border">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <div className="flex space-x-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-full" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-glass-border">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4 pt-6">
            <Skeleton className="h-14 flex-1 rounded-2xl" />
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
