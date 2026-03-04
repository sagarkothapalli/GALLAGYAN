export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl animate-pulse" />
          <div className="w-24 h-4 bg-white/5 rounded-lg animate-pulse hidden md:block" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="flex flex-col items-center gap-4 mb-16">
          <div className="w-40 h-6 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-64 h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="w-48 h-4 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 h-32 animate-pulse mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] rounded-[2rem] p-6 border border-white/5 h-36 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
