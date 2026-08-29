'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { loginAdmin } from './actions';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#14F1D9] opacity-10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00E59B] opacity-10 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-[#14F1D9]/20 to-[#00E59B]/20 rounded-3xl mx-auto flex items-center justify-center border border-white/5 shadow-[0_0_40px_rgba(20,241,217,0.15)] mb-6"
          >
            <Shield className="w-10 h-10 text-[#14F1D9]" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Command Center
          </h1>
          <p className="text-[#8B9AB4] text-sm">
            Administrator Authentication Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#8B9AB4] group-focus-within:text-[#14F1D9] transition-colors" />
            </div>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B9AB4] focus:outline-none focus:ring-2 focus:ring-[#14F1D9]/50 focus:border-[#14F1D9]/50 transition-all backdrop-blur-md"
              placeholder="Admin Email (e.g., admin@college.edu)"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#8B9AB4] group-focus-within:text-[#14F1D9] transition-colors" />
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#8B9AB4] focus:outline-none focus:ring-2 focus:ring-[#14F1D9]/50 focus:border-[#14F1D9]/50 transition-all backdrop-blur-md"
              placeholder="Password"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[#FF4D6D] text-sm text-center bg-[#FF4D6D]/10 py-2 rounded-xl border border-[#FF4D6D]/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#14F1D9] to-[#00E59B] text-[#070B12] font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(20,241,217,0.3)] hover:shadow-[0_0_30px_rgba(20,241,217,0.5)] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <form onSubmit={handleSubmit} className="mt-4">
          <input type="hidden" name="email" value="demo@admin.edu" />
          <input type="hidden" name="password" value="demo123" />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-2xl border border-white/10 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Skip Auth (Demo Login)</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8B9AB4] hover:text-[#14F1D9] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-4 text-center flex items-center justify-center space-x-2 text-xs text-[#8B9AB4]">
          <Sparkles className="w-3.5 h-3.5 text-[#14F1D9]" />
          <span>Secured by CampusShield AI Engine</span>
        </div>
      </motion.div>
    </div>
  );
}
