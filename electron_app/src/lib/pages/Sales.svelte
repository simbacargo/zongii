<script lang="ts">
  import { products, customers } from '$lib/api';
  import { formatTZS } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { Product, Customer } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  interface CartItem { product: Product; qty: number; price: number; }

  let cart = $state<CartItem[]>([]);
  let searchQuery = $state('');
  let searchResults = $state<Product[]>([]);
  let searching = $state(false);
  let submitting = $state(false);
  let customerSearch = $state('');
  let customerResults = $state<Customer[]>([]);
  let selectedCustomer = $state<Customer | null>(null);
  let notes = $state('');

  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearch() {
    clearTimeout(searchTimeout);
    if (!searchQuery.trim()) { searchResults = []; return; }
    searching = true;
    searchTimeout = setTimeout(async () => {
      try {
        const res = await products.list(`?search=${encodeURIComponent(searchQuery)}`);
        searchResults = res.slice(0, 8);
      } finally { searching = false; }
    }, 300);
  }

  let customerTimeout: ReturnType<typeof setTimeout>;
  function handleCustomerSearch() {
    clearTimeout(customerTimeout);
    if (!customerSearch.trim()) { customerResults = []; return; }
    customerTimeout = setTimeout(async () => {
      const res = await customers.list(`?search=${encodeURIComponent(customerSearch)}`);
      customerResults = res.slice(0, 5);
    }, 300);
  }

  function addToCart(p: Product) {
    const existing = cart.find(i => i.product.id === p.id);
    if (existing) { existing.qty++; cart = [...cart]; }
    else cart = [...cart, { product: p, qty: 1, price: parseFloat(p.wholesale_price || p.buying_price) }];
    searchQuery = '';
    searchResults = [];
  }

  function removeFromCart(id: number) {
    cart = cart.filter(i => i.product.id !== id);
  }

  const total = $derived(cart.reduce((s, i) => s + i.qty * i.price, 0));

  async function checkout() {
    if (cart.length === 0) { toast.error('Cart is empty.'); return; }
    submitting = true;
    try {
      toast.info('Checkout via API not yet wired — connect to /api/orders/checkout/ when ready.');
    } finally { submitting = false; }
  }
</script>

<PageHeader title="New Sale" subtitle="Add items to cart and checkout" />

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

  <!-- Product search -->
  <div class="lg:col-span-2 space-y-4">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Search Products</h3>
      <div class="relative">
        <input
          type="text"
          placeholder="Search by name, brand, or part number…"
          bind:value={searchQuery}
          oninput={handleSearch}
          class="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-gray-50 focus:bg-white outline-none text-sm transition"
        />
        {#if searching}
          <div class="absolute right-3 top-2.5"><Spinner size="sm" /></div>
        {/if}
        {#if searchResults.length > 0}
          <div class="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
            {#each searchResults as p}
              <button
                type="button"
                onclick={() => addToCart(p)}
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition text-left"
              >
                <div class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {#if p.product_photo}
                    <img src={p.product_photo} alt={p.name} class="w-full h-full object-cover" />
                  {:else}
                    <i class="bi bi-box text-gray-300 text-sm"></i>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p class="text-xs text-gray-400">{p.brand} · Stock: {p.available_stock}</p>
                </div>
                <span class="text-sm font-black text-indigo-600 whitespace-nowrap">{formatTZS(p.wholesale_price)}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Cart -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <i class="bi bi-cart3 text-gray-400"></i>
        <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Cart ({cart.length})</h3>
      </div>
      {#if cart.length === 0}
        <div class="p-8 text-center text-sm text-gray-400">Search and add products above.</div>
      {:else}
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-50">
            <tr>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-left">Product</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Qty</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Price</th>
              <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
              <th class="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each cart as item}
              <tr>
                <td class="px-5 py-3 text-sm font-semibold text-gray-800">{item.product.name}</td>
                <td class="px-5 py-3 text-center">
                  <input
                    type="number" min="1" max={item.product.available_stock}
                    bind:value={item.qty}
                    onchange={() => cart = [...cart]}
                    class="w-16 text-center border-2 border-gray-100 focus:border-indigo-400 rounded-lg px-2 py-1 text-sm outline-none"
                  />
                </td>
                <td class="px-5 py-3 text-right">
                  <input
                    type="number" min="0" step="1"
                    bind:value={item.price}
                    onchange={() => cart = [...cart]}
                    class="w-28 text-right border-2 border-gray-100 focus:border-indigo-400 rounded-lg px-2 py-1 text-sm outline-none"
                  />
                </td>
                <td class="px-5 py-3 text-right text-sm font-black text-gray-900">{formatTZS(item.qty * item.price)}</td>
                <td class="px-3 py-3">
                  <button onclick={() => removeFromCart(item.product.id)}
                    class="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition flex items-center justify-center">
                    <i class="bi bi-x-lg text-xs"></i>
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 border-t border-gray-100">
              <td colspan="3" class="px-5 py-3 text-xs font-black text-gray-400 uppercase text-right">Total</td>
              <td class="px-5 py-3 text-right text-lg font-black text-indigo-600">{formatTZS(total)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      {/if}
    </div>
  </div>

  <!-- Checkout sidebar -->
  <div class="space-y-4">

    <!-- Customer -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
      {#if selectedCustomer}
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-800">{selectedCustomer.name}</p>
            <p class="text-xs text-gray-400">{selectedCustomer.phone || 'No phone'}</p>
          </div>
          <button onclick={() => { selectedCustomer = null; customerSearch = ''; }}
            class="text-gray-300 hover:text-red-400 transition"><i class="bi bi-x-lg text-sm"></i></button>
        </div>
      {:else}
        <div class="relative">
          <input type="text" placeholder="Search customer…" bind:value={customerSearch} oninput={handleCustomerSearch}
            class="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-gray-50 focus:bg-white outline-none text-sm transition" />
          {#if customerResults.length > 0}
            <div class="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              {#each customerResults as c}
                <button type="button" onclick={() => { selectedCustomer = c; customerSearch = ''; customerResults = []; }}
                  class="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-sm transition">
                  <p class="font-semibold text-gray-800">{c.name}</p>
                  <p class="text-xs text-gray-400">{c.phone}</p>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        <p class="text-xs text-gray-400 mt-2">Leave blank for walk-in customer.</p>
      {/if}
    </div>

    <!-- Notes -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
      <textarea bind:value={notes} rows="3" placeholder="Order notes…"
        class="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm outline-none resize-none"></textarea>
    </div>

    <!-- Submit -->
    <button
      onclick={checkout}
      disabled={cart.length === 0 || submitting}
      class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-black rounded-xl transition"
    >
      {submitting ? 'Submitting…' : `Submit Order · ${formatTZS(total)}`}
    </button>

  </div>
</div>
