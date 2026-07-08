<script lang="ts">
  import { onMount } from 'svelte';
  import { notifications } from '$lib/api';
  import { timeAgo } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { Notification } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<Notification[]>([]);
  let loading = $state(true);

  async function load() {
    loading = true;
    try {
      items = await notifications.list();
    } finally { loading = false; }
  }

  async function markAllRead() {
    try {
      await notifications.markAllRead();
      items = items.map(n => ({ ...n, is_read: true }));
      toast.success('All notifications marked as read.');
    } catch { toast.error('Failed.'); }
  }

  async function markRead(n: Notification) {
    if (n.is_read) return;
    try {
      await notifications.markRead(n.id);
      items = items.map(i => i.id === n.id ? { ...i, is_read: true } : i);
    } catch { /* */ }
  }

  const unread = $derived(items.filter(n => !n.is_read).length);

  onMount(load);
</script>

<div class="flex items-center justify-between mb-6">
  <PageHeader title="Notifications" subtitle="{unread} unread" />
  {#if unread > 0}
    <button onclick={markAllRead} class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition">
      Mark all read
    </button>
  {/if}
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="space-y-2">
    {#each items as n}
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 cursor-pointer transition-colors {n.is_read ? 'opacity-60' : 'hover:bg-indigo-50/30'}"
        onclick={() => markRead(n)}
      >
        <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <i class="bi bi-bell-fill text-indigo-500 text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-gray-800 {n.is_read ? '' : 'text-gray-900'}">{n.title}</p>
            {#if !n.is_read}
              <span class="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1"></span>
            {/if}
          </div>
          {#if n.message}
            <p class="text-xs text-gray-500 mt-0.5">{n.message}</p>
          {/if}
          <p class="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
        No notifications yet.
      </div>
    {/each}
  </div>
{/if}
