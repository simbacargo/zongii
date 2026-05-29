import { createResource, createSignal, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { customers } from "../../../lib/api";
import { formatTZS, formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { Modal } from "../../../components/ui/Modal";

export default function CustomerDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [customer, { refetch }] = createResource(() => customers.get(Number(params.id)));

  const [showPay, setShowPay] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");
  const [payAmount, setPayAmount] = createSignal("");

  const [editName, setEditName] = createSignal("");
  const [editPhone, setEditPhone] = createSignal("");
  const [editEmail, setEditEmail] = createSignal("");

  function openEdit() {
    const c = customer();
    if (!c) return;
    setEditName(c.name);
    setEditPhone(c.phone || "");
    setEditEmail(c.email || "");
    setShowEdit(true);
  }

  async function saveEdit() {
    setSaving(true); setErr("");
    try {
      await customers.update(Number(params.id), { name: editName(), phone: editPhone(), email: editEmail() });
      setShowEdit(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function pay() {
    setSaving(true); setErr("");
    try {
      await customers.pay(Number(params.id), Number(payAmount()));
      setShowPay(false);
      setPayAmount("");
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div class="max-w-2xl">
      <button onClick={() => navigate("/customers")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Customers
      </button>

      <Show when={!customer.loading} fallback={<PageLoader />}>
        <Show when={customer()}>
          {(c) => (
            <div class="space-y-5">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{c().name}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">{c().phone || "—"} · {c().email || "—"}</p>
                </div>
                <div class="flex items-center gap-3">
                  <button onClick={openEdit} class="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                    Edit
                  </button>
                  <Show when={parseFloat(c().remaining_balance) > 0}>
                    <button onClick={() => { setPayAmount(""); setShowPay(true); }} class="text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
                      Record Payment
                    </button>
                  </Show>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Customer Info</h3>
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Name" value={c().name} />
                  <Row label="Phone" value={c().phone || "—"} />
                  <Row label="Email" value={c().email || "—"} />
                  {c().debt_due_date && <Row label="Debt Due" value={formatDate(c().debt_due_date!)} />}
                </dl>
              </div>

              <div class={`rounded-2xl border shadow-sm p-5 ${parseFloat(c().remaining_balance) > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
                <p class="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Outstanding Balance</p>
                <p class={`text-3xl font-black ${parseFloat(c().remaining_balance) > 0 ? "text-orange-700" : "text-gray-900"}`}>
                  {formatTZS(c().remaining_balance)}
                </p>
              </div>
            </div>
          )}
        </Show>
      </Show>

      <Modal title="Record Payment" open={showPay()} onClose={() => setShowPay(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Amount (TZS)</label>
            <input type="number" min="1" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={payAmount()} onInput={e => setPayAmount(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowPay(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={pay} disabled={saving() || !payAmount()} class="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal title="Edit Customer" open={showEdit()} onClose={() => setShowEdit(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Name</label>
            <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editName()} onInput={e => setEditName(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
            <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editPhone()} onInput={e => setEditPhone(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
            <input type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editEmail()} onInput={e => setEditEmail(e.currentTarget.value)} />
          </div>
          <div class="flex justify-end gap-3">
            <button onClick={() => setShowEdit(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={saveEdit} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Save"}
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
