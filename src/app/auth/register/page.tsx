// src/app/auth/register/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tedarikçi Başvurusu",
  description:
    "Cateringle.com'a catering firmanızı kaydettirin ve binlerce müşteriye ulaşın.",
};

export default async function VendorRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  async function handleRegister(formData: FormData) {
    "use server";

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // city_id'yi number'a çevir
    const cityIdStr = formData.get("city_id") as string;
    const cityId = cityIdStr ? parseInt(cityIdStr, 10) : null;

    // Auth kontrolü
    if (!user) {
      // Önce kullanıcı kaydı yap
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const fullName = formData.get("full_name") as string;

      if (!email || !password) {
        redirect(
          "/auth/register?error=" +
            encodeURIComponent("E-posta ve şifre zorunludur.")
        );
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authError) {
        redirect(
          "/auth/register?error=" + encodeURIComponent(authError.message)
        );
      }

      if (authData.user) {
        // Profil oluştur
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: "vendor_owner",
        });

        // Vendor kaydı
        const { error: vendorError } = await supabase.from("vendors").insert({
          owner_id: authData.user.id,
          business_name: formData.get("business_name") as string,
          slug:
            (formData.get("business_name") as string)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") +
            "-" +
            Date.now(),
          description: (formData.get("description") as string) || null,
          phone: (formData.get("phone") as string) || null,
          city_id: cityId,
          status: "pending",
        });

        if (vendorError) {
          redirect(
            "/auth/register?error=" + encodeURIComponent(vendorError.message)
          );
        }

        redirect("/auth/register?success=1");
      }
    } else {
      // Mevcut kullanıcı için vendor kaydı
      const { error: vendorError } = await supabase.from("vendors").insert({
        owner_id: user.id,
        business_name: formData.get("business_name") as string,
        slug:
          (formData.get("business_name") as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
          "-" +
          Date.now(),
        description: (formData.get("description") as string) || null,
        phone: (formData.get("phone") as string) || null,
        city_id: cityId,
        status: "pending",
      });

      if (vendorError) {
        redirect(
          "/auth/register?error=" + encodeURIComponent(vendorError.message)
        );
      }

      // Rolü güncelle
      await supabase
        .from("profiles")
        .update({ role: "vendor_owner" })
        .eq("id", user.id);

      redirect("/auth/register?success=1");
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            Ücretsiz Başvuru
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Firmanızı müşterilerinizle buluşturun
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Cateringle ile yeni müşterilere ulaşın ve işinizi büyütün
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Sol - Avantajlar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white">
                <h2 className="text-lg font-semibold">Neden Cateringle?</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    { text: "Yeni müşterilere kolayca ulaşın" },
                    { text: "Online teklif talepleri alın" },
                    { text: "Müşteri yorumlarıyla güven oluşturun" },
                    { text: "Menü ve fotoğraflarınızı sergileyin" },
                    { text: "Detaylı istatistiklerle takip edin" },
                    { text: "Katılmak tamamen ücretsiz" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 shrink-0 text-emerald-200"
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
                      <span className="text-emerald-50">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Nasıl çalışır?</h3>
                <ol className="mt-4 space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Başvurunuzu gönderin",
                      desc: "Firma bilgilerinizi girin",
                    },
                    {
                      step: "2",
                      title: "Onayınızı bekleyin",
                      desc: "Ekibimiz başvurunuzu inceler",
                    },
                    {
                      step: "3",
                      title: "Profilinizi zenginleştirin",
                      desc: "Menü, fotoğraf ve detayları ekleyin",
                    },
                    {
                      step: "4",
                      title: "Teklif almaya başlayın",
                      desc: "Müşterilerden talepler gelmeye başlar",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Sağ - Form / Success */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              {/* Success */}
              {params.success ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-10 w-10 text-green-600"
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
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-slate-900">
                    Başvurunuz alındı!
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Başvurunuzu inceleyip en kısa sürede size dönüş yapacağız.
                    E-posta adresinizi kontrol etmeyi unutmayın.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/"
                      className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Ana Sayfaya Dön
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Firmanızı tanıyalım
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {user
                        ? "Firma bilgilerinizi doldurun"
                        : "Birkaç dakika içinde başvurunuzu tamamlayın"}
                    </p>
                  </div>

                  {/* Error */}
                  {params.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      <svg
                        className="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {params.error}
                    </div>
                  )}

                  <form action={handleRegister} className="space-y-6">
                    {/* Kullanıcı Bilgileri - Sadece giriş yapmamışsa */}
                    {!user && (
                      <div className="space-y-4 rounded-xl bg-slate-50 p-5">
                        <h3 className="font-medium text-slate-900">
                          Sizin bilgileriniz
                        </h3>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Adınız Soyadınız
                          </label>
                          <input
                            name="full_name"
                            type="text"
                            required
                            placeholder="İsminizi girin"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              E-posta
                            </label>
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="ornek@email.com"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Şifre belirleyin
                            </label>
                            <input
                              name="password"
                              type="password"
                              required
                              minLength={6}
                              placeholder="En az 6 karakter"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Firma Bilgileri */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-900">
                        Firma Bilgileri
                      </h3>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Firma adı
                        </label>
                        <input
                          name="business_name"
                          type="text"
                          required
                          placeholder="Firmanızın tam adını girin"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Telefon{" "}
                            <span className="text-slate-400">
                              (isteğe bağlı)
                            </span>
                          </label>
                          <input
                            name="phone"
                            type="tel"
                            placeholder="05XX XXX XX XX"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Hizmet verdiğiniz şehir
                          </label>
                          <select
                            name="city_id"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="">Bir şehir seçin</option>
                            {cities?.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Firmanızı kısaca tanıtın{" "}
                          <span className="text-slate-400">(isteğe bağlı)</span>
                        </label>
                        <textarea
                          name="description"
                          rows={4}
                          placeholder="Hangi tür etkinliklere hizmet veriyorsunuz? Öne çıkan özellikleriniz neler?"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600">
                        <Link
                          href="/kullanim-sartlari"
                          className="text-emerald-600 hover:underline"
                        >
                          Kullanım şartlarını
                        </Link>{" "}
                        ve{" "}
                        <Link
                          href="/gizlilik-politikasi"
                          className="text-emerald-600 hover:underline"
                        >
                          gizlilik politikasını
                        </Link>{" "}
                        kabul ediyorum.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                    >
                      Ücretsiz Başvur
                    </button>

                    <p className="mt-3 text-center text-xs text-slate-400">
                      Başvuru yapmak ve platforma katılmak tamamen ücretsizdir
                    </p>
                  </form>

                  {!user && (
                    <p className="mt-6 text-center text-sm text-slate-500">
                      Zaten hesabınız var mı?{" "}
                      <Link
                        href="/auth/login"
                        className="font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Giriş yapın
                      </Link>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
