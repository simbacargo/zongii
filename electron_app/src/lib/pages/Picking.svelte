<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { picking } from '$lib/api';
  import { formatDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { PickingOrder } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let myActive = $state<PickingOrder[]>([]);
  let pending = $state<PickingOrder[]>([]);
  let loading = $state(true);

  async function load() {
    loading = true;
    try {
      const [activeOrders, pendingOrders] = await Promise.all([
        picking.list('?status=ACCEPTED'),
        picking.list('?status=PENDING'),
      ]);
      myActive = activeOrders;
      pending = pendingOrders;
    } finally { loading = false; }
  }

  async function accept(id: number) {
    try {
      await picking.accept(id);
      toast.success('Picking order accepted.');
      await load();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  onMount(load);

  const statusColor: Record<string, string> = {
    PENDING:          'bg-gray-100 text-gray-500',
    ACCEPTED:         'bg-blue-100 text-blue-700',
    PARTIALLY_PICKED: 'bg-orange-100 text-orange-600',
    COMPLETED:        'bg-green-100 text-green-700',
  };
</script>

<PageHeader title="Picker Dashboard" subtitle="Manage warehouse picking orders" />

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}

  <!-- My active orders -->
  <div class="mb-8">
    <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">My Active Orders</h2>
    {#if myActive.length === 0}
      <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
        No active picking orders assigned to you.
      </div>
    {:else}
      <div class="grid gap-3">
        {#each myActive as po}
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
               onclick={() => navigate(`/picking/${po.id}`)}>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono text-sm font-black text-indigo-600">{po.picking_code}</span>
                <span class="font-mono text-xs text-gray-400">{po.order_code}</span>
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md {statusColor[po.status] ?? 'bg-gray-100 text-gray-500'}">{po.status.replace(/_/g,' ')}</span>
              </div>
              <p class="text-xs text-gray-400">{po.items.length} items · {formatDate(po.created_at)}</p>
            </div>
            <i class="bi bi-chevron-right text-gray-300"></i>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Pending orders -->
  <div>
    <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Pending — Available to Accept</h2>
    {#if pending.length === 0}
      <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
        No pending orders waiting to be picked.
      </div>
    {:else}
      <div class="grid gap-3">
        {#each pending as po}
          <div class="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono text-sm font-black text-amber-600">{po.picking_code}</span>
                <span class="font-mono text-xs text-gray-400">{po.order_code}</span>
              </div>
              <p class="text-xs text-gray-400">{po.items.length} items · {formatDate(po.created_at)}</p>
            </div>
            <button onclick={() => accept(po.id)}
              class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition">
              <i class="bi bi-hand-index-thumb"></i> Accept
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

{/if}
