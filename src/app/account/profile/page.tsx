import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  await supabase
    .from("profiles")
    .update({
      full_name: fullName?.trim() || null,
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/account/profile");
}

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/account");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold">Profil Bilgilerim</h1>
      <p className="mb-6 text-sm text-slate-600">
        Kişisel bilgilerinizi güncelleyin
      </p>

      <form action={updateProfile} className="space-y-6">
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold">Kişisel Bilgiler</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                E-posta
              </label>
              <input
                type="email"
                disabled
                value={user.email || ""}
                className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                E-posta adresi değiştirilemez
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Ad Soyad
              </label>
              <input
                type="text"
                name="full_name"
                defaultValue={profile.full_name || ""}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500"
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone || ""}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500 focus:ring-1 focus:ring-leaf--500"
                placeholder="+90 5XX XXX XX XX"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-leaf-600 px-6 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            Kaydet
          </button>
        </div>
      </form>

      {/* Hesap bilgileri */}
      <div className="mt-6 rounded-lg border bg-slate-50 p-4 text-xs text-slate-600">
        <p>
          <span className="font-medium">Hesap oluşturulma:</span>{" "}
          {new Date(profile.created_at).toLocaleDateString("tr-TR")}
        </p>
      </div>
    </main>
  );
}
