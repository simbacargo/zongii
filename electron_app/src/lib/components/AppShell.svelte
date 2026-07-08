<script lang="ts">
  import { navigate, currentPath } from '$lib/router';
  import { authStore, user } from '$lib/stores/auth';
  import { notifications } from '$lib/api';
  import { onMount } from 'svelte';

  let { children } = $props();
  let unread = $state(0);

  onMount(async () => {
    try {
      const list = await notifications.list();
      unread = list.filter(n => !n.is_read).length;
    } catch { /* */ }
  });

  function logout() {
    authStore.logout();
    navigate('/login');
  }

  const navItems = [
    { href: '/dashboard',   label: 'Dashboard',         icon: 'grid',          section: null },
    { href: '/sales',       label: 'New Sale',           icon: 'cart-plus',     section: 'sales' },
    { href: '/orders',      label: 'Orders',             icon: 'box-seam',      section: 'orders' },
    { href: '/picking',     label: 'Picker Dashboard',   icon: 'boxes',         section: 'orders',   roles: ['picker', 'manager', 'admin'] },
    { href: '/inventory',   label: 'Products',           icon: 'archive',       section: 'inventory' },
    { href: '/customers',   label: 'Customers',          icon: 'people',        section: 'customers' },
    { href: '/billing',     label: 'Invoices',           icon: 'file-earmark-text', section: 'billing' },
    { href: '/users',       label: 'Users',              icon: 'shield-lock',   section: 'users' },
    { href: '/notifications', label: 'Notifications',   icon: 'bell',          section: null },
  ];

  function canSee(item: typeof navItems[0]): boolean {
    if (!$user) return false;
    if ($user.is_superuser || $user.is_admin) return true;
    if (item.roles && !item.roles.includes($user.role)) return false;
    if (!item.section) return true;
    return $user.allowed_sections?.includes(item.section) ?? false;
  }

  function isActive(href: string): boolean {
    return $currentPath.startsWith(href);
  }
</script>

{#if $user}
<div class="flex h-screen overflow-hidden bg-gray-50">

  <!-- Sidebar -->
  <aside class="w-64 shrink-0 h-screen flex flex-col bg-white border-r border-gray-100 sticky top-0">

    <!-- Logo -->
    <div class="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
        <span class="text-white font-black text-sm">Z</span>
      </div>
      <div>
        <span class="text-base font-black text-amber-500">Zongii <span class="text-[15px] font-bold">Mining</span></span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {#each navItems as item}
        {#if canSee(item)}
          <button
            onclick={() => navigate(item.href)}
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group text-left
              {isActive(item.href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
          >
            <i class="bi bi-{item.icon} text-base {isActive(item.href) ? 'text-indigo-600' : 'group-hover:text-indigo-600'}"></i>
            <span class="flex-1">{item.label}</span>
            {#if item.href === '/notifications' && unread > 0}
              <span class="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
            {/if}
          </button>
        {/if}
      {/each}
    </nav>

    <!-- User footer -->
    <div class="px-4 py-4 border-t border-gray-50">
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl">
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <i class="bi bi-person-fill text-indigo-500 text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-gray-800 truncate">{$user.username}</p>
          <p class="text-[10px] text-gray-400 capitalize">{$user.role}</p>
        </div>
        <button onclick={logout} class="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
          <i class="bi bi-box-arrow-right text-sm"></i>
        </button>
      </div>
    </div>

  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto">
    <div class="max-w-7xl mx-auto p-6">
      {@render children()}
    </div>
  </main>

</div>
{/if}
