import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Cateringle.com KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

export default function KVKKPage() {
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            KVKK Aydınlatma Metni
          </h1>
          <p className="mt-4 text-slate-300">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Veri Sorumlusu Bilgisi */}
        <div className="mb-8 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h2 className="text-lg font-semibold">Veri Sorumlusu</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-emerald-100">Şirket Adı</p>
              <p className="font-medium">Cateringle Teknoloji A.Ş.</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100">Adres</p>
              <p className="font-medium">İstanbul, Türkiye</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100">E-posta</p>
              <p className="font-medium">kvkk@cateringle.com</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
              uyarınca, Cateringle.com olarak veri sorumlusu sıfatıyla, kişisel
              verilerinizin işlenmesine ilişkin sizi bilgilendirmek isteriz.
            </p>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                  📊
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  İşlenen Kişisel Veriler
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { cat: "Kimlik Bilgileri", items: "Ad, soyad" },
                  {
                    cat: "İletişim Bilgileri",
                    items: "E-posta adresi, telefon numarası",
                  },
                  {
                    cat: "Hesap Bilgileri",
                    items: "Kullanıcı adı, şifre (şifrelenmiş)",
                  },
                  {
                    cat: "İşlem Bilgileri",
                    items: "Teklif talepleri, favoriler, yorumlar",
                  },
                  { cat: "Konum Bilgileri", items: "Şehir, ilçe tercihleri" },
                  {
                    cat: "Dijital İz Bilgileri",
                    items: "IP adresi, çerez verileri, cihaz bilgileri",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.cat}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.items}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                  🎯
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Kişisel Verilerin İşlenme Amaçları
                </h2>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "Üyelik işlemlerinin gerçekleştirilmesi",
                  "Platform hizmetlerinin sunulması",
                  "Catering firmalarıyla iletişim kurulması",
                  "Teklif taleplerinin yönetimi",
                  "Kullanıcı deneyiminin iyileştirilmesi",
                  "İstatistiksel analizlerin yapılması",
                  "Yasal yükümlülüklerin yerine getirilmesi",
                  "Hukuki süreçlerin takibi",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <svg
                      className="mt-1 h-5 w-5 shrink-0 text-emerald-500"
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
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg">
                  ⚖️
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Hukuki Sebepler
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                KVKK&apos;nın 5. ve 6. maddeleri kapsamında kişisel verileriniz:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Açık rızanız",
                  "Sözleşmenin kurulması veya ifası",
                  "Hukuki yükümlülüklerin yerine getirilmesi",
                  "Meşru menfaatlerimiz",
                ].map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-slate-600">
                hukuki sebeplerine dayalı olarak işlenmektedir.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-lg">
                  🔄
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Kişisel Verilerin Aktarımı
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Kişisel verileriniz aşağıdaki taraflara aktarılabilir:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Teklif talebinde bulunduğunuz catering firmaları",
                  "Hizmet sağlayıcılarımız (hosting, e-posta, analiz)",
                  "Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <svg
                      className="mt-1 h-5 w-5 shrink-0 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg">
                  📜
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Veri Sahibinin Hakları
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara
                sahipsiniz:
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
                  "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme",
                  "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
                  "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme",
                  "Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme",
                  "KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme",
                  "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
                  "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-xl bg-emerald-50 p-6">
              <h3 className="font-semibold text-slate-900">Başvuru Yöntemi</h3>
              <p className="mt-2 text-slate-600">
                Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki
                yöntemlerle bize başvurabilirsiniz:
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2">
                  <svg
                    className="h-5 w-5 text-emerald-600"
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
                  <span className="font-medium text-slate-700">
                    kvkk@cateringle.com
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Başvurularınız en geç 30 gün içinde ücretsiz olarak
                yanıtlanacaktır.
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
