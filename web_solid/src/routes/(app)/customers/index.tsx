import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { customers } from "../../../lib/api";
import { formatTZS } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";

export default function CustomersPage() {
  const [q, setQ] = createSignal("");
  const [customerList, { refetch }] = createResource(q, (search) => customers.list(search));

  const [showAdd, setShowAdd] = createSignal(false);
  const [showPay, setShowPay] = createSignal<number | null>(null);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [phone, setPhone] = createSignal("");

  async function addCustomer() {
    setSaving(true); setErr("");
    try {
      await customers.create({ name: name(), email: email(), phone: phone() });
      setShowAdd(false);
      setName(""); setEmail(""); setPhone("");
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const [payAmount, setPayAmount] = createSignal("");

  async function pay() {
    if (!showPay()) return;
    setSaving(true); setErr("");
    try {
      await customers.pay(showPay()!, Number(payAmount()));
      setShowPay(null);
      setPayAmount("");
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Customers</h1>
          <p class="text-sm text-gray-500 mt-0.5">Client directory & balances</p>
        </div>
        <button onClick={() => setShowAdd(true)} class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <i class="bi bi-person-plus" /> Add Customer
        </button>
      </div>

      <div class="mb-5">
        <input type="search" placeholder="Search name, phone, email…" value={q()} onInput={e => setQ(e.currentTarget.value)}
          class="w-full max-w-sm px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Show when={!customerList.loading} fallback={<PageLoader />}>
        <Show when={(customerList() ?? []).length > 0} fallback={<EmptyState icon="people" message="No customers found" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Name</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Balance</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={customerList() ?? []}>
                  {(c) => {
                    const hasDebt = () => parseFloat(c.remaining_balance) > 0;
                    return (
                      <tr class="hover:bg-gray-50/60 transition-colors">
                        <td class="px-5 py-3">
                          <p class="text-sm font-bold text-gray-900">{c.name}</p>
                          <p class="text-xs text-gray-400">{c.email || "—"}</p>
                        </td>
                        <td class="px-5 py-3 text-sm text-gray-700">{c.phone || "—"}</td>
                        <td class="px-5 py-3 text-right">
                          <span class={`text-sm font-black ${hasDebt() ? "text-orange-600" : "text-gray-900"}`}>
                            {formatTZS(c.remaining_balance)}
                          </span>
                        </td>
                        <td class="px-5 py-3 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <A href={`/customers/${c.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              View
                            </A>
                            <Show when={hasDebt()}>
                              <button onClick={() => { setPayAmount(""); setShowPay(c.id); }} class="text-xs font-bold text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                                Pay
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

      {/* Add Customer Modal */}
      <Modal title="Add Customer" open={showAdd()} onClose={() => setShowAdd(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Name *</label>
            <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={name()} onInput={e => setName(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
            <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={phone()} onInput={e => setPhone(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
            <input type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={email()} onInput={e => setEmail(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={addCustomer} disabled={saving() || !name()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Add Customer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pay Balance Modal */}
      <Modal title="Record Payment" open={showPay() !== null} onClose={() => setShowPay(null)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Amount Received (TZS)</label>
            <input type="number" min="1" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={payAmount()} onInput={e => setPayAmount(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowPay(null)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={pay} disabled={saving() || !payAmount()} class="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Record Payment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
