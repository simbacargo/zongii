import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTZS(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'TZS 0';
  return 'TZS ' + num.toLocaleString('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatDate(iso: string, includeTime = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  if (includeTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleDateString('en-GB', opts);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'violet' },
  PENDING_PICKING:  { label: 'Pending Picking',  color: 'amber'  },
  PICKING:          { label: 'Picking',           color: 'blue'   },
  PARTIALLY_PICKED: { label: 'Partial',           color: 'orange' },
  PICKED:           { label: 'Picked',            color: 'cyan'   },
  VERIFIED:         { label: 'Verified',          color: 'green'  },
  RE_PICK_REQUIRED: { label: 'Re-pick',           color: 'purple' },
  REJECTED:         { label: 'Rejected',          color: 'red'    },
  DISPATCHED:       { label: 'Dispatched',        color: 'emerald'},
  CANCELLED:        { label: 'Cancelled',         color: 'gray'   },
};
