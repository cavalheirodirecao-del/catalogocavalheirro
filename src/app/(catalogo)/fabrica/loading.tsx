export default function LoadingFabrica() {
  return (
    <div className="min-h-screen bg-[#0E1117] animate-pulse">
      <div className="h-14 bg-[#0E1117] border-b border-[#F5C400]/15" />
      <div className="h-10 bg-[#0E1117]/80" />
      <div className="h-48 md:h-64 bg-[#161B22]" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-4 w-32 bg-[#F5C400]/15 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="overflow-hidden border border-[#F5C400]/15 bg-[#161B22]">
              <div className="aspect-[3/4]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#F5C400]/10 rounded w-1/2" />
                <div className="h-4 bg-[#F5C400]/10 rounded w-3/4" />
                <div className="h-4 bg-[#F5C400]/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
