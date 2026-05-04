export default function LoadingVarejo() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] animate-pulse">
      <div className="h-14 bg-[#1C1C1A]" />
      <div className="h-10 bg-[#1C1C1A]/80" />
      <div className="h-48 md:h-64 bg-gray-200" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-gray-200">
              <div className="aspect-[3/4]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
