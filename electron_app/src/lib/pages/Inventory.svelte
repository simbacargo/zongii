<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { products } from '$lib/api';
  import { formatTZS } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { Product } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<Product[]>([]);
  let loading = $state(true);
  let q = $state('');
  let showLowStock = $state(false);

  async function load() {
    loading = true;
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (showLowStock) params.set('low_stock', '1');
      items = await products.list(params.toString() ? `?${params}` : '');
    } finally { loading = false; }
  }

  onMount(load);
  $effect(() => { q; showLowStock; load(); });
</script>

<div class="flex items-center justify-between mb-6">
  <PageHeader title="Inventory" subtitle="{items.length} products" />
  <button onclick={() => toast.info('Add product form coming soon.')} class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
    <i class="bi bi-plus-lg"></i> Add Product
  </button>
</div>

<div class="flex gap-3 mb-4">
  <input type="text" placeholder="Search products…" bind:value={q}
    class="flex-1 max-w-sm px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-white outline-none text-sm" />
  <button
    onclick={() => showLowStock = !showLowStock}
    class="px-3 py-2 rounded-xl text-xs font-bold border transition {showLowStock ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}">
    <i class="bi bi-exclamation-triangle"></i> Low Stock
  </button>
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Product</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Part No.</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Stock</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Buy Price</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Stock Value</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each items as p}
          <tr class="hover:bg-gray-50/50 cursor-pointer transition-colors" onclick={() => navigate(`/inventory/${p.id}`)}>
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                {#if p.product_photo}
                  <img src={p.product_photo} alt={p.name} class="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                {:else}
                  <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><i class="bi bi-box text-gray-300"></i></div>
                {/if}
                <div>
                  <p class="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p class="text-[11px] text-gray-400">{p.brand}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 text-xs font-mono text-gray-500">{p.part_number}</td>
            <td class="px-5 py-3 text-center">
              <span class="text-sm font-bold {p.available_stock <= p.reorder_point ? 'text-red-600' : 'text-gray-800'}">{p.available_stock}</span>
              {#if p.available_stock <= p.reorder_point}
                <i class="bi bi-exclamation-triangle-fill text-amber-500 text-xs ml-1"></i>
              {/if}
            </td>
            <td class="px-5 py-3 text-right text-sm text-gray-600">{formatTZS(p.buying_price)}</td>
            <td class="px-5 py-3 text-right text-sm font-black text-gray-900">{formatTZS(p.stock_value_at_cost)}</td>
            <td class="px-5 py-3 text-center">
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md {p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No products found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
