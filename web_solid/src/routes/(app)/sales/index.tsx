import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { sales, products as productsApi, customers as customersApi } from "../../../lib/api";
import { formatTZS, formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SaleBadge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { useAuth } from "../../../contexts/auth";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function SalesPage() {
  const { state } = useAuth();
  const isAdmin = () => state.user?.is_admin || state.user?.is_superuser;

  const [statusFilter, setStatusFilter] = createSignal("");
  const [q, setQ] = createSignal("");

  const [saleList, { refetch }] = createResource(
    () => ({ status: statusFilter(), q: q() }),
    ({ status, q }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const s = params.toString();
      return sales.list(s ? `?${s}` : "");
    },
  );

  const [showNew, setShowNew] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [productList] = createResource(() => productsApi.list());
  const [customerList] = createResource(() => customersApi.list());

  const [newProduct, setNewProduct] = createSignal("");
  const [newQty, setNewQty] = createSignal("1");
  const [newPrice, setNewPrice] = createSignal("");
  const [newCustomer, setNewCustomer] = createSignal("");

  async function submitSale() {
    setSaving(true); setErr("");
    try {
      await sales.create({
        product: Number(newProduct()),
        quantity_sold: Number(newQty()),
        price_per_unit: newPrice(),
        customer: newCustomer() ? Number(newCustomer()) : null,
      });
      setShowNew(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function approve(id: number) {
    try { await sales.approve(id); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  async function reject(id: number) {
    try { await sales.reject(id); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Sales</h1>
          <p class="text-sm text-gray-500 mt-0.5">All sales transactions</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors"
        >
          <i class="bi bi-cart-plus" /> New Sale
        </button>
      </div>

      {/* Filters */}
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex bg-gray-100 rounded-xl p-1">
          <For each={STATUS_TABS}>
            {(tab) => (
              <button
                onClick={() => setStatusFilter(tab.value)}
                class={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${statusFilter() === tab.value ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
        <input
          type="search"
          placeholder="Search product, customer…"
          value={q()}
          onInput={e => setQ(e.currentTarget.value)}
          class="flex-1 min-w-40 px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Show when={!saleList.loading} fallback={<PageLoader />}>
        <Show when={(saleList() ?? []).length > 0} fallback={
          <EmptyState icon="receipt" message="No sales found" />
        }>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={saleList() ?? []}>
                  {(sale) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3">
                        <p class="text-sm font-bold text-gray-900">{sale.product_name}</p>
                        <p class="text-xs text-gray-400">{formatDate(sale.date_sold, true)} · {sale.quantity_sold} units</p>
                      </td>
                      <td class="px-5 py-3 text-sm text-gray-600">
                        {sale.customer_name ?? <span class="text-gray-400 italic">Walk-in</span>}
                      </td>
                      <td class="px-5 py-3 text-right">
                        <span class="text-sm font-black text-gray-900">{formatTZS(sale.total_amount)}</span>
                      </td>
                      <td class="px-5 py-3 text-center">
                        <SaleBadge aproved={sale.aproved} rejected={sale.rejected} />
                      </td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <A href={`/sales/${sale.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            View
                          </A>
                          <Show when={isAdmin() && !sale.aproved && !sale.rejected}>
                            <button onClick={() => approve(sale.id)} class="text-xs font-bold text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => reject(sale.id)} class="text-xs font-bold text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              Reject
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

      {/* New Sale Modal */}
      <Modal title="New Sale" open={showNew()} onClose={() => setShowNew(false)}>
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Product *</label>
            <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={newProduct()} onChange={e => setNewProduct(e.currentTarget.value)}>
              <option value="">Select product…</option>
              <For each={productList() ?? []}>
                {(p) => <option value={String(p.id)}>{p.name} ({p.brand}) — Stock: {p.quantity_at_hand}</option>}
              </For>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Quantity *</label>
              <input type="number" min="1" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newQty()} onInput={e => setNewQty(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Price per Unit (TZS) *</label>
              <input type="number" min="0" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newPrice()} onInput={e => setNewPrice(e.currentTarget.value)} />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Customer (optional)</label>
            <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={newCustomer()} onChange={e => setNewCustomer(e.currentTarget.value)}>
              <option value="">Walk-in (no customer)</option>
              <For each={customerList() ?? []}>
                {(c) => <option value={String(c.id)}>{c.name}</option>}
              </For>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowNew(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={submitSale} disabled={saving() || !newProduct() || !newPrice()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Record Sale"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
