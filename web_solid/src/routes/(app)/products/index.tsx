import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { products, categories } from "../../../lib/api";
import { formatTZS } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { ActiveBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../../contexts/auth";

export default function ProductsPage() {
  const { state } = useAuth();
  const isAdmin = () => state.user?.is_admin || state.user?.is_superuser;

  const [q, setQ] = createSignal("");
  const [categoryFilter, setCategoryFilter] = createSignal("");
  const [lowStock, setLowStock] = createSignal(false);

  const [catList] = createResource(() => categories.list());
  const [productList, { refetch }] = createResource(
    () => {
      const params = new URLSearchParams();
      if (q()) params.set("q", q());
      if (categoryFilter()) params.set("category", categoryFilter());
      if (lowStock()) params.set("low_stock", "true");
      const s = params.toString();
      return s ? `?${s}` : "";
    },
    (params) => products.list(params),
  );

  const [showAdd, setShowAdd] = createSignal(false);
  const [showRefill, setShowRefill] = createSignal<number | null>(null);
  const [saving, setSaving] = createSignal(false);
  const [formError, setFormError] = createSignal("");

  // Add product form
  const [newName, setNewName] = createSignal("");
  const [newBrand, setNewBrand] = createSignal("");
  const [newPart, setNewPart] = createSignal("");
  const [newQty, setNewQty] = createSignal("0");
  const [newMinPrice, setNewMinPrice] = createSignal("");
  const [newMaxPrice, setNewMaxPrice] = createSignal("");
  const [newReorder, setNewReorder] = createSignal("10");

  async function addProduct() {
    setSaving(true);
    setFormError("");
    try {
      await products.create({
        name: newName(),
        brand: newBrand(),
        part_number: newPart(),
        quantity_at_hand: Number(newQty()),
        min_price: newMinPrice() || null,
        max_price: newMaxPrice() || null,
        reorder_point: Number(newReorder()),
      });
      setShowAdd(false);
      refetch();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Refill form
  const [refillQty, setRefillQty] = createSignal("0");
  const [refillNotes, setRefillNotes] = createSignal("");

  async function submitRefill() {
    const id = showRefill();
    if (!id) return;
    setSaving(true);
    setFormError("");
    try {
      await products.refill(id, { quantity_added: Number(refillQty()), notes: refillNotes() });
      setShowRefill(null);
      refetch();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Products</h1>
          <p class="text-sm text-gray-500 mt-0.5">Inventory catalogue</p>
        </div>
        <Show when={isAdmin()}>
          <button
            onClick={() => setShowAdd(true)}
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors"
          >
            <i class="bi bi-plus-lg" /> Add Product
          </button>
        </Show>
      </div>

      {/* Filters */}
      <div class="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search name, brand, part…"
          value={q()}
          onInput={e => setQ(e.currentTarget.value)}
          class="flex-1 min-w-48 px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoryFilter()}
          onChange={e => setCategoryFilter(e.currentTarget.value)}
          class="px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Categories</option>
          <For each={catList() ?? []}>
            {(c) => <option value={String(c.id)}>{c.name}</option>}
          </For>
        </select>
        <label class="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer">
          <input type="checkbox" checked={lowStock()} onChange={e => setLowStock(e.currentTarget.checked)} class="rounded" />
          Low stock only
        </label>
      </div>

      <Show when={!productList.loading} fallback={<PageLoader />}>
        <Show when={(productList() ?? []).length > 0} fallback={
          <EmptyState icon="archive" message="No products found" sub="Try adjusting your filters" />
        }>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Price Range</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={productList() ?? []}>
                  {(p) => {
                    const isLow = () => p.quantity_at_hand <= p.reorder_point;
                    return (
                      <tr class="hover:bg-gray-50/60 transition-colors">
                        <td class="px-5 py-3">
                          <p class="text-sm font-bold text-gray-900">{p.name}</p>
                          <p class="text-xs text-gray-400">{p.brand} · {p.part_number}</p>
                        </td>
                        <td class="px-5 py-3">
                          <span class={`text-sm font-black ${isLow() ? "text-red-600" : "text-gray-900"}`}>
                            {p.quantity_at_hand}
                          </span>
                          {isLow() && (
                            <span class="ml-1.5 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Low</span>
                          )}
                          <p class="text-[10px] text-gray-400">Reorder at {p.reorder_point}</p>
                        </td>
                        <td class="px-5 py-3 text-sm text-gray-700">
                          {p.min_price && p.max_price
                            ? `${formatTZS(p.min_price)} – ${formatTZS(p.max_price)}`
                            : p.min_price ? formatTZS(p.min_price) : "—"}
                        </td>
                        <td class="px-5 py-3">
                          <ActiveBadge active={p.is_active} />
                        </td>
                        <td class="px-5 py-3 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <A
                              href={`/products/${p.id}`}
                              class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              View
                            </A>
                            <Show when={isAdmin()}>
                              <button
                                onClick={() => { setRefillQty("0"); setRefillNotes(""); setShowRefill(p.id); }}
                                class="text-xs font-bold text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                              >
                                Refill
                              </button>
                            </Show>
                          </div>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>

      {/* Add Product Modal */}
      <Modal title="Add Product" open={showAdd()} onClose={() => setShowAdd(false)} size="md">
        <div class="space-y-4">
          {formError() && <p class="text-sm text-red-600">{formError()}</p>}
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Name *</label>
              <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newName()} onInput={e => setNewName(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Brand *</label>
              <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newBrand()} onInput={e => setNewBrand(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Part Number</label>
              <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newPart()} onInput={e => setNewPart(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Min Price (TZS)</label>
              <input type="number" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newMinPrice()} onInput={e => setNewMinPrice(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Max Price (TZS)</label>
              <input type="number" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newMaxPrice()} onInput={e => setNewMaxPrice(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Initial Qty</label>
              <input type="number" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newQty()} onInput={e => setNewQty(e.currentTarget.value)} />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">Reorder Point</label>
              <input type="number" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newReorder()} onInput={e => setNewReorder(e.currentTarget.value)} />
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={addProduct} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Add Product"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Refill Modal */}
      <Modal title="Refill Stock" open={showRefill() !== null} onClose={() => setShowRefill(null)} size="sm">
        <div class="space-y-4">
          {formError() && <p class="text-sm text-red-600">{formError()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Quantity to Add</label>
            <input type="number" min="1" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={refillQty()} onInput={e => setRefillQty(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
            <textarea rows="2" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={refillNotes()} onInput={e => setRefillNotes(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowRefill(null)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={submitRefill} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Confirm Refill"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
