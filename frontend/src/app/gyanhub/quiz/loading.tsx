export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl animate-pulse" />
          <div className="w-24 h-4 bg-white/5 rounded-lg animate-pulse hidden md:block" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="w-48 h-4 bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="h-1 bg-white/5 rounded-full mb-10" />
        <div className="w-full h-8 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] rounded-[1.5rem] p-5 border border-white/5 h-14 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
