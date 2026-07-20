import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container-premium py-12 min-h-[80vh]">
      <Skeleton className="h-10 w-64 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Checkout Steps Skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary Skeleton */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6 space-y-6 sticky top-24">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-[1px] w-full" />
            <div className="space-y-3">
              <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
              <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
              <div className="flex justify-between"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-24" /></div>
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
