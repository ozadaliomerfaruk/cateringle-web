import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Cateringle.com gizlilik politikası ve kişisel verilerin korunması hakkında bilgiler.",
};

export default function PrivacyPolicyPage() {
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
            Gizlilik Politikası
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
        {/* Quick Links */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Bu Sayfada</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Toplanan Veriler",
              "Kullanım Amaçları",
              "Verilerin Paylaşımı",
              "Veri Güvenliği",
              "Çerezler",
              "Haklarınız",
            ].map((item, i) => (
              <a
                key={i}
                href={`#section-${i + 1}`}
                className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-leaf-100 hover:text-leaf-700"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600">
              Cateringle.com olarak, kullanıcılarımızın gizliliğine büyük önem
              veriyoruz. Bu Gizlilik Politikası, platformumuzu kullanırken
              toplanan, işlenen ve saklanan kişisel verileriniz hakkında sizi
              bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <div id="section-1" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  1
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Toplanan Veriler
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Platformumuzu kullanırken aşağıdaki kişisel verileriniz
                toplanabilir:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Ad, soyad ve iletişim bilgileri (e-posta, telefon)",
                  "Hesap bilgileri (kullanıcı adı, şifre)",
                  "Etkinlik ve catering talep bilgileri",
                  "Konum bilgileri (şehir, ilçe)",
                  "Ödeme bilgileri (ödeme entegrasyonu aktif olduğunda)",
                  "Cihaz ve tarayıcı bilgileri",
                  "IP adresi ve çerez verileri",
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div id="section-2" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  2
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Verilerin Kullanım Amaçları
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Toplanan kişisel veriler aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Hesap oluşturma ve yönetimi",
                  "Catering firmalarıyla iletişim kurulması",
                  "Teklif taleplerinin iletilmesi",
                  "Platform hizmetlerinin sunulması ve iyileştirilmesi",
                  "Yasal yükümlülüklerin yerine getirilmesi",
                  "Güvenlik ve dolandırıcılık önleme",
                  "İstatistiksel analizler ve raporlama",
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div id="section-3" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  3
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Verilerin Paylaşımı
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla
                paylaşılmaz:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Teklif talebinde bulunduğunuz catering firmalarıyla (yalnızca ilgili bilgiler)",
                  "Yasal zorunluluklar gereği yetkili kurumlarla",
                  "Hizmet sağlayıcılarımızla (hosting, e-posta servisleri vb.) - gizlilik sözleşmeleri kapsamında",
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div id="section-4" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  4
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Veri Güvenliği
                </h2>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                <p className="text-slate-600">
                  Kişisel verilerinizin güvenliği için endüstri standardı
                  güvenlik önlemleri uygulanmaktadır. Verileriniz şifrelenmiş
                  bağlantılar (SSL/TLS) üzerinden iletilir ve güvenli
                  sunucularda saklanır.
                </p>
              </div>
            </div>

            <div id="section-5" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  5
                </span>
                <h2 className="text-xl font-bold text-slate-900">Çerezler</h2>
              </div>
              <p className="mt-4 text-slate-600">
                Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler
                kullanmaktadır. Çerez kullanımı hakkında detaylı bilgi için{" "}
                <Link
                  href="/cerez-politikasi"
                  className="font-medium text-leaf-600 hover:text-leaf-700 hover:underline"
                >
                  Çerez Politikası
                </Link>{" "}
                sayfamızı ziyaret edebilirsiniz.
              </p>
            </div>

            <div id="section-6" className="mt-10 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-lg font-bold text-leaf-700">
                  6
                </span>
                <h2 className="text-xl font-bold text-slate-900">Haklarınız</h2>
              </div>
              <p className="mt-4 text-slate-600">
                KVKK kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
                  "İşlenen verilere ilişkin bilgi talep etme",
                  "Verilerin düzeltilmesini veya silinmesini isteme",
                  "Verilerin aktarıldığı üçüncü kişileri öğrenme",
                  "İşlemeye itiraz etme",
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 rounded-xl bg-leaf-50 p-6">
              <h3 className="font-semibold text-slate-900">İletişim</h3>
              <p className="mt-2 text-slate-600">
                Bu haklarınızı kullanmak veya gizlilik politikamız hakkında
                sorularınız için{" "}
                <Link
                  href="/iletisim"
                  className="font-medium text-leaf-600 hover:underline"
                >
                  İletişim
                </Link>{" "}
                sayfamız üzerinden veya <strong>info@cateringle.com</strong>{" "}
                adresinden bize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/kullanim-sartlari",
              label: "Kullanım Şartları",
              icon: "📄",
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
