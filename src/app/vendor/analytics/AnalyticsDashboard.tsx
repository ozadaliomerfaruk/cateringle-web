"use client";

// src/app/vendor/analytics/AnalyticsDashboard.tsx
import {
  TrendUp,
  TrendDown,
  Users,
  FileText,
  ChatCircle,
  Clock,
  CheckCircle,
  XCircle,
  HourglassSimple,
  ChartLine,
  ChartPie,
  ChartBar,
} from "@phosphor-icons/react";
import type { VendorAnalytics } from "@/lib/types/analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface AnalyticsDashboardProps {
  analytics: VendorAnalytics;
}

// Colors
const COLORS = {
  primary: "#16a34a",
  secondary: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#94a3b8",
};

const PIE_COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsDashboard({
  analytics,
}: AnalyticsDashboardProps) {
  const { summary, monthly_comparison } = analytics;

  // Calculate percentage changes
  const leadChange =
    monthly_comparison.last_month_leads > 0
      ? Math.round(
          ((monthly_comparison.current_month_leads -
            monthly_comparison.last_month_leads) /
            monthly_comparison.last_month_leads) *
            100
        )
      : monthly_comparison.current_month_leads > 0
        ? 100
        : 0;

  const quoteChange =
    monthly_comparison.last_month_quotes > 0
      ? Math.round(
          ((monthly_comparison.current_month_quotes -
            monthly_comparison.last_month_quotes) /
            monthly_comparison.last_month_quotes) *
            100
        )
      : monthly_comparison.current_month_quotes > 0
        ? 100
        : 0;

  // Format date for charts
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Prepare chart data
  const leadsChartData = analytics.leads_by_day.map((d) => ({
    date: formatDate(d.date),
    leads: d.count,
  }));

  const quotesChartData = analytics.quotes_by_day.map((d) => ({
    date: formatDate(d.date),
    teklifler: d.count,
    kabul: d.accepted,
  }));

  // Status labels
  const statusLabels: Record<string, string> = {
    pending: "Beklemede",
    accepted: "Kabul Edildi",
    rejected: "Reddedildi",
    expired: "Süresi Doldu",
  };

  const quoteStatusData = analytics.quotes_by_status.map((d) => ({
    name: statusLabels[d.status] || d.status,
    value: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users size={20} className="text-blue-600" />
            </div>
            {leadChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${leadChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {leadChange > 0 ? (
                  <TrendUp size={16} />
                ) : (
                  <TrendDown size={16} />
                )}
                {Math.abs(leadChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {summary.total_leads}
            </p>
            <p className="text-sm text-slate-500">Toplam Talep</p>
          </div>
        </div>

        {/* Total Quotes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50">
              <FileText size={20} className="text-leaf-600" />
            </div>
            {quoteChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${quoteChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {quoteChange > 0 ? (
                  <TrendUp size={16} />
                ) : (
                  <TrendDown size={16} />
                )}
                {Math.abs(quoteChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {summary.total_quotes}
            </p>
            <p className="text-sm text-slate-500">Gönderilen Teklif</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              %{summary.conversion_rate}
            </p>
            <p className="text-sm text-slate-500">Dönüşüm Oranı</p>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {summary.avg_response_time_hours
                ? `${summary.avg_response_time_hours} saat`
                : "-"}
            </p>
            <p className="text-sm text-slate-500">Ort. Yanıt Süresi</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={24} weight="fill" className="text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {summary.accepted_quotes}
            </p>
            <p className="text-sm text-slate-500">Kabul Edilen</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <HourglassSimple
              size={24}
              weight="fill"
              className="text-amber-600"
            />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {summary.pending_quotes}
            </p>
            <p className="text-sm text-slate-500">Beklemede</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle size={24} weight="fill" className="text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {summary.rejected_quotes}
            </p>
            <p className="text-sm text-slate-500">Reddedilen</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartLine size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">
              Günlük Teklif Talepleri
            </h3>
          </div>
          <div className="h-64">
            {leadsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Talep"
                    stroke={COLORS.secondary}
                    fill={COLORS.secondary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Henüz veri yok
              </div>
            )}
          </div>
        </div>

        {/* Quotes Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartBar size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Günlük Teklifler</h3>
          </div>
          <div className="h-64">
            {quotesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quotesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="teklifler"
                    name="Teklif"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="kabul"
                    name="Kabul"
                    fill={COLORS.success}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Henüz veri yok
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote Status Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartPie size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Teklif Durumları</h3>
          </div>
          <div className="h-48">
            {quoteStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quoteStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {quoteStatusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Henüz teklif yok
              </div>
            )}
          </div>
        </div>

        {/* Event Types */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Etkinlik Türleri</h3>
          <div className="space-y-3">
            {analytics.leads_by_event_type.length > 0 ? (
              analytics.leads_by_event_type.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-leaf-500"
                        style={{
                          width: `${(item.count / analytics.leads_by_event_type[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Guest Count Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-900">
            Misafir Sayısı Dağılımı
          </h3>
          <div className="space-y-3">
            {analytics.guest_count_distribution.length > 0 ? (
              analytics.guest_count_distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {item.range} kişi
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${(item.count / Math.max(...analytics.guest_count_distribution.map((d) => d.count))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Henüz veri yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Stats */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Mesaj İstatistikleri</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ChatCircle size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {summary.total_messages}
              </p>
              <p className="text-sm text-slate-500">Toplam Mesaj</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <ChatCircle size={24} weight="fill" className="text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {summary.unread_messages}
              </p>
              <p className="text-sm text-slate-500">Okunmamış Mesaj</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
