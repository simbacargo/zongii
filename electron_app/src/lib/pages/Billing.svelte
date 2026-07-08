<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { documents } from '$lib/api';
  import { formatTZS, formatDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { Document } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<Document[]>([]);
  let loading = $state(true);
  let typeFilter = $state('');
  let statusFilter = $state('');

  const DOC_STATUSES = ['draft','sent','paid','accepted','rejected','cancelled'];

  async function load() {
    loading = true;
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('doc_type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      items = await documents.list(params.toString() ? `?${params}` : '');
    } finally { loading = false; }
  }

  onMount(load);
  $effect(() => { typeFilter; statusFilter; load(); });

  const statusColor: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-500',
    sent:      'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
    accepted:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
    cancelled: 'bg-red-100 text-red-400',
  };
</script>

<div class="flex items-center justify-between mb-6">
  <PageHeader title="Invoices &amp; Quotations" subtitle="{items.length} documents" />
  <button onclick={() => toast.info('Document creation coming soon.')} class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
    <i class="bi bi-plus-lg"></i> New Document
  </button>
</div>

<div class="flex gap-2 mb-4 flex-wrap">
  {#each [['','All'],['invoice','Invoices'],['quotation','Quotations']] as [val, label]}
    <button onclick={() => typeFilter = val}
      class="px-3 py-1.5 rounded-lg text-xs font-bold transition {typeFilter === val ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}">
      {label}
    </button>
  {/each}
  <div class="w-px bg-gray-200 mx-1"></div>
  {#each DOC_STATUSES as s}
    <button onclick={() => statusFilter = statusFilter === s ? '' : s}
      class="px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize {statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}">
      {s}
    </button>
  {/each}
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Number</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Type</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Customer</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each items as doc}
          <tr class="hover:bg-gray-50/50 cursor-pointer" onclick={() => navigate(`/billing/${doc.id}`)}>
            <td class="px-5 py-3 font-mono text-sm font-bold text-indigo-600">{doc.number}</td>
            <td class="px-5 py-3 text-xs font-bold uppercase text-gray-500">{doc.doc_type}</td>
            <td class="px-5 py-3 text-sm text-gray-700">{doc.customer_name}</td>
            <td class="px-5 py-3 text-right text-sm font-black text-gray-900">{formatTZS(doc.total)}</td>
            <td class="px-5 py-3">
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md {statusColor[doc.status] ?? 'bg-gray-100 text-gray-500'}">{doc.status}</span>
            </td>
            <td class="px-5 py-3 text-xs text-gray-400">{formatDate(doc.issue_date)}</td>
          </tr>
        {:else}
          <tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No documents found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
