import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../contexts/auth";
import { Spinner } from "../components/ui/Spinner";

export default function LoginPage() {
  const { login, state } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username(), password());
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-sm">
        {/* Logo */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100 mb-4">
            <img src="/Logo.png" alt="Zongii" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-2xl font-black text-gray-900">Zongii Mining</h1>
          <p class="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error() && (
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error()}
            </div>
          )}

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Username</label>
              <input
                type="text"
                value={username()}
                onInput={e => setUsername(e.currentTarget.value)}
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
                required
                autocomplete="username"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password()}
                onInput={e => setPassword(e.currentTarget.value)}
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
                required
                autocomplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading() || state.loading}
              class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
            >
              {loading() ? <Spinner size="sm" /> : null}
              {loading() ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
