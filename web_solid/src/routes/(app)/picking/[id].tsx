import { createResource, createSignal, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { picking } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { useAuth } from "../../../contexts/auth";

export default function PickingDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();

  const [po, { refetch }] = createResource(() => picking.get(Number(params.id)));
  const isPicker = () => state.user?.is_picker || state.user?.is_admin || state.user?.is_superuser;

  const [pickedQtys, setPickedQtys] = createSignal<Record<number, number>>({});
  const [itemNotes, setItemNotes] = createSignal<Record<number, string>>({});
  const [pickerNotes, setPickerNotes] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  function setQty(itemId: number, qty: number) {
    setPickedQtys(prev => ({ ...prev, [itemId]: qty }));
  }
  function setNote(itemId: number, note: string) {
    setItemNotes(prev => ({ ...prev, [itemId]: note }));
  }

  async function accept() {
    try { await picking.accept(Number(params.id)); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  async function submit() {
    const currentPo = po();
    if (!currentPo) return;
    setSaving(true); setErr("");
    try {
      const items = currentPo.items.map(item => ({
        id: item.id,
        picked_qty: pickedQtys()[item.id] ?? 0,
        notes: itemNotes()[item.id] ?? "",
      }));
      await picking.submit(Number(params.id), items, pickerNotes());
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const canEdit = () => {
    const p = po();
    if (!p) return false;
    const u = state.user;
    return isPicker() && (p.status === "accepted" || p.status === "partially_picked") &&
      (p.picker === u?.id || state.user?.is_admin || state.user?.is_superuser);
  };

  return (
    <div class="max-w-3xl">
      <button onClick={() => navigate("/picking")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Picker Dashboard
      </button>

      <Show when={!po.loading} fallback={<PageLoader />}>
        <Show when={po()}>
          {(p) => (
            <div class="space-y-5">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{p().picking_code ?? `Picking #${p().id}`}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">Order {p().order_code ?? `#${p().sale_order}`} · {p().status}</p>
                </div>
                <div class="flex items-center gap-3">
                  <Show when={isPicker() && p().status === "pending"}>
                    <button onClick={accept} class="text-sm font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                      Accept Assignment
                    </button>
                  </Show>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Picker" value={p().picker_username ?? "Unassigned"} />
                  <Row label="Created" value={formatDate(p().created_at, true)} />
                  {p().accepted_at && <Row label="Accepted" value={formatDate(p().accepted_at!, true)} />}
                  {p().completed_at && <Row label="Completed" value={formatDate(p().completed_at!, true)} />}
                </dl>
              </div>

              {/* Items */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50">
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Items to Pick</h3>
                </div>
                <div class="divide-y divide-gray-50">
                  <For each={p().items}>
                    {(item) => (
                      <div class="px-5 py-4">
                        <div class="flex items-start justify-between mb-2">
                          <div>
                            <p class="text-sm font-bold text-gray-900">{item.product_name}</p>
                            <p class="text-xs text-gray-400">Requested: {item.requested_qty}</p>
                          </div>
                          <Show
                            when={canEdit()}
                            fallback={
                              <div class="text-right">
                                <p class={`text-lg font-black ${item.picked_qty >= item.requested_qty ? "text-green-600" : "text-amber-600"}`}>
                                  {item.picked_qty}/{item.requested_qty}
                                </p>
                                <p class="text-xs text-gray-400">picked</p>
                              </div>
                            }
                          >
                            <div class="flex items-center gap-3">
                              <span class="text-xs text-gray-500">Picked:</span>
                              <input
                                type="number"
                                min="0"
                                max={item.requested_qty}
                                class="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={pickedQtys()[item.id] ?? item.picked_qty}
                                onInput={e => setQty(item.id, Number(e.currentTarget.value))}
                              />
                              <span class="text-xs text-gray-400">/ {item.requested_qty}</span>
                            </div>
                          </Show>
                        </div>
                        <Show when={canEdit()}>
                          <input
                            placeholder="Notes for this item…"
                            class="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={itemNotes()[item.id] ?? item.notes}
                            onInput={e => setNote(item.id, e.currentTarget.value)}
                          />
                        </Show>
                        {!canEdit() && item.notes && (
                          <p class="text-xs text-gray-500 italic mt-1">{item.notes}</p>
                        )}
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <Show when={canEdit()}>
                {err() && <p class="text-sm text-red-600">{err()}</p>}
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-1.5">Picker Notes</label>
                    <textarea rows={2} class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={pickerNotes()} onInput={e => setPickerNotes(e.currentTarget.value)} placeholder="Overall notes…" />
                  </div>
                  <div class="flex justify-end">
                    <button onClick={submit} disabled={saving()} class="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                      {saving() ? "Submitting…" : "Submit Picking"}
                    </button>
                  </div>
                </div>
              </Show>
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
