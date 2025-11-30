import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "Cateringle.com çerez kullanımı hakkında bilgiler.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-slate-800 to-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-3xl">
            🍪
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Çerez Politikası
          </h1>
          <p className="mt-4 text-slate-300">
            Son güncelleme:{" "}
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Content */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600">
              Cateringle.com olarak, web sitemizde çerezler kullanmaktayız. Bu
              politika, hangi çerezleri kullandığımızı ve bunları nasıl
              yönetebileceğinizi açıklamaktadır.
            </p>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                  ❓
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Çerez Nedir?
                </h2>
              </div>
              <div className="mt-4 rounded-xl bg-blue-50 p-5">
                <p className="text-blue-800">
                  Çerezler, web sitelerinin cihazınıza yerleştirdiği küçük metin
                  dosyalarıdır. Bu dosyalar, siteyi tekrar ziyaret ettiğinizde
                  sizi tanımak ve deneyiminizi kişiselleştirmek için kullanılır.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg">
                  📋
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Kullandığımız Çerez Türleri
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    type: "Zorunlu Çerezler",
                    icon: "🔒",
                    color: "leaf-",
                    desc: "Web sitesinin düzgün çalışması için gereklidir. Oturum yönetimi, güvenlik ve temel işlevler için kullanılır. Bu çerezler devre dışı bırakılamaz.",
                  },
                  {
                    type: "Performans Çerezleri",
                    icon: "📊",
                    color: "blue",
                    desc: "Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Google Analytics gibi araçlarla anonim istatistikler toplarız.",
                  },
                  {
                    type: "İşlevsellik Çerezleri",
                    icon: "⚙️",
                    color: "purple",
                    desc: "Tercihlerinizi (dil, bölge vb.) hatırlamak için kullanılır. Kişiselleştirilmiş bir deneyim sunar.",
                  },
                  {
                    type: "Hedefleme/Reklam Çerezleri",
                    icon: "🎯",
                    color: "yellow",
                    desc: "İlgi alanlarınıza uygun reklamlar göstermek için kullanılabilir. Şu an için aktif reklam çerezi kullanmamaktayız.",
                  },
                ].map((cookie, i) => (
                  <div
                    key={i}
                    className={`rounded-xl bg-${cookie.color}-50 p-5`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cookie.icon}</span>
                      <h3 className="font-semibold text-slate-900">
                        {cookie.type}
                      </h3>
                    </div>
                    <p className="mt-2 text-slate-600">{cookie.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-lg">
                  🔗
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Üçüncü Taraf Çerezleri
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Platformumuzda aşağıdaki üçüncü taraf hizmetlerin çerezleri
                kullanılabilir:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    Google Analytics
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Site kullanım istatistikleri
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Supabase</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Kimlik doğrulama ve oturum yönetimi
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  🎛️
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Çerezleri Yönetme
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Tarayıcı ayarlarınızdan çerezleri yönetebilir veya
                silebilirsiniz. Ancak bazı çerezleri devre dışı bırakmak, web
                sitesinin bazı özelliklerinin düzgün çalışmamasına neden
                olabilir.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    name: "Google Chrome",
                    url: "https://support.google.com/chrome/answer/95647",
                    color: "from-yellow-400 to-green-500",
                  },
                  {
                    name: "Mozilla Firefox",
                    url: "https://support.mozilla.org/tr/kb/cerezleri-silme-web-sitelerinin-bilgilerini-kaldirma",
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    name: "Safari",
                    url: "https://support.apple.com/tr-tr/guide/safari/sfri11471/mac",
                    color: "from-blue-400 to-blue-600",
                  },
                  {
                    name: "Microsoft Edge",
                    url: "https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-tanımlama-bilgilerini-silme",
                    color: "from-blue-500 to-cyan-500",
                  },
                ].map((browser, i) => (
                  <a
                    key={i}
                    href={browser.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 transition-all hover:bg-slate-100"
                  >
                    <div
                      className={`h-10 w-10 rounded-lg bg-linear-to-br ${browser.color}`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {browser.name}
                      </p>
                      <p className="text-sm text-leaf-600">Çerez ayarları →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-xl bg-leaf-50 p-6">
              <h3 className="font-semibold text-slate-900">İletişim</h3>
              <p className="mt-2 text-slate-600">
                Çerez politikamız hakkında sorularınız için:{" "}
                <strong>info@cateringle.com</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/gizlilik-politikasi",
              label: "Gizlilik Politikası",
              icon: "🔒",
            },
            {
              href: "/kullanim-sartlari",
              label: "Kullanım Şartları",
              icon: "📄",
            },
            { href: "/kvkk", label: "KVKK Aydınlatma Metni", icon: "📋" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-medium text-slate-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
