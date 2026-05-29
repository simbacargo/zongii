import { createResource, createSignal, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { products } from "../../../lib/api";
import { formatTZS, formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { Modal } from "../../../components/ui/Modal";
import { ActiveBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../../contexts/auth";

export default function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const isAdmin = () => state.user?.is_admin || state.user?.is_superuser;

  const [product, { refetch }] = createResource(() => products.get(Number(params.id)));
  const [refills] = createResource(() => products.refills(Number(params.id)));

  const [showRefill, setShowRefill] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [refillQty, setRefillQty] = createSignal("1");
  const [refillNotes, setRefillNotes] = createSignal("");

  async function submitRefill() {
    setSaving(true); setErr("");
    try {
      await products.refill(Number(params.id), { quantity_added: Number(refillQty()), notes: refillNotes() });
      setShowRefill(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function deactivate() {
    if (!confirm("Deactivate this product?")) return;
    try {
      await products.deactivate(Number(params.id));
      refetch();
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div>
      <button onClick={() => navigate("/products")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Products
      </button>

      <Show when={!product.loading} fallback={<PageLoader />}>
        <Show when={product()} fallback={<p class="text-red-500">Product not found.</p>}>
          {(p) => (
            <div class="space-y-6">
              {/* Header */}
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{p().name}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">{p().brand} · {p().part_number}</p>
                </div>
                <div class="flex items-center gap-3">
                  <ActiveBadge active={p().is_active} />
                  <Show when={isAdmin()}>
                    <button onClick={() => { setRefillQty("1"); setRefillNotes(""); setShowRefill(true); }}
                      class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl px-4 py-2 transition-colors">
                      <i class="bi bi-plus-circle" /> Refill
                    </button>
                    {p().is_active && (
                      <button onClick={deactivate} class="text-sm font-bold text-red-500 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Deactivate
                      </button>
                    )}
                  </Show>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Details card */}
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Product Details</h3>
                  <dl class="space-y-3">
                    <Row label="UPC / Barcode" value={p().upc_code || "—"} />
                    <Row label="Material" value={p().material || "—"} />
                    <Row label="Unit of Measure" value={p().unit_of_measure} />
                    <Row label="Bin Location" value={p().bin_location || "—"} />
                    <Row label="Supplier" value={p().supplier || "—"} />
                    <Row label="Lead Free" value={p().is_lead_free ? "Yes" : "No"} />
                    {p().max_pressure_psi && <Row label="Max Pressure" value={`${p().max_pressure_psi} PSI`} />}
                    <Row label="Tax Rate" value={`${p().tax_rate}%`} />
                    {p().categories.length > 0 && (
                      <div class="flex items-start gap-3">
                        <dt class="text-xs font-bold text-gray-400 w-32 shrink-0 pt-0.5">Categories</dt>
                        <dd class="flex flex-wrap gap-1">
                          <For each={p().categories}>
                            {c => <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">{c.name}</span>}
                          </For>
                        </dd>
                      </div>
                    )}
                    {p().description && <Row label="Description" value={p().description} />}
                  </dl>
                </div>

                {/* Stock & Pricing */}
                <div class="space-y-4">
                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Stock</h3>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="text-center">
                        <p class={`text-3xl font-black ${p().quantity_at_hand <= p().reorder_point ? "text-red-600" : "text-gray-900"}`}>{p().quantity_at_hand}</p>
                        <p class="text-xs text-gray-400 mt-1">On Hand</p>
                      </div>
                      <div class="text-center">
                        <p class="text-3xl font-black text-gray-900">{p().quantity_allocated}</p>
                        <p class="text-xs text-gray-400 mt-1">Allocated</p>
                      </div>
                      <div class="text-center">
                        <p class="text-3xl font-black text-indigo-600">{p().available_stock ?? (p().quantity_at_hand - p().quantity_allocated)}</p>
                        <p class="text-xs text-gray-400 mt-1">Available</p>
                      </div>
                    </div>
                    <p class="text-xs text-gray-400 text-center mt-3">Reorder point: {p().reorder_point}</p>
                  </div>

                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Pricing</h3>
                    <dl class="space-y-3">
                      <Row label="Buying Price" value={p().buying_price ? formatTZS(p().buying_price!) : "—"} />
                      <Row label="Wholesale Price" value={p().wholesale_price ? formatTZS(p().wholesale_price!) : "—"} />
                      <Row label="Min Sale Price" value={p().min_price ? formatTZS(p().min_price!) : "—"} />
                      <Row label="Max Sale Price" value={p().max_price ? formatTZS(p().max_price!) : "—"} />
                      <Row label="Stock Value" value={p().stock_value_at_cost ? formatTZS(p().stock_value_at_cost!) : "—"} />
                    </dl>
                  </div>
                </div>
              </div>

              {/* Refill History */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50">
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Refill History</h3>
                </div>
                <Show when={(refills() ?? []).length > 0} fallback={
                  <p class="text-sm text-gray-400 text-center py-8">No refills recorded yet.</p>
                }>
                  <table class="w-full">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                        <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Added</th>
                        <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">After</th>
                        <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">By</th>
                        <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <For each={refills() ?? []}>
                        {(r) => (
                          <tr class="hover:bg-gray-50/60">
                            <td class="px-5 py-3 text-sm text-gray-700">{formatDate(r.created_at, true)}</td>
                            <td class="px-5 py-3 text-sm font-bold text-green-600">+{r.quantity_added}</td>
                            <td class="px-5 py-3 text-sm text-gray-700">{r.quantity_after}</td>
                            <td class="px-5 py-3 text-sm text-gray-700">{r.refilled_by_username}</td>
                            <td class="px-5 py-3 text-sm text-gray-500">{r.notes || "—"}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </Show>
              </div>
            </div>
          )}
        </Show>
      </Show>

      {/* Refill Modal */}
      <Modal title="Refill Stock" open={showRefill()} onClose={() => setShowRefill(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Quantity to Add</label>
            <input type="number" min="1" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={refillQty()} onInput={e => setRefillQty(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
            <textarea rows={2} class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={refillNotes()} onInput={e => setRefillNotes(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowRefill(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={submitRefill} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Confirm Refill"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row(props: { label: string; value: string }) {
  return (
    <div class="flex items-start gap-3">
      <dt class="text-xs font-bold text-gray-400 w-32 shrink-0 pt-0.5">{props.label}</dt>
      <dd class="text-sm text-gray-800 flex-1">{props.value}</dd>
    </div>
  );
}
