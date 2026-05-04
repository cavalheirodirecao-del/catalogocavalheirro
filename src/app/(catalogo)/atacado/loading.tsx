export default function LoadingAtacado() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] animate-pulse">
      <div className="h-14 bg-[#F4EFE6] border-b border-[#B8965A]/30" />
      <div className="h-10 bg-[#EDE7DA]" />
      <div className="h-48 md:h-64 bg-[#EDE7DA]" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-4 w-32 bg-[#D5C9B5] rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="overflow-hidden border border-[#D5C9B5] bg-[#EDE7DA]">
              <div className="aspect-[3/4]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#D5C9B5] rounded w-1/2" />
                <div className="h-4 bg-[#D5C9B5] rounded w-3/4" />
                <div className="h-4 bg-[#D5C9B5] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
