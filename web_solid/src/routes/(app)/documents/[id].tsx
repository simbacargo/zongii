import { createResource, createSignal, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { documents } from "../../../lib/api";
import { formatTZS, formatDate, DOC_STATUSES } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { Modal } from "../../../components/ui/Modal";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function DocumentDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [doc, { refetch }] = createResource(() => documents.get(Number(params.id)));

  const [showStatus, setShowStatus] = createSignal(false);
  const [newStatus, setNewStatus] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  async function updateStatus() {
    setSaving(true); setErr("");
    try {
      await documents.setStatus(Number(params.id), newStatus());
      setShowStatus(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <button onClick={() => navigate("/documents")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Documents
      </button>

      <Show when={!doc.loading} fallback={<PageLoader />}>
        <Show when={doc()}>
          {(d) => (
            <div class="space-y-5 max-w-3xl">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-2xl font-black text-gray-900">{d().number ?? `#${d().id}`}</h1>
                    <span class={`text-xs font-bold px-2.5 py-1 rounded-full ${d().doc_type === "invoice" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                      {d().doc_type}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">{d().customer_name} · {formatDate(d().created_at)}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[d().status] ?? "bg-gray-100 text-gray-600"}`}>
                    {d().status}
                  </span>
                  <button onClick={() => { setNewStatus(d().status); setShowStatus(true); }} class="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                    Change Status
                  </button>
                </div>
              </div>

              {/* Line items */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th class="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</th>
                      <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Qty</th>
                      <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit Price</th>
                      <th class="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <For each={d().items}>
                      {(item) => (
                        <tr class="hover:bg-gray-50/60">
                          <td class="px-5 py-3 text-sm text-gray-800">{item.description}</td>
                          <td class="px-5 py-3 text-right text-sm text-gray-700">{item.quantity}</td>
                          <td class="px-5 py-3 text-right text-sm text-gray-700">{formatTZS(item.unit_price)}</td>
                          <td class="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatTZS(item.total)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                  <tfoot class="bg-gray-50 border-t border-gray-100">
                    {d().discount_amount && parseFloat(d().discount_amount) > 0 && (
                      <>
                        <tr>
                          <td colspan={3} class="px-5 py-2 text-right text-xs font-bold text-gray-500">Subtotal</td>
                          <td class="px-5 py-2 text-right text-sm font-bold text-gray-900">{formatTZS(d().subtotal)}</td>
                        </tr>
                        <tr>
                          <td colspan={3} class="px-5 py-2 text-right text-xs font-bold text-gray-500">Discount ({d().discount_percent}%)</td>
                          <td class="px-5 py-2 text-right text-sm font-bold text-red-600">-{formatTZS(d().discount_amount)}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td colspan={3} class="px-5 py-3 text-right text-sm font-black text-gray-900">Total</td>
                      <td class="px-5 py-3 text-right text-lg font-black text-indigo-600">{formatTZS(d().total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Info */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Created by" value={d().created_by_username} />
                  <Row label="Issue Date" value={formatDate(d().issue_date)} />
                  {d().due_date && <Row label="Due Date" value={formatDate(d().due_date!)} />}
                  {d().notes && <Row label="Notes" value={d().notes} />}
                  {d().terms && <Row label="Terms" value={d().terms} />}
                </dl>
              </div>
            </div>
          )}
        </Show>
      </Show>

      <Modal title="Update Status" open={showStatus()} onClose={() => setShowStatus(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">New Status</label>
            <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newStatus()} onChange={e => setNewStatus(e.currentTarget.value)}>
              <For each={DOC_STATUSES}>
                {(s) => <option value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>}
              </For>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowStatus(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={updateStatus} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Update"}
            </button>
          </div>
        </div>
      </Modal>
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
