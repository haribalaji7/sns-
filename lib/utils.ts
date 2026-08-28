import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds into human-readable duration */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

/** Relative time string */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Severity → colour mapping */
export const severityColor: Record<string, string> = {
  critical: '#FF4D6D',
  high:     '#FFB347',
  medium:   '#14F1D9',
  low:      '#22D3A5',
};

export const severityBg: Record<string, string> = {
  critical: 'rgba(255, 77, 109, 0.15)',
  high:     'rgba(255, 179, 71, 0.15)',
  medium:   'rgba(20, 241, 217, 0.15)',
  low:      'rgba(34, 211, 165, 0.15)',
};

export const statusColor: Record<string, string> = {
  active:      '#FF4D6D',
  responding:  '#FFB347',
  contained:   '#14F1D9',
  resolved:    '#22D3A5',
  false_alarm: '#8B9AB4',
};
