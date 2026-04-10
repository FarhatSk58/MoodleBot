import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format ISO date string → 'Mar 30, 2026' */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a numeric score to 1 decimal place */
export function formatScore(score) {
  if (score === null || score === undefined) return '—';
  return Number(score).toFixed(1);
}

/** Score color class based on value */
export function scoreColor(score) {
  if (score >= 7) return 'text-emerald-600';
  if (score >= 4) return 'text-amber-600';
  return 'text-red-500';
}

/** AI status badge color */
export function statusColor(status) {
  const map = {
    published: 'bg-emerald-100 text-emerald-700',
    pending_review: 'bg-amber-100 text-amber-700',
    pending_ai: 'bg-blue-100 text-blue-700',
    processing: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-600',
    not_started: 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-slate-100 text-slate-500';
}

/** Human-friendly file size (e.g. "1.5 MB") */
export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = Number(bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const displayValue = unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${displayValue} ${units[unitIndex]}`;
}

/** Human readable AI status label */
export function statusLabel(status) {
  const map = {
    published: 'Published',
    pending_review: 'Pending Review',
    pending_ai: 'Pending AI',
    processing: 'Processing',
    rejected: 'Rejected',
    not_started: 'Not Started',
  };
  return map[status] || status;
}

/** Difficulty badge color */
export function difficultyColor(difficulty) {
  const map = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-600',
  };
  return map[difficulty] || 'bg-slate-100 text-slate-500';
}
