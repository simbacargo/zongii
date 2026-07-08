<script lang="ts">
  import { STATUS_META } from '$lib/utils';

  let { status }: { status: string } = $props();

  const meta = STATUS_META[status] ?? { label: status, color: 'gray' };

  const colorClass: Record<string, string> = {
    violet:  'bg-violet-100  text-violet-700',
    amber:   'bg-amber-100   text-amber-700',
    blue:    'bg-blue-100    text-blue-700',
    orange:  'bg-orange-100  text-orange-600',
    cyan:    'bg-cyan-100    text-cyan-700',
    green:   'bg-green-100   text-green-700',
    purple:  'bg-purple-100  text-purple-700',
    red:     'bg-red-100     text-red-600',
    emerald: 'bg-emerald-100 text-emerald-700',
    gray:    'bg-gray-100    text-gray-500',
  };
</script>

<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide {colorClass[meta.color] ?? colorClass.gray}">
  {meta.label}
</span>
