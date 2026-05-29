export function formatTZS(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "TZS 0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "TZS 0";
  return "TZS " + num.toLocaleString("en-TZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatDate(iso: string | null | undefined, includeTime = false): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  if (includeTime) { opts.hour = "2-digit"; opts.minute = "2-digit"; }
  return d.toLocaleDateString("en-GB", opts);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING_APPROVAL: { label: "Pending Approval", color: "violet" },
  PENDING_PICKING:  { label: "Pending Picking",  color: "amber"  },
  PICKING:          { label: "Picking",           color: "blue"   },
  PARTIALLY_PICKED: { label: "Partial Pick",      color: "orange" },
  PICKED:           { label: "Picked",            color: "cyan"   },
  VERIFIED:         { label: "Verified",          color: "green"  },
  RE_PICK_REQUIRED: { label: "Re-pick Required",  color: "purple" },
  REJECTED:         { label: "Rejected",          color: "red"    },
  DISPATCHED:       { label: "Dispatched",        color: "emerald"},
  CANCELLED:        { label: "Cancelled",         color: "gray"   },
};

const COLOR_CLASSES: Record<string, string> = {
  violet:  "bg-violet-100 text-violet-700",
  amber:   "bg-amber-100 text-amber-700",
  blue:    "bg-blue-100 text-blue-700",
  orange:  "bg-orange-100 text-orange-700",
  cyan:    "bg-cyan-100 text-cyan-700",
  green:   "bg-green-100 text-green-700",
  purple:  "bg-purple-100 text-purple-700",
  red:     "bg-red-100 text-red-700",
  emerald: "bg-emerald-100 text-emerald-700",
  gray:    "bg-gray-100 text-gray-600",
  indigo:  "bg-indigo-100 text-indigo-700",
};

export function statusClass(status: string): string {
  const meta = STATUS_META[status];
  if (!meta) return "bg-gray-100 text-gray-600";
  return COLOR_CLASSES[meta.color] ?? "bg-gray-100 text-gray-600";
}

export function statusLabel(status: string): string {
  return STATUS_META[status]?.label ?? status;
}

export const ROLE_OPTIONS = [
  { value: "staff",      label: "Staff" },
  { value: "sales",      label: "Sales" },
  { value: "picker",     label: "Picker" },
  { value: "accountant", label: "Accountant" },
  { value: "manager",    label: "Manager" },
  { value: "admin",      label: "Admin" },
];

export const ALL_SECTIONS = ["inventory", "sales", "orders", "customers", "billing", "users"];

export const DOC_STATUSES = ["draft", "sent", "paid", "accepted", "rejected", "cancelled"];
