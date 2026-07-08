<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboard } from '$lib/api';
  import { formatTZS } from '$lib/utils';
  import type { DashboardData } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let data = $state<DashboardData | null>(null);
  let loading = $state(true);
  let period = $state('month');

  async function load() {
    loading = true;
    try { data = await dashboard.get(period); }
    catch (e) { console.error(e); }
    finally { loading = false; }
  }

  onMount(load);
  $effect(() => { period; load(); });

  const statCards = $derived(data ? [
    { label: 'Revenue',        value: formatTZS(data.revenue),          icon: 'cash-stack',           color: 'indigo' },
    { label: 'Profit',         value: formatTZS(data.profit),           icon: 'graph-up-arrow',       color: 'green'  },
    { label: 'Sales',          value: String(data.total_sales_count),   icon: 'cart-check',           color: 'blue'   },
    { label: 'Pending',        value: String(data.pending_count),       icon: 'hourglass-split',      color: 'amber'  },
    { label: 'Customers',      value: String(data.total_customers),     icon: 'people-fill',          color: 'purple' },
    { label: 'Outstanding',    value: formatTZS(data.total_debt),       icon: 'exclamation-triangle', color: 'red'    },
    { label: 'Low Stock',      value: String(data.low_stock_count),     icon: 'archive',              color: 'orange' },
  ] : []);

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    amber:  'bg-amber-50  text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50    text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };
</script>

<PageHeader title="Dashboard" subtitle="Business overview" />

<!-- Period selector -->
<div class="flex gap-2 mb-6">
  {#each [['week','This Week'],['month','This Month']] as [val, label]}
    <button
      onclick={() => period = val}
      class="px-3 py-1.5 rounded-lg text-xs font-bold transition {period === val
        ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}"
    >{label}</button>
  {/each}
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else if data}

  <!-- Stat grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {#each statCards as card}
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center {colorMap[card.color]}">
            <i class="bi bi-{card.icon} text-base"></i>
          </div>
          <span class="text-xs font-black text-gray-400 uppercase tracking-wide">{card.label}</span>
        </div>
        <p class="text-xl font-black text-gray-900">{card.value}</p>
      </div>
    {/each}
  </div>

  <!-- Top products -->
  {#if data.top_products?.length}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Top Products</h3>
    <div class="space-y-3">
      {#each data.top_products as p, i}
        <div class="flex items-center gap-4">
          <span class="w-5 text-xs font-black text-gray-300 text-right">{i + 1}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
            <p class="text-xs text-gray-400">{p.units_sold ?? 0} units</p>
          </div>
          <span class="text-sm font-black text-indigo-600 whitespace-nowrap">{formatTZS(p.revenue ?? 0)}</span>
        </div>
      {/each}
    </div>
  </div>
  {/if}

{/if}
