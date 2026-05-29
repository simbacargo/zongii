import { createResource, For, Show } from "solid-js";
import { notifications as notifApi } from "../../lib/api";
import { timeAgo } from "../../lib/utils";
import { PageLoader } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

export default function NotificationsPage() {
  const [data, { refetch }] = createResource(() => notifApi.list());

  const notifList = () => data()?.results ?? [];

  async function markRead(id: number) {
    try { await notifApi.markRead(id); refetch(); }
    catch { /* */ }
  }

  async function markAll() {
    try { await notifApi.markAllRead(); refetch(); }
    catch { /* */ }
  }

  return (
    <div class="max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Notifications</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {data()?.unread_count ? `${data()!.unread_count} unread` : "All caught up"}
          </p>
        </div>
        <Show when={(data()?.unread_count ?? 0) > 0}>
          <button onClick={markAll} class="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
            Mark all read
          </button>
        </Show>
      </div>

      <Show when={!data.loading} fallback={<PageLoader />}>
        <Show when={notifList().length > 0} fallback={<EmptyState icon="bell" message="No notifications yet" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            <For each={notifList()}>
              {(n) => (
                <div class={`flex gap-4 px-5 py-4 transition-colors ${!n.is_read ? "bg-indigo-50/50" : "hover:bg-gray-50/60"}`}>
                  <div class={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!n.is_read ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                    <i class="bi bi-bell text-sm" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class={`text-sm font-bold ${!n.is_read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <Show when={!n.is_read}>
                    <button onClick={() => markRead(n.id)} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 self-start mt-0.5 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors">
                      Mark read
                    </button>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
