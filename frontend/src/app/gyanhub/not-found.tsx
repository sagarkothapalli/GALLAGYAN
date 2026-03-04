import Link from 'next/link';

export default function GyanHubNotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl font-black text-yellow-500">
          ?
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-slate-400 font-medium mb-8">
          The GyanHub page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/gyanhub"
            className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
          >
            Go to GyanHub
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
