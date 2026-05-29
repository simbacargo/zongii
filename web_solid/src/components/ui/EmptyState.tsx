interface EmptyStateProps {
  icon?: string;
  message: string;
  sub?: string;
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class={`bi bi-${props.icon ?? "inbox"} text-5xl mb-3 opacity-30`} />
      <p class="text-sm font-bold text-gray-500">{props.message}</p>
      {props.sub && <p class="text-xs text-gray-400 mt-1">{props.sub}</p>}
    </div>
  );
}
