import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="container-premium py-12 min-h-[70vh]">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center border-b border-glass-border pb-4 mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 pb-6 border-b border-glass-border last:border-0 last:pb-0"
                >
                  <Skeleton className="w-24 h-32 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                    </div>
                    <div className="flex justify-between items-end">
                      <Skeleton className="h-10 w-32 rounded-lg" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card p-6 space-y-6 sticky top-24">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[1px] w-full" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-2xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
