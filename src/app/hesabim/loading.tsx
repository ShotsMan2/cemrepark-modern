import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HesabimLoading() {
  return (
    <div className="container-premium py-12 min-h-[70vh] flex flex-col lg:flex-row gap-8">
      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-1/4">
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-[1px] w-full" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full lg:w-3/4">
        <div className="glass-card p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-glass-border pb-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
