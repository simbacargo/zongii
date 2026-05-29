import { createResource, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { gatePasses } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";

export default function GatePassDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [gp] = createResource(() => gatePasses.get(Number(params.id)));

  return (
    <div class="max-w-2xl">
      <button onClick={() => navigate("/gate-passes")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Gate Passes
      </button>

      <Show when={!gp.loading} fallback={<PageLoader />}>
        <Show when={gp()}>
          {(g) => (
            <div class="space-y-5">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{g().gp_code ?? `Gate Pass #${g().id}`}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">Order: {g().order_code ?? `#${g().sale_order}`}</p>
                </div>
                <span class={`text-xs font-bold px-3 py-1.5 rounded-full ${g().is_used ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                  {g().is_used ? "Used" : "Active"}
                </span>
              </div>

              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Verified By" value={g().verified_by_username ?? "—"} />
                  <Row label="Issued At" value={formatDate(g().issued_at, true)} />
                  <Row label="Gate Pass #" value={String(g().gate_pass_number ?? g().id)} />
                  <Row label="Picking Order" value={g().picking_order ? `#${g().picking_order}` : "—"} />
                </dl>
              </div>

              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50">
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Items</h3>
                </div>
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                      <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Requested</th>
                      <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Picked</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <For each={g().items}>
                      {(item) => (
                        <tr class="hover:bg-gray-50/60">
                          <td class="px-5 py-3 text-sm text-gray-800">{item.product_name}</td>
                          <td class="px-5 py-3 text-right text-sm text-gray-700">{item.requested_qty}</td>
                          <td class={`px-5 py-3 text-right text-sm font-bold ${item.picked_qty >= item.requested_qty ? "text-green-600" : "text-amber-600"}`}>
                            {item.picked_qty}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}

function Row(props: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-xs font-bold text-gray-400 mb-0.5">{props.label}</dt>
      <dd class="text-sm text-gray-800">{props.value}</dd>
    </div>
  );
}
