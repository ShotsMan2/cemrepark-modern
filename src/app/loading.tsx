export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-8 bg-gray-50/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md"></div>
        </div>
        
        {/* Title and Subtitle Skeleton */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Grid Skeleton for Products/Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-full bg-gray-200 rounded-lg mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
