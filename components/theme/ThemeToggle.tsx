'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Laptop, Check, Sparkles } from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'dropdown' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'icon',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-70 ${className}`}
        aria-hidden="true"
      >
        <Moon className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleCycleTheme = () => {
    soundEffects.playClick();
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const handleSelectTheme = (newTheme: 'dark' | 'light' | 'system') => {
    soundEffects.playClick();
    setTheme(newTheme);
    setDropdownOpen(false);
  };

  // 1. Segmented Switch Mode (Used in Settings, Topbars, Modals)
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-2xl bg-black/20 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl select-none ${className}`}
      >
        {[
          { id: 'dark', label: 'Dark', icon: Moon },
          { id: 'light', label: 'Light', icon: Sun },
          { id: 'system', label: 'System', icon: Laptop },
        ].map((item) => {
          const isSelected = theme === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTheme(item.id as any)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'text-foreground font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeThemePill"
                  className="absolute inset-0 rounded-xl bg-white/15 dark:bg-white/10 border border-primary/40 shadow-[0_0_12px_rgba(20,241,217,0.2)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 relative z-10 ${isSelected ? 'text-primary' : ''}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Dropdown Mode
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-3 py-1.5 rounded-xl glass border border-border flex items-center gap-2 text-xs font-mono font-bold text-foreground hover:border-primary/50 transition-all cursor-pointer shadow-sm"
        >
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-primary" />
          ) : theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-primary" />
          )}
          <span className="capitalize">{theme || 'Theme'}</span>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-36 rounded-2xl glass bg-card/95 border border-border p-1.5 z-50 shadow-2xl backdrop-blur-2xl"
            >
              {[
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'system', label: 'System Mode', icon: Laptop },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectTheme(opt.id as any)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                    theme === opt.id
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <opt.icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </div>
                  {theme === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3. Single Floating Icon Mode (Apple / Linear circular glass style)
  return (
    <button
      onClick={handleCycleTheme}
      className={`relative group w-9 h-9 rounded-xl glass border border-border/80 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 shadow-[0_0_15px_rgba(20,241,217,0.1)] hover:shadow-[0_0_20px_rgba(20,241,217,0.25)] transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      title={`Current: ${theme} (Click to toggle)`}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </motion.div>
        ) : theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 group-hover:rotate-45 transition-all" />
          </motion.div>
        ) : (
          <motion.div
            key="system"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <Laptop className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle hover ring */}
      <span className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}
