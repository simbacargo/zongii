import { createResource, createSignal, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { orders } from "../../../lib/api";
import { formatTZS, formatDate, statusLabel, statusClass } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { useAuth } from "../../../contexts/auth";
import type { WorkflowStatus } from "../../../types";

export default function OrderDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const u = () => state.user!;
  const isAdmin = () => u().is_admin || u().is_superuser;
  const isAccountant = () => u().is_accountant || isAdmin();

  const [order, { refetch }] = createResource(() => orders.get(Number(params.id)));

  const [actionModal, setActionModal] = createSignal<string | null>(null);
  const [note, setNote] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  async function accountantAction(action: "approve" | "reject") {
    setSaving(true); setErr("");
    try {
      await orders.accountantReview(Number(params.id), action, note());
      setActionModal(null);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function verifyAction(action: "approve" | "reject" | "re_pick") {
    setSaving(true); setErr("");
    try {
      await orders.verify(Number(params.id), action, note());
      setActionModal(null);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function dispatch() {
    if (!confirm("Dispatch this order?")) return;
    try {
      await orders.dispatch(Number(params.id));
      refetch();
    } catch (e: any) { alert(e.message); }
  }

  const ws = () => order()?.workflow_status as WorkflowStatus;

  return (
    <div>
      <button onClick={() => navigate("/orders")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Orders
      </button>

      <Show when={!order.loading} fallback={<PageLoader />}>
        <Show when={order()}>
          {(o) => (
            <div class="space-y-6">
              {/* Header */}
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{o().order_code}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">{o().customer_name ?? "Walk-in"} · {formatDate(o().created_at, true)}</p>
                </div>
                <div class="flex items-center gap-3">
                  <Badge status={o().workflow_status} />
                  {/* Action buttons based on workflow status */}
                  <Show when={isAccountant() && ws() === "PENDING_APPROVAL"}>
                    <button onClick={() => { setNote(""); setActionModal("accountant-approve"); }} class="text-sm font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">Approve</button>
                    <button onClick={() => { setNote(""); setActionModal("accountant-reject"); }} class="text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">Reject</button>
                  </Show>
                  <Show when={isAdmin() && (ws() === "PICKED" || ws() === "PARTIALLY_PICKED" || ws() === "RE_PICK_REQUIRED")}>
                    <button onClick={() => { setNote(""); setActionModal("verify-approve"); }} class="text-sm font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">Verify</button>
                    <button onClick={() => { setNote(""); setActionModal("verify-re_pick"); }} class="text-sm font-bold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors">Re-pick</button>
                    <button onClick={() => { setNote(""); setActionModal("verify-reject"); }} class="text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">Reject</button>
                  </Show>
                  <Show when={isAdmin() && ws() === "VERIFIED"}>
                    <button onClick={dispatch} class="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">Dispatch</button>
                  </Show>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order details */}
                <div class="lg:col-span-2 space-y-5">
                  {/* Line items */}
                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                      <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Order Items</h3>
                      <span class="text-sm font-black text-indigo-600">{formatTZS(o().total_amount)}</span>
                    </div>
                    <table class="w-full">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                          <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Qty</th>
                          <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Price</th>
                          <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-50">
                        <For each={o().sales}>
                          {(s) => (
                            <tr class="hover:bg-gray-50/60">
                              <td class="px-5 py-3 text-sm font-semibold text-gray-800">{s.product_name}</td>
                              <td class="px-5 py-3 text-right text-sm text-gray-700">{s.quantity_sold}</td>
                              <td class="px-5 py-3 text-right text-sm text-gray-700">{formatTZS(s.price_per_unit)}</td>
                              <td class="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatTZS(s.total_amount)}</td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>

                  {/* Picking orders */}
                  <Show when={o().picking_orders?.length > 0}>
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div class="px-5 py-4 border-b border-gray-50">
                        <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Picking Orders</h3>
                      </div>
                      <div class="divide-y divide-gray-50">
                        <For each={o().picking_orders}>
                          {(po) => (
                            <div class="px-5 py-4">
                              <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-800">Picking #{po.id}</span>
                                <span class={`text-xs font-bold px-2 py-0.5 rounded-full ${statusClass(po.status)}`}>{statusLabel(po.status)}</span>
                              </div>
                              <p class="text-xs text-gray-400">Picker: {po.picker_username ?? "Unassigned"} · Created: {formatDate(po.created_at, true)}</p>
                              <Show when={po.items?.length > 0}>
                                <div class="mt-3 space-y-1">
                                  <For each={po.items}>
                                    {(item) => (
                                      <div class="flex items-center justify-between text-xs">
                                        <span class="text-gray-700">{item.product_name}</span>
                                        <span class={`font-bold ${item.picked_qty >= item.requested_qty ? "text-green-600" : "text-amber-600"}`}>
                                          {item.picked_qty}/{item.requested_qty}
                                        </span>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                </div>

                {/* History sidebar */}
                <div class="space-y-4">
                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Order Info</h3>
                    <dl class="space-y-2.5">
                      <InfoRow label="Created by" value={o().created_by_username} />
                      <InfoRow label="Customer" value={o().customer_name ?? "Walk-in"} />
                      {o().verified_by_username && <InfoRow label="Verified by" value={o().verified_by_username!} />}
                      {o().dispatched_at && <InfoRow label="Dispatched" value={formatDate(o().dispatched_at!)} />}
                      {o().notes && <InfoRow label="Notes" value={o().notes} />}
                    </dl>
                  </div>

                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-50">
                      <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">History</h3>
                    </div>
                    <div class="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                      <For each={[...(o().history ?? [])].reverse()}>
                        {(h) => (
                          <div class="px-5 py-3">
                            <p class="text-xs font-bold text-gray-700">{h.to_status}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5">{h.changed_by_username} · {formatDate(h.changed_at, true)}</p>
                            {h.note && <p class="text-xs text-gray-500 mt-1 italic">{h.note}</p>}
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </Show>

      {/* Action Modals */}
      <Modal title="Add Note (Optional)" open={actionModal() !== null} onClose={() => setActionModal(null)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Note</label>
            <textarea rows={3} class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={note()} onInput={e => setNote(e.currentTarget.value)} placeholder="Optional note…" />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setActionModal(null)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button
              disabled={saving()}
              onClick={() => {
                const a = actionModal()!;
                if (a === "accountant-approve") accountantAction("approve");
                else if (a === "accountant-reject") accountantAction("reject");
                else if (a === "verify-approve") verifyAction("approve");
                else if (a === "verify-reject") verifyAction("reject");
                else if (a === "verify-re_pick") verifyAction("re_pick");
              }}
              class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving() ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{props.label}</dt>
      <dd class="text-sm text-gray-800 mt-0.5">{props.value}</dd>
    </div>
  );
}
