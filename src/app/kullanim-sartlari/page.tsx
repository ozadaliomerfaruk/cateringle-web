import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Cateringle.com kullanım şartları ve koşulları.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-slate-800 to-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Kullanım Şartları
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
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-blue-800">
                Bu kullanım şartları, Cateringle.com platformunu kullanımınızı
                düzenlemektedir. Platformu kullanarak bu şartları kabul etmiş
                sayılırsınız.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  1
                </span>
                <h2 className="text-xl font-bold text-slate-900">Tanımlar</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    term: "Platform",
                    desc: "Cateringle.com web sitesi ve tüm alt sayfaları",
                  },
                  { term: "Kullanıcı", desc: "Platformu kullanan müşteriler" },
                  {
                    term: "Tedarikçi",
                    desc: "Platformda hizmet sunan catering firmaları",
                  },
                  {
                    term: "Hizmet",
                    desc: "Platform üzerinden sunulan tüm özellikler",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.term}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  2
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Hizmet Kapsamı
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Cateringle.com, müşteriler ile catering firmaları arasında
                bağlantı kuran bir platformdur. Platform olarak:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Catering firmalarının listelenmesi ve tanıtımı",
                  "Teklif taleplerinin iletilmesi",
                  "Firma ve hizmet karşılaştırması",
                  "Müşteri yorumları ve değerlendirmeleri",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <svg
                      className="mt-1 h-5 w-5 shrink-0 text-leaf-500"
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
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-slate-600">hizmetlerini sunmaktayız.</p>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  3
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Kullanıcı Yükümlülükleri
                </h2>
              </div>
              <p className="mt-4 text-slate-600">Platform kullanıcıları:</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Doğru ve güncel bilgi sağlamakla yükümlüdür",
                  "Hesap bilgilerinin güvenliğinden sorumludur",
                  "Platformu yasalara uygun şekilde kullanmalıdır",
                  "Diğer kullanıcılara saygılı davranmalıdır",
                  "Spam, zararlı içerik veya yanıltıcı bilgi paylaşmamalıdır",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <svg
                      className="mt-1 h-5 w-5 shrink-0 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  4
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Tedarikçi Yükümlülükleri
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Platformda kayıtlı catering firmaları:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Güncel ve doğru firma bilgileri sağlamalıdır",
                  "Gelen teklif taleplerine makul sürede yanıt vermelidir",
                  "Sunulan hizmetlerin kalitesinden sorumludur",
                  "Tüm yasal izin ve belgelere sahip olmalıdır",
                  "Müşteri bilgilerini gizli tutmalıdır",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <svg
                      className="mt-1 h-5 w-5 shrink-0 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  5
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Sorumluluk Reddi
                </h2>
              </div>
              <div className="mt-4 rounded-xl bg-yellow-50 p-5">
                <p className="font-medium text-yellow-800">Cateringle.com:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Tedarikçiler tarafından sunulan hizmetlerin kalitesini garanti etmez",
                    "Kullanıcılar ve tedarikçiler arasındaki anlaşmazlıklarda taraf değildir",
                    "Platform üzerinden yapılan ödemelerin güvenliğini sağlar ancak hizmet teslimatından sorumlu değildir",
                    "Tedarikçi bilgilerinin doğruluğunu garanti etmez",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-yellow-700"
                    >
                      <span>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  6
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Fikri Mülkiyet
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Platform üzerindeki tüm içerik, tasarım, logo ve yazılım
                Cateringle.com&apos;a aittir. İzinsiz kopyalama, dağıtma veya
                değiştirme yasaktır.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  7
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Uygulanacak Hukuk
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir.
                Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.
              </p>
            </div>

            <div className="mt-10 rounded-xl bg-leaf-50 p-6">
              <h3 className="font-semibold text-slate-900">İletişim</h3>
              <p className="mt-2 text-slate-600">
                Kullanım şartları hakkında sorularınız için:{" "}
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
            { href: "/kvkk", label: "KVKK Aydınlatma Metni", icon: "📋" },
            {
              href: "/cerez-politikasi",
              label: "Çerez Politikası",
              icon: "🍪",
            },
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
