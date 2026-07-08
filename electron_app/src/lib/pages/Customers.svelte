<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { customers } from '$lib/api';
  import { formatTZS, formatDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { Customer } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<Customer[]>([]);
  let loading = $state(true);
  let q = $state('');
  let showDebtors = $state(false);

  async function load() {
    loading = true;
    try {
      if (showDebtors) {
        items = await customers.debtors();
      } else {
        const params = new URLSearchParams();
        if (q) params.set('search', q);
        items = await customers.list(params.toString() ? `?${params}` : '');
      }
    } finally { loading = false; }
  }

  onMount(load);
  $effect(() => { q; showDebtors; load(); });
</script>

<div class="flex items-center justify-between mb-6">
  <PageHeader title="Customers" subtitle="{items.length} customers" />
  <button onclick={() => toast.info('Add customer form coming soon.')} class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
    <i class="bi bi-person-plus"></i> Add Customer
  </button>
</div>

<div class="flex gap-3 mb-4">
  <input type="text" placeholder="Search customers…" bind:value={q}
    class="flex-1 max-w-sm px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-white outline-none text-sm" />
  <button
    onclick={() => showDebtors = !showDebtors}
    class="px-3 py-2 rounded-xl text-xs font-bold border transition {showDebtors ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}">
    <i class="bi bi-cash-stack"></i> Debtors Only
  </button>
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Name</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Phone</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Email</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Balance Due</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Due Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each items as c}
          <tr class="hover:bg-gray-50/50 cursor-pointer" onclick={() => navigate(`/customers/${c.id}`)}>
            <td class="px-5 py-3 text-sm font-semibold text-gray-800">{c.name}</td>
            <td class="px-5 py-3 text-sm text-gray-500">{c.phone || '—'}</td>
            <td class="px-5 py-3 text-sm text-gray-500">{c.email || '—'}</td>
            <td class="px-5 py-3 text-right text-sm font-black {parseFloat(c.remaining_balance) > 0 ? 'text-red-600' : 'text-gray-400'}">
              {parseFloat(c.remaining_balance) > 0 ? formatTZS(c.remaining_balance) : '—'}
            </td>
            <td class="px-5 py-3 text-xs text-gray-400">{c.debt_due_date ? formatDate(c.debt_due_date) : '—'}</td>
          </tr>
        {:else}
          <tr><td colspan="5" class="px-5 py-10 text-center text-sm text-gray-400">No customers found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
