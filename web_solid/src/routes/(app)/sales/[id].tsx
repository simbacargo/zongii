import { createResource, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { sales } from "../../../lib/api";
import { formatTZS, formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { SaleBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../../contexts/auth";

export default function SaleDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const isAdmin = () => state.user?.is_admin || state.user?.is_superuser;

  const [sale, { refetch }] = createResource(() => sales.get(Number(params.id)));

  async function approve() {
    try { await sales.approve(Number(params.id)); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  async function reject() {
    try { await sales.reject(Number(params.id)); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  return (
    <div class="max-w-2xl">
      <button onClick={() => navigate("/sales")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Sales
      </button>

      <Show when={!sale.loading} fallback={<PageLoader />}>
        <Show when={sale()}>
          {(s) => (
            <div class="space-y-5">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{s().product_name}</h1>
                  <p class="text-sm text-gray-500 mt-0.5">{s().product_brand}</p>
                </div>
                <div class="flex items-center gap-3">
                  <SaleBadge aproved={s().aproved} rejected={s().rejected} />
                  <Show when={isAdmin() && !s().aproved && !s().rejected}>
                    <button onClick={approve} class="text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
                      Approve
                    </button>
                    <button onClick={reject} class="text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors">
                      Reject
                    </button>
                  </Show>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Date" value={formatDate(s().date_sold, true)} />
                  <Row label="Customer" value={s().customer_name ?? "Walk-in"} />
                  <Row label="Quantity" value={String(s().quantity_sold)} />
                  <Row label="Price / Unit" value={formatTZS(s().price_per_unit)} />
                  <div class="col-span-2 border-t border-gray-50 pt-4">
                    <Row label="Total Amount" value={formatTZS(s().total_amount)} bold />
                  </div>
                  <Row label="Recorded By" value={s().created_by_username} />
                  {s().sale_code && <Row label="Sale Code" value={s().sale_code!} />}
                  {s().order && <Row label="Order" value={`#${s().order}`} />}
                </dl>
              </div>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}

function Row(props: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <dt class="text-xs font-bold text-gray-400 mb-0.5">{props.label}</dt>
      <dd class={`text-sm ${props.bold ? "font-black text-indigo-600 text-lg" : "text-gray-800"}`}>{props.value}</dd>
    </div>
  );
}
