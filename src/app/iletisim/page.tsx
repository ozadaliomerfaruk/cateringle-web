import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Cateringle.com ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-leaf--600 to-teal-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Size nasıl yardımcı olabiliriz?
          </h1>
          <p className="mt-4 text-lg text-leaf-100">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bize
            ulaşabilirsiniz.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* İletişim Bilgileri */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              {/* Kart 1 */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  İletişim Bilgileri
                </h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-leaf-100">
                      <svg
                        className="h-6 w-6 text-leaf-600"
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
                    <div>
                      <p className="text-sm text-slate-500">E-posta</p>
                      <a
                        href="mailto:info@cateringle.com"
                        className="font-medium text-slate-900 hover:text-leaf-600"
                      >
                        info@cateringle.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Adres</p>
                      <p className="font-medium text-slate-900">
                        İstanbul, Türkiye
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                      <svg
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Çalışma Saatleri</p>
                      <p className="font-medium text-slate-900">
                        Pazartesi - Cuma: 09:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Bizi takip edin
                </h3>
                <div className="mt-4 flex gap-3">
                  <a
                    href="https://instagram.com/cateringle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-transform hover:scale-105"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/cateringle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform hover:scale-105"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com/company/cateringle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform hover:scale-105"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Tedarikçi CTA */}
              <div className="rounded-2xl bg-linear-to-br from-leaf--600 to-teal-600 p-6 text-white">
                <h3 className="font-semibold">Catering Firması mısınız?</h3>
                <p className="mt-2 text-sm text-leaf-100">
                  Platformumuza katılın, binlerce müşteriye ulaşın.
                </p>
                <Link
                  href="/auth/register"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-leaf-700 transition-colors hover:bg-leaf-50"
                >
                  Tedarikçi Ol
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Bize mesaj gönderin
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Mesajınızı aldıktan sonra en kısa sürede size dönüş yapacağız.
              </p>

              <form className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Adınızı girin"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      E-posta
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Telefon{" "}
                      <span className="text-slate-400">(isteğe bağlı)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Konu
                    </label>
                    <select
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                    >
                      <option value="">Bir konu seçin</option>
                      <option value="general">Genel Soru</option>
                      <option value="support">Yardım ve Destek</option>
                      <option value="vendor">Firma Başvurusu</option>
                      <option value="partnership">İş Birliği</option>
                      <option value="feedback">Öneri ve Geri Bildirim</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Mesajınız
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Size nasıl yardımcı olabiliriz?"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-leaf--500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-leaf-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-leaf-700 hover:shadow-md sm:w-auto sm:px-8"
                >
                  Gönder
                </button>
              </form>
            </div>

            {/* SSS */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Sıkça Sorulan Sorular
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    q: "Cateringle.com'u kullanmak ücretli mi?",
                    a: "Hayır, müşteriler için platformumuz tamamen ücretsizdir. Firma arama, karşılaştırma ve teklif alma işlemleri için herhangi bir ücret ödemeniz gerekmez.",
                  },
                  {
                    q: "Catering firmamı platforma nasıl ekleyebilirim?",
                    a: '"Firmanızı Ekleyin" butonuna tıklayarak başvuru formunu doldurabilirsiniz. Başvurunuzu inceledikten sonra size e-posta ile dönüş yapacağız.',
                  },
                  {
                    q: "Teklif istediğimde ne oluyor?",
                    a: "Teklif talebiniz seçtiğiniz catering firmasına iletilir. Firma, paylaştığınız iletişim bilgileri üzerinden sizinle doğrudan iletişime geçecektir.",
                  },
                  {
                    q: "Yorumlar gerçek müşterilerden mi?",
                    a: "Evet, platformumuzdaki tüm yorumlar gerçek deneyimlere dayanmaktadır. Her yorum yayınlanmadan önce ekibimiz tarafından kontrol edilir.",
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-slate-900">
                      {faq.q}
                      <svg
                        className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <p className="border-t border-slate-200 bg-white p-4 text-sm text-slate-600">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
