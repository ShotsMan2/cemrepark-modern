import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 animate-shimmer ${className}`}
      {...props}
    />
  );
}
