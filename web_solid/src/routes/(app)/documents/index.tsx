import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { documents, customers as customersApi } from "../../../lib/api";
import { formatTZS, formatDate, DOC_STATUSES } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "invoice", label: "Invoices" },
  { value: "quotation", label: "Quotations" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal("");

  const [docList, { refetch }] = createResource(
    () => ({ type: typeFilter(), status: statusFilter() }),
    ({ type, status }) => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      const s = params.toString();
      return documents.list(s ? `?${s}` : "");
    },
  );

  const [customerList] = createResource(() => customersApi.list());
  const [showNew, setShowNew] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [docType, setDocType] = createSignal<"invoice" | "quotation">("invoice");
  const [docCustomer, setDocCustomer] = createSignal("");
  const [docNotes, setDocNotes] = createSignal("");
  const [docItems, setDocItems] = createSignal([{ description: "", quantity: "1", unit_price: "" }]);

  function addItem() {
    setDocItems([...docItems(), { description: "", quantity: "1", unit_price: "" }]);
  }
  function updateItem(i: number, field: string, value: string) {
    const next = [...docItems()];
    next[i] = { ...next[i], [field]: value };
    setDocItems(next);
  }
  function removeItem(i: number) {
    setDocItems(docItems().filter((_, idx) => idx !== i));
  }

  async function create() {
    setSaving(true); setErr("");
    try {
      await documents.create({
        doc_type: docType(),
        customer: Number(docCustomer()),
        notes: docNotes(),
        items: docItems().map(i => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      setShowNew(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Invoices & Quotations</h1>
          <p class="text-sm text-gray-500 mt-0.5">Billing documents</p>
        </div>
        <button onClick={() => setShowNew(true)} class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <i class="bi bi-plus-lg" /> New Document
        </button>
      </div>

      <div class="flex flex-wrap gap-3 mb-5">
        <div class="flex bg-gray-100 rounded-xl p-1">
          <For each={TYPE_TABS}>
            {(t) => (
              <button onClick={() => setTypeFilter(t.value)} class={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${typeFilter() === t.value ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}>
                {t.label}
              </button>
            )}
          </For>
        </div>
        <select value={statusFilter()} onChange={e => setStatusFilter(e.currentTarget.value)} class="px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          <For each={DOC_STATUSES}>
            {(s) => <option value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>}
          </For>
        </select>
      </div>

      <Show when={!docList.loading} fallback={<PageLoader />}>
        <Show when={(docList() ?? []).length > 0} fallback={<EmptyState icon="file-earmark-text" message="No documents found" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Document</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Type</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Total</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={docList() ?? []}>
                  {(doc) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3">
                        <p class="text-sm font-bold text-gray-900">{doc.number ?? `#${doc.id}`}</p>
                        <p class="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                      </td>
                      <td class="px-5 py-3">
                        <span class={`text-xs font-bold px-2 py-0.5 rounded-full ${doc.doc_type === "invoice" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                          {doc.doc_type}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-sm text-gray-700">{doc.customer_name}</td>
                      <td class="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatTZS(doc.total)}</td>
                      <td class="px-5 py-3 text-center">
                        <span class={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-right">
                        <A href={`/documents/${doc.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">View</A>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>

      {/* New Document Modal */}
      <Modal title="New Document" open={showNew()} onClose={() => setShowNew(false)} size="lg">
        <div class="space-y-5">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Type</label>
              <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={docType()} onChange={e => setDocType(e.currentTarget.value as "invoice" | "quotation")}>
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Customer *</label>
              <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={docCustomer()} onChange={e => setDocCustomer(e.currentTarget.value)}>
                <option value="">Select customer…</option>
                <For each={customerList() ?? []}>
                  {(c) => <option value={String(c.id)}>{c.name}</option>}
                </For>
              </select>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-xs font-bold text-gray-600">Line Items</label>
              <button onClick={addItem} class="text-xs font-bold text-indigo-600 hover:text-indigo-800">+ Add Item</button>
            </div>
            <div class="space-y-2">
              <For each={docItems()}>
                {(item, i) => (
                  <div class="grid grid-cols-12 gap-2 items-end">
                    <div class="col-span-6">
                      <input placeholder="Description" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.description} onInput={e => updateItem(i(), "description", e.currentTarget.value)} />
                    </div>
                    <div class="col-span-2">
                      <input type="number" min="1" placeholder="Qty" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.quantity} onInput={e => updateItem(i(), "quantity", e.currentTarget.value)} />
                    </div>
                    <div class="col-span-3">
                      <input type="number" min="0" placeholder="Unit Price (TZS)" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.unit_price} onInput={e => updateItem(i(), "unit_price", e.currentTarget.value)} />
                    </div>
                    <div class="col-span-1 flex justify-center">
                      {docItems().length > 1 && (
                        <button onClick={() => removeItem(i())} class="text-red-400 hover:text-red-600">
                          <i class="bi bi-x-circle" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
            <textarea rows={2} class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={docNotes()} onInput={e => setDocNotes(e.currentTarget.value)} />
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-gray-50">
            <button onClick={() => setShowNew(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={create} disabled={saving() || !docCustomer()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Create Document"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
