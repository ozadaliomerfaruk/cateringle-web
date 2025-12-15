"use client";

// src/app/panel/analytics/AdminAnalyticsDashboard.tsx
import {
  TrendUp,
  TrendDown,
  Users,
  Storefront,
  FileText,
  ChatCircle,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  Tag,
  ChartLine,
  ChartBar,
  ChartPie,
  Lightning,
} from "@phosphor-icons/react";
import type { AdminAnalytics } from "@/lib/types/admin-analytics";
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

interface AdminAnalyticsDashboardProps {
  analytics: AdminAnalytics;
}

// Colors
const COLORS = {
  primary: "#16a34a",
  secondary: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
};

const PIE_COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminAnalyticsDashboard({
  analytics,
}: AdminAnalyticsDashboardProps) {
  const { summary, monthly_comparison, weekly_activity } = analytics;

  // Calculate percentage changes
  const calcChange = (current: number, last: number) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
  };

  const leadChange = calcChange(
    monthly_comparison.current_month_leads,
    monthly_comparison.last_month_leads
  );
  const vendorChange = calcChange(
    monthly_comparison.current_month_vendors,
    monthly_comparison.last_month_vendors
  );
  const quoteChange = calcChange(
    monthly_comparison.current_month_quotes,
    monthly_comparison.last_month_quotes
  );
  const userChange = calcChange(
    monthly_comparison.current_month_users,
    monthly_comparison.last_month_users
  );

  // Format date for charts
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Prepare chart data
  const leadsChartData = analytics.leads_by_day.map((d) => ({
    date: formatDate(d.date),
    talepler: d.count,
  }));

  const vendorsChartData = analytics.vendors_by_day.map((d) => ({
    date: formatDate(d.date),
    kayıt: d.count,
    onaylı: d.approved,
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
      {/* Weekly Activity Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Lightning size={20} weight="bold" />
          <span className="font-semibold">Son 7 Gün Aktivitesi</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {weekly_activity.new_leads}
            </p>
            <p className="text-xs text-blue-600">Yeni Talep</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {weekly_activity.new_vendors}
            </p>
            <p className="text-xs text-blue-600">Yeni Vendor</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {weekly_activity.new_quotes}
            </p>
            <p className="text-xs text-blue-600">Yeni Teklif</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {weekly_activity.new_messages}
            </p>
            <p className="text-xs text-blue-600">Yeni Mesaj</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {weekly_activity.new_reviews}
            </p>
            <p className="text-xs text-blue-600">Yeni Yorum</p>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={20} className="text-blue-600" />
            </div>
            {leadChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${leadChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {leadChange > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
                {Math.abs(leadChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{summary.total_leads}</p>
            <p className="text-sm text-slate-500">Toplam Talep</p>
          </div>
        </div>

        {/* Total Vendors */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50">
              <Storefront size={20} className="text-leaf-600" />
            </div>
            {vendorChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${vendorChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {vendorChange > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
                {Math.abs(vendorChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {summary.approved_vendors}
              <span className="ml-1 text-sm font-normal text-slate-400">
                / {summary.total_vendors}
              </span>
            </p>
            <p className="text-sm text-slate-500">Aktif Vendor</p>
          </div>
        </div>

        {/* Total Quotes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <CheckCircle size={20} className="text-purple-600" />
            </div>
            {quoteChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${quoteChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {quoteChange > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
                {Math.abs(quoteChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {summary.total_quotes}
              <span className="ml-1 text-sm font-normal text-green-600">
                ({summary.accepted_quotes} kabul)
              </span>
            </p>
            <p className="text-sm text-slate-500">Toplam Teklif</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Users size={20} className="text-amber-600" />
            </div>
            {userChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${userChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {userChange > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
                {Math.abs(userChange)}%
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{summary.total_users}</p>
            <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock size={24} weight="fill" className="text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{summary.pending_vendors}</p>
            <p className="text-sm text-slate-500">Bekleyen Vendor</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Star size={24} weight="fill" className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {summary.total_reviews}
              <span className="ml-1 text-sm font-normal text-amber-600">
                ({summary.pending_reviews} bekl.)
              </span>
            </p>
            <p className="text-sm text-slate-500">Toplam Yorum</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ChatCircle size={24} weight="fill" className="text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{summary.total_messages}</p>
            <p className="text-sm text-slate-500">Toplam Mesaj</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <TrendUp size={24} weight="bold" className="text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              %{summary.platform_conversion_rate}
            </p>
            <p className="text-sm text-slate-500">Dönüşüm Oranı</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartLine size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Günlük Talepler</h3>
          </div>
          <div className="h-64">
            {leadsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="talepler"
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

        {/* Vendors Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartBar size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Günlük Vendor Kayıtları</h3>
          </div>
          <div className="h-64">
            {vendorsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="kayıt" name="Kayıt" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onaylı" name="Onaylı" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
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
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="teklifler" name="Teklif" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kabul" name="Kabul" fill={COLORS.success} radius={[4, 4, 0, 0]} />
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

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote Status Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ChartPie size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Teklif Durumları</h3>
          </div>
          <div className="h-52">
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
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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

        {/* Vendors by City */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Şehirlere Göre Vendorlar</h3>
          </div>
          <div className="space-y-3">
            {analytics.vendors_by_city.length > 0 ? (
              analytics.vendors_by_city.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.city}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-leaf-500"
                        style={{
                          width: `${(item.count / analytics.vendors_by_city[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Vendors by Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Tag size={20} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Kategorilere Göre</h3>
          </div>
          <div className="space-y-3">
            {analytics.vendors_by_category.length > 0 ? (
              analytics.vendors_by_category.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${(item.count / analytics.vendors_by_category[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Henüz veri yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Vendors Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-900">En Çok Talep Alan Vendorlar</h3>
        {analytics.top_vendors_by_leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 text-right font-medium">Talep</th>
                  <th className="pb-3 text-right font-medium">Teklif</th>
                  <th className="pb-3 text-right font-medium">Oran</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {analytics.top_vendors_by_leads.map((vendor, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 text-slate-400">{index + 1}</td>
                    <td className="py-3 font-medium text-slate-900">{vendor.vendor_name}</td>
                    <td className="py-3 text-right text-slate-600">{vendor.lead_count}</td>
                    <td className="py-3 text-right text-slate-600">{vendor.quote_count}</td>
                    <td className="py-3 text-right">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {vendor.lead_count > 0
                          ? `${Math.round((vendor.quote_count / vendor.lead_count) * 100)}%`
                          : "0%"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Henüz veri yok</p>
        )}
      </div>

      {/* Event Types */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Etkinlik Türlerine Göre Talepler</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {analytics.leads_by_event_type.length > 0 ? (
            analytics.leads_by_event_type.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center"
              >
                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                <p className="mt-1 text-sm text-slate-500">{item.type}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Henüz veri yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
