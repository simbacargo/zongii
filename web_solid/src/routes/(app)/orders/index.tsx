import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { orders, customers as customersApi, products as productsApi } from "../../../lib/api";
import { formatTZS, formatDate, statusLabel, statusClass } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import type { WorkflowStatus } from "../../../types";

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "All" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "PENDING_PICKING", label: "Awaiting Pick" },
  { value: "PICKING", label: "Picking" },
  { value: "PICKED", label: "Picked" },
  { value: "VERIFIED", label: "Verified" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "REJECTED", label: "Rejected" },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = createSignal("");
  const [q, setQ] = createSignal("");

  const [orderList, { refetch }] = createResource(
    () => ({ status: statusFilter(), q: q() }),
    ({ status, q }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const s = params.toString();
      return orders.list(s ? `?${s}` : "");
    },
  );

  const [showNew, setShowNew] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [productList] = createResource(() => productsApi.list());
  const [customerList] = createResource(() => customersApi.list());

  const [orderCustomer, setOrderCustomer] = createSignal("");
  const [orderNotes, setOrderNotes] = createSignal("");
  const [lineItems, setLineItems] = createSignal([{ product: "", quantity_sold: "1", price_per_unit: "" }]);

  function addLine() {
    setLineItems([...lineItems(), { product: "", quantity_sold: "1", price_per_unit: "" }]);
  }
  function removeLine(i: number) {
    setLineItems(lineItems().filter((_, idx) => idx !== i));
  }
  function updateLine(i: number, field: string, value: string) {
    const next = [...lineItems()];
    next[i] = { ...next[i], [field]: value };
    setLineItems(next);
  }

  async function submitOrder() {
    setSaving(true); setErr("");
    try {
      const items = lineItems().map(li => ({
        product: Number(li.product),
        quantity_sold: Number(li.quantity_sold),
        price_per_unit: li.price_per_unit,
      }));
      await orders.create({
        customer: orderCustomer() ? Number(orderCustomer()) : null,
        notes: orderNotes(),
        items,
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
          <h1 class="text-2xl font-black text-gray-900">Sale Orders</h1>
          <p class="text-sm text-gray-500 mt-0.5">Order workflow management</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors"
        >
          <i class="bi bi-plus-lg" /> New Order
        </button>
      </div>

      {/* Filters */}
      <div class="flex flex-wrap gap-3 mb-5">
        <div class="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
          <For each={STATUS_TABS}>
            {(tab) => (
              <button
                onClick={() => setStatusFilter(tab.value)}
                class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter() === tab.value ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
        <input
          type="search"
          placeholder="Search order code, customer…"
          value={q()}
          onInput={e => setQ(e.currentTarget.value)}
          class="flex-1 min-w-40 px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Show when={!orderList.loading} fallback={<PageLoader />}>
        <Show when={(orderList() ?? []).length > 0} fallback={
          <EmptyState icon="box-seam" message="No orders found" />
        }>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Order</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Items</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Total</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={orderList() ?? []}>
                  {(order) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3">
                        <p class="text-sm font-black text-gray-900">{order.order_code}</p>
                        <p class="text-xs text-gray-400">{formatDate(order.created_at, true)}</p>
                      </td>
                      <td class="px-5 py-3 text-sm text-gray-600">{order.customer_name ?? <span class="italic text-gray-400">—</span>}</td>
                      <td class="px-5 py-3 text-sm text-gray-600">{order.item_count ?? "—"}</td>
                      <td class="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatTZS(order.total_amount)}</td>
                      <td class="px-5 py-3 text-center">
                        <Badge status={order.workflow_status} />
                      </td>
                      <td class="px-5 py-3 text-right">
                        <A href={`/orders/${order.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                          View
                        </A>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>

      {/* New Order Modal */}
      <Modal title="New Sale Order" open={showNew()} onClose={() => setShowNew(false)} size="lg">
        <div class="space-y-5">
          {err() && <p class="text-sm text-red-600">{err()}</p>}

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Customer (optional)</label>
              <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={orderCustomer()} onChange={e => setOrderCustomer(e.currentTarget.value)}>
                <option value="">Walk-in</option>
                <For each={customerList() ?? []}>
                  {(c) => <option value={String(c.id)}>{c.name}</option>}
                </For>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
              <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={orderNotes()} onInput={e => setOrderNotes(e.currentTarget.value)} placeholder="Optional notes…" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-xs font-bold text-gray-600">Line Items</label>
              <button onClick={addLine} class="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                + Add Item
              </button>
            </div>
            <div class="space-y-2">
              <For each={lineItems()}>
                {(item, i) => (
                  <div class="grid grid-cols-12 gap-2 items-end">
                    <div class="col-span-5">
                      <select class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.product} onChange={e => updateLine(i(), "product", e.currentTarget.value)}>
                        <option value="">Select product…</option>
                        <For each={productList() ?? []}>
                          {(p) => <option value={String(p.id)}>{p.name}</option>}
                        </For>
                      </select>
                    </div>
                    <div class="col-span-3">
                      <input type="number" min="1" placeholder="Qty" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.quantity_sold} onInput={e => updateLine(i(), "quantity_sold", e.currentTarget.value)} />
                    </div>
                    <div class="col-span-3">
                      <input type="number" min="0" placeholder="Price (TZS)" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={item.price_per_unit} onInput={e => updateLine(i(), "price_per_unit", e.currentTarget.value)} />
                    </div>
                    <div class="col-span-1 flex justify-center">
                      {lineItems().length > 1 && (
                        <button onClick={() => removeLine(i())} class="text-red-400 hover:text-red-600">
                          <i class="bi bi-x-circle text-base" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-gray-50">
            <button onClick={() => setShowNew(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={submitOrder} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Create Order"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
