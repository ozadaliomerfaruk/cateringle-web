// src/app/auth/signup/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import GoogleSignInButton from "../../../components/GoogleAuthButton";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description:
    "Cateringle.com'a üye olun ve catering firmalarından teklif almaya başlayın.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  async function handleSignup(formData: FormData) {
    "use server";

    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (password !== passwordConfirm) {
      redirect(
        "/auth/signup?error=" + encodeURIComponent("Şifreler eşleşmiyor.")
      );
    }

    if (password.length < 6) {
      redirect(
        "/auth/signup?error=" +
          encodeURIComponent("Şifre en az 6 karakter olmalıdır.")
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      redirect("/auth/signup?error=" + encodeURIComponent(error.message));
    }

    if (data.user) {
      // Profil oluştur
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "customer", // Geriye uyumluluk için
      });

      // RBAC: Customer rolü ekle
      const { data: customerRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "customer")
        .single();

      if (customerRole) {
        await supabase.from("user_roles").upsert({
          user_id: data.user.id,
          role_id: customerRole.id,
        });
      }
    }

    redirect("/auth/signup?success=1");
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-leaf--600 to-teal-600 px-8 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              Ücretsiz hesap oluşturun
            </h1>
            <p className="mt-1 text-leaf-100">Birkaç adımda başlayın</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Success Message */}
            {params.success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 px-4 py-4 text-sm text-green-700">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Hesabınız oluşturuldu!</p>
                  <p className="mt-1 text-green-600">
                    E-posta adresinize bir doğrulama linki gönderdik. Lütfen
                    gelen kutunuzu kontrol edin.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {!params.success && (
              <>
                {/* Google Signup */}
                <GoogleSignInButton redirectTo="/" mode={"signup"} />

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm text-slate-400">
                    veya e-posta ile
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Email Form */}
                <form action={handleSignup} className="space-y-4">
                  <div>
                    <label
                      htmlFor="full_name"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg
                          className="h-5 w-5 text-slate-400"
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
                      </div>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        placeholder="Adınız Soyadınız"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      E-posta
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg
                          className="h-5 w-5 text-slate-400"
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
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="ornek@mail.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Şifre
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="En az 6 karakter"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password_confirm"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Şifre Tekrar
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <input
                        id="password_confirm"
                        name="password_confirm"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Şifrenizi tekrar girin"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf--500"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600">
                      <Link
                        href="/kullanim-sartlari"
                        className="text-leaf-600 hover:underline"
                      >
                        Kullanım şartlarını
                      </Link>{" "}
                      ve{" "}
                      <Link
                        href="/gizlilik-politikasi"
                        className="text-leaf-600 hover:underline"
                      >
                        gizlilik politikasını
                      </Link>{" "}
                      okudum, kabul ediyorum.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-leaf-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-leaf-700 hover:shadow-md"
                  >
                    Kayıt Ol
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-slate-50 px-8 py-5 text-center">
            <p className="text-sm text-slate-600">
              Zaten hesabınız var mı?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-leaf-600 hover:text-leaf-700"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
