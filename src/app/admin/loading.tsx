export default function AdminLoading() {
  return (
    <div className="w-full h-full p-6 bg-slate-50/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-3 w-16 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                    <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
