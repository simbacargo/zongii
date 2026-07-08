<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { orders } from '$lib/api';
  import { formatTZS, formatDate, STATUS_META } from '$lib/utils';
  import type { SaleOrderListItem } from '$lib/types';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<SaleOrderListItem[]>([]);
  let loading = $state(true);
  let statusFilter = $state('');
  let q = $state('');

  const STAGES = Object.entries(STATUS_META).map(([value, meta]) => ({ value, ...meta }));

  async function load() {
    loading = true;
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (q) params.set('q', q);
      items = await orders.list(params.toString() ? `?${params}` : '');
    } finally { loading = false; }
  }

  onMount(load);
  $effect(() => { statusFilter; q; load(); });
</script>

<PageHeader title="Sale Orders" subtitle="{items.length} orders" />

<!-- Status filter pills -->
<div class="flex flex-wrap gap-2 mb-4">
  <button
    onclick={() => statusFilter = ''}
    class="px-3 py-1 rounded-lg text-xs font-bold transition {!statusFilter ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}"
  >All</button>
  {#each STAGES as s}
    <button
      onclick={() => statusFilter = s.value}
      class="px-3 py-1 rounded-lg text-xs font-bold transition {statusFilter === s.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}"
    >{s.label}</button>
  {/each}
</div>

<!-- Search -->
<input
  type="text"
  placeholder="Search by order code or customer…"
  bind:value={q}
  class="w-full max-w-sm px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-white outline-none text-sm mb-4"
/>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Order</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Customer</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Items</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each items as order}
          <tr
            class="hover:bg-gray-50/50 cursor-pointer transition-colors"
            onclick={() => navigate(`/orders/${order.id}`)}
          >
            <td class="px-5 py-3 font-mono text-sm font-bold text-indigo-600">{order.order_code}</td>
            <td class="px-5 py-3 text-sm text-gray-700">{order.customer_name ?? 'Walk-in'}</td>
            <td class="px-5 py-3 text-center text-sm font-bold text-gray-600">{order.item_count}</td>
            <td class="px-5 py-3 text-right text-sm font-black text-gray-900">{formatTZS(order.total_amount)}</td>
            <td class="px-5 py-3"><StatusBadge status={order.workflow_status} /></td>
            <td class="px-5 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
          </tr>
        {:else}
          <tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No orders found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
