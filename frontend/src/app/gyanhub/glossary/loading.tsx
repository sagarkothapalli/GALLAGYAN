export default function GlossaryLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl animate-pulse" />
          <div className="w-24 h-4 bg-white/5 rounded-lg animate-pulse hidden md:block" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="w-32 h-4 bg-white/5 rounded-lg animate-pulse mb-4" />
        <div className="w-48 h-8 bg-white/5 rounded-xl animate-pulse mb-10" />
        <div className="w-full h-12 bg-white/[0.02] rounded-2xl border border-white/5 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/[0.02] rounded-[2rem] p-6 border border-white/5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
