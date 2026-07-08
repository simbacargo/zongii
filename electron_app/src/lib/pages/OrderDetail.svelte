<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { orders } from '$lib/api';
  import { formatTZS, formatDate } from '$lib/utils';
  import { user } from '$lib/stores/auth';
  import { toast } from 'svelte-sonner';
  import type { SaleOrder } from '$lib/types';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Spinner from '$lib/components/Spinner.svelte';

  let { id }: { id: string } = $props();

  let order = $state<SaleOrder | null>(null);
  let loading = $state(true);
  let actionLoading = $state(false);
  let note = $state('');

  const orderId = $derived(Number(id));

  async function load() {
    loading = true;
    try { order = await orders.get(orderId); }
    catch { toast.error('Failed to load order.'); }
    finally { loading = false; }
  }

  onMount(load);
  $effect(() => { orderId; load(); });

  async function accountantReview(action: 'approve' | 'reject') {
    actionLoading = true;
    try {
      await orders.accountantReview(orderId, action, note);
      toast.success(action === 'approve' ? 'Order approved and sent to warehouse.' : 'Order rejected.');
      await load();
      note = '';
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { actionLoading = false; }
  }

  async function verify(action: 'approve' | 'reject' | 're_pick') {
    actionLoading = true;
    try {
      await orders.verify(orderId, action, note);
      toast.success('Action completed.');
      await load();
      note = '';
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { actionLoading = false; }
  }

  async function dispatch() {
    if (!confirm('Mark as dispatched? Stock will be reduced.')) return;
    actionLoading = true;
    try {
      await orders.dispatch(orderId);
      toast.success('Order dispatched successfully.');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { actionLoading = false; }
  }

  const canAccountantReview = $derived(
    order?.workflow_status === 'PENDING_APPROVAL' &&
    ($user?.is_accountant || $user?.is_admin || $user?.is_superuser)
  );

  const canVerify = $derived(
    ['PICKED', 'PARTIALLY_PICKED', 'RE_PICK_REQUIRED'].includes(order?.workflow_status ?? '')
  );

  const canDispatch = $derived(order?.workflow_status === 'VERIFIED');
</script>

<div class="max-w-5xl mx-auto">

  <div class="flex items-center gap-3 mb-6">
    <button onclick={() => navigate('/orders')} class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
      <i class="bi bi-arrow-left text-sm text-gray-600"></i>
    </button>
    {#if order}
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-black font-mono text-gray-900">{order.order_code}</h1>
          <StatusBadge status={order.workflow_status} />
        </div>
        <p class="text-sm text-gray-400 mt-0.5">{formatDate(order.created_at, true)} · {order.created_by_username}</p>
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="flex justify-center py-20"><Spinner size="lg" /></div>
  {:else if order}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

      <!-- Line items -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <i class="bi bi-cart3 text-gray-400"></i>
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Order Items</h3>
        </div>
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-50">
            <tr>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-left">Product</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Qty</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Unit Price</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each order.sales as sale}
              <tr>
                <td class="px-5 py-3">
                  <div class="text-sm font-semibold text-gray-800">{sale.product_name}</div>
                  <div class="text-[11px] text-gray-400">{sale.product_brand}</div>
                </td>
                <td class="px-5 py-3 text-center text-sm font-bold text-gray-700">{sale.quantity_sold}</td>
                <td class="px-5 py-3 text-right text-sm text-gray-600">{formatTZS(sale.price_per_unit)}</td>
                <td class="px-5 py-3 text-right text-sm font-black text-gray-900">{formatTZS(sale.total_amount)}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 border-t border-gray-100">
              <td colspan="3" class="px-5 py-3 text-xs font-black text-gray-400 uppercase text-right">Total</td>
              <td class="px-5 py-3 text-right text-lg font-black text-indigo-600">{formatTZS(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
          {#if order.customer_name}
            <p class="font-black text-gray-900">{order.customer_name}</p>
          {:else}
            <p class="text-sm text-gray-400">Walk-in Customer</p>
          {/if}
        </div>

        <!-- Audit trail -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">History</h3>
          <div class="space-y-2">
            {#each order.history as entry}
              <div class="text-xs text-gray-500">
                <span class="font-bold text-gray-700">{entry.to_status.replace(/_/g,' ')}</span>
                {#if entry.changed_by_username} · {entry.changed_by_username}{/if}
                <br />{formatDate(entry.changed_at, true)}
                {#if entry.note}<br /><em class="text-gray-400">{entry.note}</em>{/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Action Panel -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

      {#if order.workflow_status === 'PENDING_APPROVAL'}
        <div class="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
          <i class="bi bi-shield-check text-violet-500 text-lg"></i>
          <p class="text-sm text-violet-700">Awaiting accountant approval before going to warehouse.</p>
        </div>
        {#if canAccountantReview}
          <textarea bind:value={note} placeholder="Note (optional)" rows="2"
            class="w-full border-2 border-gray-100 focus:border-violet-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none"></textarea>
          <div class="flex gap-2">
            <button onclick={() => accountantReview('approve')} disabled={actionLoading}
              class="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition">
              <i class="bi bi-shield-check"></i> Approve &amp; Send to Warehouse
            </button>
            <button onclick={() => accountantReview('reject')} disabled={actionLoading}
              class="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition ml-auto">
              <i class="bi bi-x-circle"></i> Reject
            </button>
          </div>
        {/if}

      {:else if order.workflow_status === 'PENDING_PICKING'}
        <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <i class="bi bi-hourglass-split text-amber-500 text-lg"></i>
          <p class="text-sm text-amber-700">Waiting for a picker to accept this order.</p>
        </div>

      {:else if order.workflow_status === 'PICKING'}
        <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <i class="bi bi-box-arrow-in-down text-blue-500 text-lg"></i>
          <p class="text-sm text-blue-700">Order is currently being picked.</p>
        </div>

      {:else if canVerify}
        <div class="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
          <i class="bi bi-check2-square text-cyan-600 text-lg"></i>
          <p class="text-sm text-cyan-700">Ready for verification.</p>
        </div>
        <textarea bind:value={note} placeholder="Verification note (optional)" rows="2"
          class="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none"></textarea>
        <div class="flex flex-wrap gap-2">
          <button onclick={() => verify('approve')} disabled={actionLoading}
            class="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition">
            <i class="bi bi-patch-check-fill"></i> Approve &amp; Gate Pass
          </button>
          <button onclick={() => verify('re_pick')} disabled={actionLoading}
            class="flex items-center gap-2 px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-bold rounded-xl transition">
            <i class="bi bi-arrow-repeat"></i> Request Re-pick
          </button>
          <button onclick={() => verify('reject')} disabled={actionLoading}
            class="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition ml-auto">
            <i class="bi bi-x-circle"></i> Reject
          </button>
        </div>

      {:else if canDispatch}
        <div class="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <i class="bi bi-patch-check-fill text-green-500 text-lg"></i>
          <p class="text-sm text-green-700">Verified. Ready to dispatch.</p>
        </div>
        <button onclick={dispatch} disabled={actionLoading}
          class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition">
          <i class="bi bi-truck"></i> Confirm Dispatch
        </button>

      {:else if order.workflow_status === 'DISPATCHED'}
        <div class="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <i class="bi bi-truck text-emerald-500 text-lg"></i>
          <p class="text-sm text-emerald-700">Dispatched on {formatDate(order.dispatched_at ?? '', true)}.</p>
        </div>

      {:else if order.workflow_status === 'REJECTED'}
        <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
          <i class="bi bi-x-circle-fill text-red-500 text-lg"></i>
          <p class="text-sm text-red-700">This order was rejected.</p>
        </div>
      {/if}

    </div>
  {/if}
</div>
