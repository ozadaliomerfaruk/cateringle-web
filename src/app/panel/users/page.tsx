// src/app/panel/users/page.tsx
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Server Actions
type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
type UserRole = "admin" | "vendor_owner" | "customer";

async function updateVendorStatus(formData: FormData) {
  "use server";

  const vendorId = formData.get("vendor_id") as string;
  const newStatus = formData.get("status") as VendorStatus;

  if (!vendorId || !newStatus) return;

  await supabaseAdmin
    .from("vendors")
    .update({ status: newStatus })
    .eq("id", vendorId);

  revalidatePath("/panel/users");
  revalidatePath("/panel");
}

async function updateUserRole(formData: FormData) {
  "use server";

  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as UserRole;

  if (!userId || !role) return;

  await supabaseAdmin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  revalidatePath("/panel/users");
}

export default async function UsersAndVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab || "pending";

  // Bekleyen firmalar
  const { data: pendingVendors } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      business_name,
      slug,
      description,
      phone,
      email,
      status,
      created_at,
      city:cities(name),
      district:districts(name),
      owner:profiles(id, full_name, email, phone)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Tum firmalar
  const { data: allVendors } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      business_name,
      slug,
      status,
      created_at,
      city:cities(name),
      owner:profiles(full_name, email)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Tum kullanicilar
  const { data: allUsers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, role, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const pending = pendingVendors || [];
  const vendors = allVendors || [];
  const users = allUsers || [];

  const tabs = [
    { id: "pending", label: "Bekleyen Onay", count: pending.length },
    { id: "vendors", label: "Tum Firmalar", count: vendors.length },
    { id: "users", label: "Tum Kullanicilar", count: users.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Kullanicilar ve Firmalar
        </h1>
        <p className="text-sm text-slate-600">
          Firma basvurularini onayla, kullanicilari yonet
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/panel/users?tab=${tab.id}`}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-leaf-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? "bg-leaf-100 text-leaf-700"
                      : tab.id === "pending" && tab.count > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-leaf-600" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bekleyen Onay */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-sm text-slate-600">
                Bekleyen basvuru yok
              </p>
            </div>
          ) : (
            pending.map((vendor) => {
              const city = vendor.city as { name: string } | null;
              const district = vendor.district as { name: string } | null;
              const owner = vendor.owner as {
                id: string;
                full_name: string | null;
                email: string | null;
                phone: string | null;
              } | null;

              return (
                <div
                  key={vendor.id}
                  className="rounded-lg border border-amber-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-lg font-bold text-amber-700">
                          {vendor.business_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {vendor.business_name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {[district?.name, city?.name]
                              .filter(Boolean)
                              .join(", ") || "Konum belirtilmemis"}
                          </p>
                        </div>
                      </div>

                      {vendor.description && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                          {vendor.description}
                        </p>
                      )}

                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>{owner?.full_name || "Isim yok"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">
                            {owner?.email || vendor.email || "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{owner?.phone || vendor.phone || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {new Date(vendor.created_at).toLocaleDateString(
                              "tr-TR"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex items-center gap-2">
                      <form action={updateVendorStatus}>
                        <input
                          type="hidden"
                          name="vendor_id"
                          value={vendor.id}
                        />
                        <input type="hidden" name="status" value="approved" />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-700"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Onayla
                        </button>
                      </form>
                      <form action={updateVendorStatus}>
                        <input
                          type="hidden"
                          name="vendor_id"
                          value={vendor.id}
                        />
                        <input type="hidden" name="status" value="rejected" />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reddet
                        </button>
                      </form>
                      <Link
                        href={`/vendors/${vendor.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Gor
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tum Firmalar */}
      {activeTab === "vendors" && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Firma
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Sahip
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Sehir
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Durum
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Islem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor) => {
                const city = vendor.city as { name: string } | null;
                const owner = vendor.owner as {
                  full_name: string | null;
                  email: string | null;
                } | null;

                return (
                  <tr key={vendor.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/vendors/${vendor.slug}`}
                        target="_blank"
                        className="font-medium text-slate-900 hover:text-leaf-600"
                      >
                        {vendor.business_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {owner?.full_name || owner?.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {city?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          vendor.status === "approved"
                            ? "bg-leaf-100 text-leaf-700"
                            : vendor.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : vendor.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {vendor.status === "approved" && "Onayli"}
                        {vendor.status === "pending" && "Beklemede"}
                        {vendor.status === "rejected" && "Reddedildi"}
                        {vendor.status === "suspended" && "Askida"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(vendor.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateVendorStatus} className="flex gap-1">
                        <input
                          type="hidden"
                          name="vendor_id"
                          value={vendor.id}
                        />
                        <select
                          name="status"
                          defaultValue={vendor.status || "pending"}
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="pending">Beklemede</option>
                          <option value="approved">Onayli</option>
                          <option value="rejected">Reddedildi</option>
                          <option value="suspended">Askida</option>
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
          {vendors.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Henuz firma yok
            </div>
          )}
        </div>
      )}

      {/* Tum Kullanicilar */}
      {activeTab === "users" && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Kullanici
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Rol
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Kayit
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Islem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {user.full_name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {user.phone || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "vendor_owner"
                          ? "bg-leaf-100 text-leaf-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "admin" && "Admin"}
                      {user.role === "vendor_owner" && "Tedarikci"}
                      {user.role === "customer" && "Musteri"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateUserRole} className="flex gap-1">
                      <input type="hidden" name="user_id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="customer">Musteri</option>
                        <option value="vendor_owner">Tedarikci</option>
                        <option value="admin">Admin</option>
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
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Henuz kullanici yok
            </div>
          )}
        </div>
      )}
    </div>
  );
}
