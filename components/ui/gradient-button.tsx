'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'purple' | 'red' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantMap = {
  primary: 'bg-gradient-to-r from-[#14F1D9] to-[#0BB8A7] text-[#070B12] font-semibold hover:shadow-[0_0_20px_rgba(20,241,217,0.4)] active:shadow-none',
  purple:  'bg-gradient-to-r from-[#7C5CFF] to-[#5B3FD9] text-white font-semibold hover:shadow-[0_0_20px_rgba(124,92,255,0.4)] active:shadow-none',
  red:     'bg-gradient-to-r from-[#FF4D6D] to-[#C9284A] text-white font-semibold hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] active:shadow-none',
  ghost:   'bg-transparent text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.06]',
  outline: 'bg-transparent border border-[rgba(20,241,217,0.3)] text-[#14F1D9] hover:bg-[rgba(20,241,217,0.08)] hover:border-[rgba(20,241,217,0.6)]',
};

const sizeMap = {
  sm:  'h-8 px-3 text-xs rounded-lg gap-1.5',
  md:  'h-9 px-4 text-sm rounded-xl gap-2',
  lg:  'h-11 px-6 text-sm rounded-xl gap-2',
};

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  onClick,
  type = 'button',
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="32" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}
