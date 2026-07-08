<script lang="ts">
  import { navigate } from '$lib/router';
  import { authStore } from '$lib/stores/auth';
  import { toast } from 'svelte-sonner';

  let username = $state('');
  let password = $state('');
  let loading  = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true;
    try {
      await authStore.login(username, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
  <div class="w-full max-w-md">

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center">
          <span class="text-white font-black text-base">Z</span>
        </div>
        <span class="text-2xl font-black text-gray-900">Zongii Mining</span>
      </div>
      <p class="text-sm text-gray-500">Sign in to your account</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <form onsubmit={handleLogin} class="space-y-5">

        <div>
          <label for="username" class="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
          <input
            id="username"
            type="text"
            bind:value={username}
            required
            autocomplete="username"
            placeholder="your_username"
            class="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-gray-50 focus:bg-white outline-none transition text-sm"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 bg-gray-50 focus:bg-white outline-none transition text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition text-sm"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

      </form>
    </div>

  </div>
</div>
