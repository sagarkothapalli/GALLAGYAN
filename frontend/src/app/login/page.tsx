'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Sun, 
  Moon, 
  ChevronRight,
  ArrowLeft,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [isLampOn, setIsLampOn] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, passcode: password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);
        // Successful login - redirect to home
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(error.detail || 'Access Denied');
      }
    } catch (err) {
      alert('Connection to Treasury failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden transition-all duration-1000 flex items-center justify-center p-6",
      isLampOn ? "bg-[#121214]" : "bg-[#050505]"
    )}>
      
      {/* Immersive Ambient Lighting */}
      <AnimatePresence>
        {isLampOn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Main Lamp Glow */}
            <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-yellow-500/15 rounded-full blur-[160px] animate-pulse" />
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[140px]" />
            
            {/* Floor Reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-yellow-500/5 to-transparent" />
            
            {/* Glass Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 lg:gap-4 items-center relative z-10">
        
        {/* Functional Interactive Lamp */}
        <div className="hidden lg:flex flex-col items-center justify-center relative min-h-[550px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Halo around the lamp when on */}
            <AnimatePresence>
              {isLampOn && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 -m-20 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="relative">
              {/* Lamp Head - Removed overflow-hidden to keep string visible */}
              <motion.div 
                animate={{ 
                  background: isLampOn 
                    ? "linear-gradient(145deg, #fbbf24 0%, #d97706 100%)" 
                    : "linear-gradient(145deg, #1f2937 0%, #111827 100%)",
                  boxShadow: isLampOn 
                    ? "0 10px 40px -5px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)" 
                    : "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)"
                }}
                className="w-48 h-40 rounded-t-[100px] relative border-b-[6px] border-black/20 flex flex-col items-center justify-center z-20"
              >
                {/* Character Expression */}
                <div className="flex gap-10 mb-2 relative z-10">
                  <motion.div 
                    animate={{ height: isLampOn ? 20 : 3 }} 
                    className={cn("w-4 rounded-full transition-all duration-500", isLampOn ? "bg-[#1a1a1a]" : "bg-slate-600")} 
                  />
                  <motion.div 
                    animate={{ height: isLampOn ? 20 : 3 }} 
                    className={cn("w-4 rounded-full transition-all duration-500", isLampOn ? "bg-[#1a1a1a]" : "bg-slate-600")} 
                  />
                </div>
                <motion.div 
                  animate={{ 
                    width: isLampOn ? 40 : 20, 
                    height: isLampOn ? 12 : 2, 
                    borderRadius: isLampOn ? "0 0 40px 40px" : "2px" 
                  }}
                  className={cn("transition-all duration-500", isLampOn ? "bg-[#1a1a1a]" : "bg-slate-600")} 
                />

                {/* THE PULL STRING - Positioned relatively to avoid clipping */}
                <motion.div 
                  onClick={() => setIsLampOn(!isLampOn)}
                  whileHover={{ y: 8 }}
                  whileTap={{ y: 30 }}
                  className="absolute top-[100%] right-10 cursor-pointer flex flex-col items-center group/string z-30"
                >
                  {/* String Line */}
                  <div className={cn(
                    "w-[2px] h-24 origin-top transition-colors duration-500", 
                    isLampOn ? "bg-slate-400" : "bg-slate-800"
                  )} />
                  {/* Pull Handle (Weighted Ball) */}
                  <div className={cn(
                    "w-8 h-8 rounded-full border-[3px] shadow-2xl transition-all duration-500 relative -mt-1",
                    isLampOn 
                      ? "bg-yellow-400 border-white/20 shadow-yellow-500/20 scale-110" 
                      : "bg-slate-700 border-white/5 shadow-none"
                  )}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-transparent" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Lamp Body/Stand */}
              <div className={cn(
                "w-7 h-32 mx-auto transition-colors duration-700 relative z-10", 
                isLampOn ? "bg-slate-200" : "bg-[#1a1a1a]"
              )}>
                 <div className="absolute inset-y-0 left-0 w-1 bg-black/5" />
              </div>
              <div className={cn(
                "w-36 h-8 rounded-[40px] mx-auto transition-colors duration-700 shadow-xl", 
                isLampOn ? "bg-slate-200" : "bg-[#111]"
              )}>
                 <div className="h-full w-full bg-gradient-to-b from-white/10 to-transparent rounded-[40px]" />
              </div>
            </div>
          </motion.div>

          {/* Quick Stats/Badges - Integrated properly */}
          <div className="mt-12 flex gap-8">
             <div className={cn("text-center transition-opacity duration-700", isLampOn ? "opacity-60" : "opacity-0")}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status</p>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-center mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Encrypted
                </div>
             </div>
             <div className={cn("text-center transition-opacity duration-700", isLampOn ? "opacity-60" : "opacity-0")}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session ID</p>
                <p className="text-xs font-bold text-white mt-1">GY-9921-X</p>
             </div>
          </div>
        </div>

        {/* Professional Minimalist Login Interface */}
        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative p-10 md:p-12 rounded-[48px] border transition-all duration-700 backdrop-blur-2xl",
              isLampOn 
                ? "bg-white/[0.03] border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]" 
                : "bg-black/40 border-white/5"
            )}
          >
            <div className="mb-12">
              <Link href="/" className={cn(
                "inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] transition-colors mb-10 group",
                isLampOn ? "text-slate-500 hover:text-white" : "text-transparent pointer-events-none"
              )}>
                <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" /> GallaGyan Home
              </Link>
              <h2 className={cn(
                "text-4xl font-black tracking-tighter mb-4 transition-colors duration-700",
                isLampOn ? "text-white" : "text-slate-900"
              )}>
                Sign In
              </h2>
              <p className={cn(
                "text-sm font-medium transition-colors duration-700",
                isLampOn ? "text-slate-400" : "text-slate-900"
              )}>
                Authorized analyst access required. <br/>Enter your treasury credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative group">
                  <div className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
                    isFocused === 'username' ? "text-yellow-500" : "text-slate-600"
                  )}><Mail size={18} strokeWidth={2.5} /></div>
                  <input 
                    onFocus={() => setIsFocused('username')}
                    onBlur={() => setIsFocused(null)}
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={!isLampOn}
                    placeholder="Analyst Username"
                    className={cn(
                      "w-full py-4.5 pl-14 pr-6 rounded-[24px] border outline-none transition-all text-sm font-bold",
                      isLampOn 
                        ? "bg-white/5 border-white/10 text-white focus:border-yellow-500/40 focus:bg-white/[0.08] placeholder:text-slate-600" 
                        : "bg-black border-white/5 text-transparent cursor-not-allowed placeholder:text-transparent shadow-inner"
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <div className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
                    isFocused === 'password' ? "text-yellow-500" : "text-slate-600"
                  )}><Lock size={18} strokeWidth={2.5} /></div>
                  <input 
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={!isLampOn}
                    placeholder="Access Passcode"
                    className={cn(
                      "w-full py-4.5 pl-14 pr-6 rounded-[24px] border outline-none transition-all text-sm font-bold",
                      isLampOn 
                        ? "bg-white/5 border-white/10 text-white focus:border-yellow-500/40 focus:bg-white/[0.08] placeholder:text-slate-600" 
                        : "bg-black border-white/5 text-transparent cursor-not-allowed placeholder:text-transparent shadow-inner"
                    )}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end py-1">
                {showForgotMsg ? (
                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                    Contact admin to reset your passcode
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForgotMsg(true)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors",
                      isLampOn ? "text-slate-500 hover:text-yellow-500" : "text-transparent pointer-events-none"
                    )}
                  >
                    Forgot Passcode?
                  </button>
                )}
              </div>

              <motion.button 
                whileHover={isLampOn ? { y: -2, scale: 1.01 } : {}}
                whileTap={isLampOn ? { scale: 0.98 } : {}}
                disabled={!isLampOn || isLoading}
                className={cn(
                  "w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all",
                  isLampOn 
                    ? "bg-yellow-500 text-black shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] hover:bg-yellow-400" 
                    : "bg-[#111] text-slate-800 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Initialise Session <ChevronRight size={16} strokeWidth={3} /></>
                )}
              </motion.button>
            </form>

            <div className="mt-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className={cn("transition-colors", isLampOn ? "text-emerald-500" : "text-slate-900")} />
                 <span className={cn("text-[9px] font-black uppercase tracking-widest", isLampOn ? "text-slate-500" : "text-slate-900")}>Secure Session</span>
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setIsLampOn(true)} 
                  className={cn("p-2 rounded-xl transition-all", isLampOn ? "bg-white/10 text-yellow-500 shadow-sm" : "text-slate-800")}
                >
                  <Sun size={14} />
                </button>
                <button 
                  onClick={() => setIsLampOn(false)} 
                  className={cn("p-2 rounded-xl transition-all", !isLampOn ? "bg-white/10 text-blue-500 shadow-sm" : "text-slate-800")}
                >
                  <Moon size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        input::placeholder { font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; font-size: 10px; }
      `}</style>
    </div>
  );
}
