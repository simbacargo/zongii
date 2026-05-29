import { createResource, createSignal, For, Show, onMount, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { dashboard } from "../../lib/api";
import { formatTZS, formatDate } from "../../lib/utils";
import { PageLoader } from "../../components/ui/Spinner";
import { Badge, SaleBadge } from "../../components/ui/Badge";
import type { DashboardData } from "../../types";

export default function DashboardPage() {
  const [period, setPeriod] = createSignal<"week" | "month">("week");
  const [data, { refetch }] = createResource(period, (p) => dashboard.get(p));
  const navigate = useNavigate();

  const statCards = () => {
    const d = data();
    if (!d) return [];
    return [
      { label: "Revenue",     value: formatTZS(d.revenue),          icon: "cash-stack",           color: "bg-indigo-50 text-indigo-600" },
      { label: "Profit",      value: formatTZS(d.profit),           icon: "graph-up-arrow",       color: "bg-green-50 text-green-600" },
      { label: "Sales",       value: String(d.total_sales_count),   icon: "cart-check",           color: "bg-blue-50 text-blue-600" },
      { label: "Pending",     value: String(d.pending_count),       icon: "hourglass-split",      color: "bg-amber-50 text-amber-600" },
      { label: "Customers",   value: String(d.total_customers),     icon: "people-fill",          color: "bg-purple-50 text-purple-600" },
      { label: "Receivables", value: formatTZS(d.total_debt),       icon: "exclamation-triangle", color: "bg-red-50 text-red-600" },
      { label: "Low Stock",   value: String(d.low_stock_count),     icon: "archive",              color: "bg-orange-50 text-orange-600" },
    ];
  };

  return (
    <div>
      {/* Header */}
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-500 mt-0.5">Business overview & operations</p>
        </div>
        <div class="inline-flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setPeriod("week")}
            class={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${period() === "week" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            class={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${period() === "month" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            This Month
          </button>
        </div>
      </div>

      <Show when={!data.loading} fallback={<PageLoader />}>
        <Show when={data()} fallback={
          <div class="text-center py-12 text-red-500">Failed to load dashboard data.</div>
        }>
          {(d) => (
            <>
              {/* KPI Grid */}
              <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                <For each={statCards()}>
                  {(card) => (
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div class="flex items-center gap-2 mb-2">
                        <div class={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                          <i class={`bi bi-${card.icon} text-sm`} />
                        </div>
                      </div>
                      <p class="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                      <p class="text-lg font-black text-gray-900 leading-tight">{card.value}</p>
                    </div>
                  )}
                </For>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Top Products</h3>
                  <Show when={d().top_products?.length > 0} fallback={
                    <p class="text-sm text-gray-400 text-center py-8">No sales data yet</p>
                  }>
                    <div class="space-y-3">
                      <For each={d().top_products}>
                        {(p, i) => (
                          <div class="flex items-center gap-3">
                            <span class="w-5 text-xs font-black text-gray-300 text-right shrink-0">{i() + 1}</span>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                              <p class="text-xs text-gray-400">{p.total_sold} units</p>
                            </div>
                            <span class="text-sm font-black text-indigo-600 whitespace-nowrap shrink-0">
                              {formatTZS(p.total_revenue)}
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Revenue Chart placeholder */}
                <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Revenue Trend</h3>
                    <span class="text-xs text-gray-400">{period() === "week" ? "Last 7 days" : "Last 30 days"}</span>
                  </div>
                  <RevenueChart labels={d().chart_labels} data={d().chart_revenue} />
                </div>
              </div>

              {/* Quick links row */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <AlertCard
                  title="Pending Approvals"
                  value={d().pending_count}
                  icon="hourglass-split"
                  color="amber"
                  href="/sales?status=pending"
                  cta="Review now"
                />
                <AlertCard
                  title="Low Stock Items"
                  value={d().low_stock_count}
                  icon="exclamation-triangle"
                  color="red"
                  href="/products?low_stock=true"
                  cta="View products"
                />
                <AlertCard
                  title="Outstanding Debt"
                  value={formatTZS(d().total_debt)}
                  icon="cash-coin"
                  color="orange"
                  href="/customers"
                  cta="View customers"
                  isAmount
                />
              </div>
            </>
          )}
        </Show>
      </Show>
    </div>
  );
}

function AlertCard(props: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  href: string;
  cta: string;
  isAmount?: boolean;
}) {
  const hasAlert = () => props.isAmount
    ? parseFloat(String(props.value).replace(/[^0-9.]/g, "")) > 0
    : Number(props.value) > 0;

  const bgClass = () => {
    if (!hasAlert()) return "bg-white border-gray-100";
    return {
      amber: "bg-amber-50 border-amber-200",
      red: "bg-red-50 border-red-200",
      orange: "bg-orange-50 border-orange-200",
    }[props.color] ?? "bg-white border-gray-100";
  };

  const textClass = () => {
    if (!hasAlert()) return "text-gray-900";
    return {
      amber: "text-amber-700",
      red: "text-red-700",
      orange: "text-orange-700",
    }[props.color] ?? "text-gray-900";
  };

  const navigate = useNavigate();

  return (
    <div class={`${bgClass()} rounded-2xl border shadow-sm p-5`}>
      <div class="flex items-center gap-3 mb-3">
        <div class={`w-9 h-9 rounded-xl flex items-center justify-center ${hasAlert() ? `bg-${props.color}-100 text-${props.color}-600` : "bg-gray-50 text-gray-400"}`}>
          <i class={`bi bi-${props.icon} text-base`} />
        </div>
        <p class="text-xs font-black text-gray-400 uppercase tracking-wide">{props.title}</p>
      </div>
      <p class={`text-2xl font-black ${textClass()}`}>{props.value}</p>
      {hasAlert() && (
        <button
          onClick={() => navigate(props.href)}
          class={`mt-3 text-xs font-bold ${textClass()} underline underline-offset-2`}
        >
          {props.cta} →
        </button>
      )}
    </div>
  );
}

function RevenueChart(props: { labels: string[]; data: number[] }) {
  let canvasRef: HTMLCanvasElement | undefined;

  function renderChart() {
    if (!canvasRef || !props.labels?.length) return;
    import("chart.js/auto").then(({ default: Chart }) => {
      const existing = Chart.getChart(canvasRef!);
      if (existing) existing.destroy();

      const ctx = canvasRef!.getContext("2d")!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 280);
      gradient.addColorStop(0, "rgba(79,70,229,0.15)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      new Chart(canvasRef!, {
        type: "line",
        data: {
          labels: props.labels,
          datasets: [{
            label: "Revenue (TZS)",
            data: props.data,
            borderColor: "#4f46e5",
            borderWidth: 2.5,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#4f46e5",
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => "TZS " + (c.parsed.y ?? 0).toLocaleString(),
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f1f5f9" },
              border: { display: false },
              ticks: { callback: v => "TZS " + (Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + "K" : v) },
            },
            x: { grid: { display: false }, border: { display: false } },
          },
        },
      });
    });
  }

  onMount(renderChart);
  createEffect(renderChart);

  return (
    <div class="h-56">
      <canvas ref={canvasRef} />
    </div>
  );
}
