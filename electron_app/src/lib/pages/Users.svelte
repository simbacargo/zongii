<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from '$lib/router';
  import { users } from '$lib/api';
  import { formatDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import type { User } from '$lib/types';
  import Spinner from '$lib/components/Spinner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let items = $state<User[]>([]);
  let loading = $state(true);

  const roleColor: Record<string, string> = {
    admin:      'bg-red-100 text-red-700',
    manager:    'bg-purple-100 text-purple-700',
    accountant: 'bg-blue-100 text-blue-700',
    picker:     'bg-amber-100 text-amber-700',
    sales:      'bg-indigo-100 text-indigo-700',
    staff:      'bg-gray-100 text-gray-500',
  };

  async function load() {
    loading = true;
    try {
      items = await users.list();
    } finally { loading = false; }
  }

  async function toggleActive(u: User, e: Event) {
    e.stopPropagation();
    try {
      await users.toggleActive(u.id);
      toast.success(`${u.username} ${u.is_active ? 'deactivated' : 'activated'}.`);
      await load();
    } catch { toast.error('Failed to toggle status.'); }
  }

  onMount(load);
</script>

<div class="flex items-center justify-between mb-6">
  <PageHeader title="Users &amp; Permissions" subtitle="{items.length} staff members" />
  <button onclick={() => toast.info('Add staff form coming soon.')} class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
    <i class="bi bi-person-plus"></i> Add Staff
  </button>
</div>

{#if loading}
  <div class="flex justify-center py-20"><Spinner size="lg" /></div>
{:else}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">User</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Role</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Email</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase">Joined</th>
          <th class="px-5 py-3 text-xs font-bold text-gray-400 uppercase text-center">Active</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each items as u}
          <tr class="hover:bg-gray-50/50 cursor-pointer" onclick={() => navigate(`/users/${u.id}`)}>
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <i class="bi bi-person-fill text-indigo-500 text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{u.username}</p>
                  <p class="text-xs text-gray-400">{u.full_name}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md capitalize {roleColor[u.role] ?? roleColor.staff}">{u.role}</span>
            </td>
            <td class="px-5 py-3 text-sm text-gray-500">{u.email || '—'}</td>
            <td class="px-5 py-3 text-xs text-gray-400">{formatDate(u.date_joined)}</td>
            <td class="px-5 py-3 text-center">
              <button
                onclick={(e) => toggleActive(u, e)}
                class="w-8 h-5 rounded-full transition-colors relative {u.is_active ? 'bg-green-500' : 'bg-gray-300'}">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all {u.is_active ? 'left-3.5' : 'left-0.5'}"></span>
              </button>
            </td>
          </tr>
        {:else}
          <tr><td colspan="5" class="px-5 py-10 text-center text-sm text-gray-400">No users found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
