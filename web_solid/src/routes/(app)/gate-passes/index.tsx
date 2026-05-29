import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { gatePasses } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "false", label: "Active" },
  { value: "true", label: "Used" },
];

export default function GatePassesPage() {
  const [usedFilter, setUsedFilter] = createSignal("");

  const [gpList] = createResource(usedFilter, (used) => {
    const params = used ? `?used=${used}` : "";
    return gatePasses.list(params);
  });

  return (
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-black text-gray-900">Gate Passes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Dispatch authorisation documents</p>
      </div>

      <div class="flex bg-gray-100 rounded-xl p-1 w-fit mb-5">
        <For each={FILTER_TABS}>
          {(t) => (
            <button onClick={() => setUsedFilter(t.value)} class={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${usedFilter() === t.value ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}>
              {t.label}
            </button>
          )}
        </For>
      </div>

      <Show when={!gpList.loading} fallback={<PageLoader />}>
        <Show when={(gpList() ?? []).length > 0} fallback={<EmptyState icon="door-open" message="No gate passes found" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Gate Pass</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Order</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Verified By</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Issued</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={gpList() ?? []}>
                  {(gp) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3 text-sm font-bold text-gray-900">{gp.gp_code ?? `GP-${gp.id}`}</td>
                      <td class="px-5 py-3 text-sm text-gray-700">{gp.order_code ?? `Order #${gp.sale_order}`}</td>
                      <td class="px-5 py-3 text-sm text-gray-700">{gp.verified_by_username ?? "—"}</td>
                      <td class="px-5 py-3 text-sm text-gray-700">{formatDate(gp.issued_at, true)}</td>
                      <td class="px-5 py-3 text-center">
                        <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gp.is_used ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                          {gp.is_used ? "Used" : "Active"}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-right">
                        <A href={`/gate-passes/${gp.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">View</A>
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
