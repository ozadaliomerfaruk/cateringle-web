// src/app/panel/vendor-applications/page.tsx
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

// Tip tanımı
type VendorApplication =
  Database["public"]["Tables"]["vendor_applications"]["Row"];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getAdminSupabaseClient() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { adminId: user.id };
}

export async function updateVendorApplicationStatus(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as string | null;

  if (!id || !status) return;

  const { adminId } = await getAdminSupabaseClient();

  await supabaseAdmin
    .from("vendor_applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", id);

  revalidatePath("/panel/vendor-applications");
}

export async function approveAndCreateVendor(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  if (!id) return;

  const { adminId } = await getAdminSupabaseClient();

  // Başvuruyu çek
  const { data: app, error: appError } = await supabaseAdmin
    .from("vendor_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (appError || !app) {
    console.error("Başvuru bulunamadı:", appError);
    return;
  }

  // Zaten onaylanmış mı kontrol et
  if (app.created_vendor_id) {
    console.warn("Bu başvuru için zaten vendor oluşturulmuş.");
    return;
  }

  // applicant_user_id yoksa eski sistemden gelen başvuru, yeni user oluştur
  let userId = app.applicant_user_id;

  if (!userId) {
    // Eski sistemden gelen başvuru - yeni kullanıcı oluştur
    const randomPassword = Math.random().toString(36).slice(-12);
    const { data: userResult, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: app.contact_email,
        email_confirm: true,
        password: randomPassword,
        user_metadata: { full_name: app.contact_name },
      });

    if (userError || !userResult?.user) {
      console.error("Kullanıcı oluşturulamadı:", userError);
      return;
    }
    userId = userResult.user.id;
  }

  // Profile'ı vendor_owner yap
  await supabaseAdmin
    .from("profiles")
    .update({
      full_name: app.contact_name,
      role: "vendor_owner",
    })
    .eq("id", userId);

  // Slug oluştur
  const baseSlug = slugify(app.business_name || "vendor");
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (!existing || existing.length === 0) break;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  // Vendor kaydı oluştur
  const { data: vendorInsert, error: vendorError } = await supabaseAdmin
    .from("vendors")
    .insert({
      business_name: app.business_name,
      slug,
      owner_id: userId,
      status: "approved",
    })
    .select("id")
    .single();

  if (vendorError || !vendorInsert) {
    console.error("Vendor oluşturulamadı:", vendorError);
    return;
  }

  // Başvuruyu güncelle
  await supabaseAdmin
    .from("vendor_applications")
    .update({
      status: "approved",
      created_vendor_id: vendorInsert.id,
      created_user_id: userId,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", id);

  revalidatePath("/panel/vendor-applications");
}

export default async function VendorApplicationsPage() {
  await getAdminSupabaseClient(); // Sadece yetki kontrolü için

  const { data, error } = await supabaseAdmin
    .from("vendor_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const applications = (data ?? []) as VendorApplication[];

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Tedarikçi Başvuruları</h1>
        <p className="text-xs text-slate-600">
          Gelen başvuruları incele ve onayla.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Hata: {error.message}
        </div>
      )}

      {applications.length === 0 && (
        <div className="rounded-md border bg-white px-3 py-4 text-sm text-slate-600">
          Henüz başvuru yok.
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <article
            key={app.id}
            className="rounded-lg border bg-white p-4 text-xs shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">{app.business_name}</h2>
                <p className="text-[11px] text-slate-500">
                  {app.contact_name} • {app.contact_email}
                </p>
                <p className="text-[11px] text-slate-500">
                  {app.city_text || "-"} / {app.district_text || "-"}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    app.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : app.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {app.status}
                </span>
                <p className="mt-1 text-[11px] text-slate-400">
                  {new Date(app.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>

            <div className="mb-3 grid gap-2 text-[11px] md:grid-cols-2">
              <div>
                <span className="font-medium">Telefon:</span>{" "}
                {app.contact_phone || "-"}
              </div>
              <div>
                <span className="font-medium">Kapasite:</span>{" "}
                {app.min_guest_count || "?"} - {app.max_guest_count || "?"} kişi
              </div>
              <div>
                <span className="font-medium">Hizmetler:</span>{" "}
                {app.main_service_categories || "-"}
              </div>
              <div>
                <span className="font-medium">Hesap:</span>{" "}
                {app.applicant_user_id ? (
                  <span className="inline-flex items-center gap-1">
                    Var
                    <svg
                      className="h-3.5 w-3.5 text-emerald-500"
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
                  </span>
                ) : (
                  "Yok (eski sistem)"
                )}
              </div>
            </div>

            {app.notes && (
              <div className="mb-3 rounded bg-slate-50 p-2 text-[11px]">
                <span className="font-medium">Not:</span> {app.notes}
              </div>
            )}

            {/* Durum Güncelleme */}
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              {!app.created_vendor_id && (
                <>
                  <form
                    action={updateVendorApplicationStatus}
                    className="flex gap-2"
                  >
                    <input type="hidden" name="id" value={app.id} />
                    <select
                      name="status"
                      defaultValue={app.status}
                      className="rounded border px-2 py-1 text-[11px]"
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded bg-slate-600 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
                    >
                      Durumu Kaydet
                    </button>
                  </form>

                  {app.status === "approved" && (
                    <form action={approveAndCreateVendor}>
                      <input type="hidden" name="id" value={app.id} />
                      <button
                        type="submit"
                        className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                      >
                        Tedarikçi Hesabı Oluştur
                      </button>
                    </form>
                  )}
                </>
              )}

              {app.created_vendor_id && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <svg
                    className="h-3.5 w-3.5"
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
                  Tedarikçi oluşturuldu
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
