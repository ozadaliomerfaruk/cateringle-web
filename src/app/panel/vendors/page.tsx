import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

// Tip tanımları
type VendorStatus = Database["public"]["Enums"]["vendor_status"];

type Vendor = {
  id: string;
  business_name: string;
  slug: string;
  status: VendorStatus;
  phone: string | null;
  email: string | null;
  city_id: number | null;
  min_guest_count: number | null;
  max_guest_count: number | null;
  avg_price_per_person: number | null;
  created_at: string;
  owner_id: string | null;
};

const validStatuses: VendorStatus[] = ["approved"];

function isValidStatus(status: string): status is VendorStatus {
  return validStatuses.includes(status as VendorStatus);
}

async function updateVendorStatus(formData: FormData) {
  "use server";

  const vendorId = formData.get("vendor_id") as string;
  const status = formData.get("status") as string;

  if (!vendorId || !status || !isValidStatus(status)) return;

  await supabaseAdmin
    .from("vendors")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", vendorId);

  revalidatePath("/panel/vendors");
}

export default async function AdminVendorsPage() {
  const { data: vendors, error } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      business_name,
      slug,
      status,
      phone,
      email,
      city_id,
      min_guest_count,
      max_guest_count,
      avg_price_per_person,
      created_at,
      owner_id
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const typedVendors = vendors as Vendor[] | null;

  // Şehir isimlerini çek
  const cityIds = [
    ...new Set(typedVendors?.map((v) => v.city_id).filter(Boolean)),
  ] as number[];
  let cityMap: Record<number, string> = {};

  if (cityIds.length > 0) {
    const { data: cities } = await supabaseAdmin
      .from("cities")
      .select("id, name")
      .in("id", cityIds);
    cityMap = Object.fromEntries(cities?.map((c) => [c.id, c.name]) || []);
  }

  const statusOptions = [
    {
      value: "pending" as const,
      label: "Beklemede",
      color: "bg-amber-100 text-amber-700",
    },
    {
      value: "approved" as const,
      label: "Onaylı",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "suspended" as const,
      label: "Askıya Alındı",
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Firma Yönetimi</h1>
          <p className="text-sm text-slate-600">
            {typedVendors?.length || 0} firma listelendi
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Hata: {error.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Firma
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Şehir
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Kapasite
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Fiyat
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Durum
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Kayıt
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {typedVendors?.map((vendor) => {
              const currentStatus = statusOptions.find(
                (s) => s.value === vendor.status
              );
              return (
                <tr key={vendor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`/vendors/${vendor.slug}`}
                        target="_blank"
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {vendor.business_name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {vendor.email || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {vendor.city_id ? cityMap[vendor.city_id] || "-" : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {vendor.min_guest_count && vendor.max_guest_count
                      ? `${vendor.min_guest_count}-${vendor.max_guest_count}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {vendor.avg_price_per_person
                      ? `${Math.round(vendor.avg_price_per_person)} TL`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        currentStatus?.color || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {currentStatus?.label || vendor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(vendor.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={updateVendorStatus}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="vendor_id" value={vendor.id} />
                      <select
                        name="status"
                        defaultValue={vendor.status}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
                      >
                        Kaydet
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!typedVendors || typedVendors.length === 0) && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Henüz firma kaydı yok
          </div>
        )}
      </div>
    </div>
  );
}
