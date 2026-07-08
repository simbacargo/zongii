<script lang="ts">
  import { onMount } from 'svelte';
  import { Toaster } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  import { currentPath, navigate, matchRoute } from '$lib/router';
  import AppShell from '$lib/components/AppShell.svelte';

  import Login from '$lib/pages/Login.svelte';
  import Dashboard from '$lib/pages/Dashboard.svelte';
  import Sales from '$lib/pages/Sales.svelte';
  import Orders from '$lib/pages/Orders.svelte';
  import OrderDetail from '$lib/pages/OrderDetail.svelte';
  import Picking from '$lib/pages/Picking.svelte';
  import Inventory from '$lib/pages/Inventory.svelte';
  import Customers from '$lib/pages/Customers.svelte';
  import Billing from '$lib/pages/Billing.svelte';
  import Users from '$lib/pages/Users.svelte';
  import Notifications from '$lib/pages/Notifications.svelte';

  onMount(() => authStore.init());

  // Auth guard
  $effect(() => {
    const s = $authStore;
    if (!s.initialized) return;
    if (!s.user && $currentPath !== '/login') navigate('/login');
    if (s.user && $currentPath === '/login') navigate('/dashboard');
  });

  const routes: { pattern: string; component: any }[] = [
    { pattern: '/dashboard',      component: Dashboard },
    { pattern: '/sales',          component: Sales },
    { pattern: '/orders',         component: Orders },
    { pattern: '/orders/:id',     component: OrderDetail },
    { pattern: '/picking',        component: Picking },
    { pattern: '/inventory',      component: Inventory },
    { pattern: '/customers',      component: Customers },
    { pattern: '/billing',        component: Billing },
    { pattern: '/users',          component: Users },
    { pattern: '/notifications',  component: Notifications },
  ];

  const matched = $derived.by(() => {
    for (const r of routes) {
      const params = matchRoute(r.pattern, $currentPath);
      if (params) return { component: r.component, params };
    }
    return null;
  });
</script>

<Toaster richColors position="top-right" />

{#if $currentPath === '/login'}
  <Login />
{:else if $authStore.user}
  <AppShell>
    {#if matched?.component === OrderDetail}
      <OrderDetail id={matched.params.id} />
    {:else if matched}
      {@const Comp = matched.component}
      <Comp />
    {:else}
      <div class="flex flex-col items-center justify-center py-24 text-center">
        <i class="bi bi-compass text-3xl text-gray-300 mb-3"></i>
        <p class="text-sm text-gray-400">This page isn't built yet.</p>
        <button onclick={() => navigate('/dashboard')} class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition">
          Back to Dashboard
        </button>
      </div>
    {/if}
  </AppShell>
{/if}
