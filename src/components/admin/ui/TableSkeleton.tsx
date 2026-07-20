import React from "react";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 5, rows = 10 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Table Header Toolbar Skeleton */}
      <div className="bg-foreground/5/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-8 w-64 bg-foreground/20 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-foreground/20 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-foreground/20 rounded-lg animate-pulse" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-foreground/60">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={`th-${index}`} scope="col" className="px-6 py-3">
                  <div className="h-4 bg-foreground/20 rounded animate-pulse w-3/4" />
                </th>
              ))}
              <th scope="col" className="px-6 py-3">
                <div className="h-4 bg-foreground/20 rounded animate-pulse w-1/2 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={`tr-${rowIndex}`}
                className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={`td-${rowIndex}-${colIndex}`} className="px-6 py-4">
                    <div
                      className={`h-4 bg-foreground/20 rounded animate-pulse ${
                        colIndex === 0 ? "w-full" : colIndex === 1 ? "w-5/6" : "w-2/3"
                      }`}
                    />
                  </td>
                ))}
                {/* Actions Column Skeleton */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-foreground/20 rounded-md animate-pulse" />
                    <div className="h-8 w-8 bg-foreground/20 rounded-md animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="h-4 w-48 bg-foreground/20 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-foreground/20 rounded animate-pulse" />
          <div className="h-8 w-8 bg-foreground/20 rounded animate-pulse" />
          <div className="h-8 w-8 bg-foreground/20 rounded animate-pulse" />
          <div className="h-8 w-24 bg-foreground/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
