import { statusClass, statusLabel } from "../../lib/utils";

interface BadgeProps {
  status: string;
  label?: string;
  class?: string;
}

export function Badge(props: BadgeProps) {
  const label = () => props.label ?? statusLabel(props.status);
  const cls = () => statusClass(props.status);
  return (
    <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls()} ${props.class ?? ""}`}>
      {label()}
    </span>
  );
}

export function SaleBadge(props: { aproved: boolean; rejected: boolean }) {
  if (props.rejected) return <Badge status="REJECTED" />;
  if (props.aproved) return <Badge status="VERIFIED" label="Approved" />;
  return <Badge status="PENDING_APPROVAL" label="Pending" />;
}

export function ActiveBadge(props: { active: boolean }) {
  return props.active
    ? <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Active</span>
    : <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Inactive</span>;
}
