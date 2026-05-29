import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { picking } from "../../../lib/api";
import { formatDate, statusClass, statusLabel } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuth } from "../../../contexts/auth";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "partially_picked", label: "Partial" },
  { value: "completed", label: "Completed" },
];

export default function PickingPage() {
  const { state } = useAuth();
  const [statusFilter, setStatusFilter] = createSignal("");
  const [mineOnly, setMineOnly] = createSignal(false);

  const [pickingList, { refetch }] = createResource(
    () => ({ status: statusFilter(), mine: mineOnly() }),
    ({ status, mine }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (mine) params.set("mine", "true");
      const s = params.toString();
      return picking.list(s ? `?${s}` : "");
    },
  );

  async function accept(id: number) {
    try { await picking.accept(id); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  const isPicker = () => state.user?.is_picker || state.user?.is_admin || state.user?.is_superuser;

  return (
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-black text-gray-900">Picker Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage picking assignments</p>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex bg-gray-100 rounded-xl p-1">
          <For each={STATUS_TABS}>
            {(t) => (
              <button onClick={() => setStatusFilter(t.value)} class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter() === t.value ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}>
                {t.label}
              </button>
            )}
          </For>
        </div>
        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
          <input type="checkbox" checked={mineOnly()} onChange={e => setMineOnly(e.currentTarget.checked)} class="rounded" />
          My picks only
        </label>
      </div>

      <Show when={!pickingList.loading} fallback={<PageLoader />}>
        <Show when={(pickingList() ?? []).length > 0} fallback={<EmptyState icon="boxes" message="No picking orders found" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Picking Order</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Picker</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Items</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Created</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={pickingList() ?? []}>
                  {(po) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3">
                        <p class="text-sm font-bold text-gray-900">{po.picking_code ?? `PO-${po.id}`}</p>
                        <p class="text-xs text-gray-400">{po.order_code ?? `Order #${po.sale_order}`}</p>
                      </td>
                      <td class="px-5 py-3 text-sm text-gray-700">{po.picker_username ?? <span class="italic text-gray-400">Unassigned</span>}</td>
                      <td class="px-5 py-3 text-sm text-gray-700">{po.items?.length ?? "—"}</td>
                      <td class="px-5 py-3 text-sm text-gray-700">{formatDate(po.created_at, true)}</td>
                      <td class="px-5 py-3 text-center">
                        <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass(po.status.toUpperCase())}`}>
                          {po.status}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <A href={`/picking/${po.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">View</A>
                          <Show when={isPicker() && po.status === "pending"}>
                            <button onClick={() => accept(po.id)} class="text-xs font-bold text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                              Accept
                            </button>
                          </Show>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>
    </div>
  );
}
