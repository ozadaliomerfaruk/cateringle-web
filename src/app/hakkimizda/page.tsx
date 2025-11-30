import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Cateringle.com - Türkiye'nin catering platformu hakkında bilgi edinin.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-leaf--600 via-leaf--700 to-teal-800 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Etkinlikleriniz için
            <br />
            <span className="text-leaf-200">
              doğru catering firmasını bulun
            </span>
          </h1>
          <p className="mt-6 text-lg text-leaf-100">
            Düğün, nişan, kurumsal toplantı ve özel günler için catering
            firmalarını keşfedin, karşılaştırın ve kolayca teklif alın.
          </p>
        </div>
      </section>

      {/* Hikaye */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Neden Cateringle&apos;ı kurduk?
          </h2>
          <div className="mt-8 space-y-4 text-slate-600 leading-relaxed">
            <p>
              Bir etkinlik planlarken en zorlu aşamalardan biri doğru catering
              firmasını bulmaktır. Onlarca telefon görüşmesi, e-posta yazışması
              ve fiyat karşılaştırması... Üstelik sonunda seçtiğiniz firmanın
              güvenilir olup olmadığından emin olamazsınız.
            </p>
            <p>
              Cateringle&apos;ı bu sorunu çözmek için kurduk. Amacımız, etkinlik
              planlayanların ihtiyaçlarına uygun catering firmalarını tek bir
              platformda bulmalarını, karşılaştırmalarını ve kolayca iletişime
              geçmelerini sağlamak.
            </p>
            <p>
              Catering firmaları için ise yeni müşterilere ulaşmanın ve işlerini
              büyütmenin kolay bir yolunu sunuyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-leaf--50 to-teal-50 p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-leaf-600">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Misyonumuz
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Etkinlik planlayanları doğru catering firmalarıyla buluşturmak.
                Güvenilir bilgi, şeffaf fiyatlandırma ve kolay iletişim ile
                herkesin etkinliğini unutulmaz kılmasına yardımcı olmak.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Vizyonumuz
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Türkiye&apos;de catering sektörünün dijitalleşmesine öncülük
                etmek. Hem müşteriler hem de firmalar için değer yaratan,
                güvenilir bir platform olmak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ne Sunuyoruz */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Platformumuzda neler var?
            </h2>
            <p className="mt-3 text-slate-600">
              Hem etkinlik planlayanlar hem de catering firmaları için
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Müşteriler İçin */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Etkinlik Planlayanlar İçin
                </h3>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Catering firmalarını tek yerden karşılaştırın",
                  "Şehir, bütçe ve kişi sayısına göre filtreleyin",
                  "Gerçek müşteri yorumlarını okuyun",
                  "Kolayca teklif talep edin",
                  "Menü ve fotoğrafları inceleyin",
                  "Beğendiğiniz firmaları kaydedin",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-leaf-500"
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
                    <span className="text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Firmalar İçin */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-100">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Catering Firmaları İçin
                </h3>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Ücretsiz firma profili oluşturun",
                  "Yeni müşterilere ulaşın",
                  "Online teklif talepleri alın",
                  "Menü ve fotoğraflarınızı sergileyin",
                  "Müşteri yorumlarıyla güven oluşturun",
                  "İstatistiklerle performansınızı takip edin",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-leaf-500"
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
                    <span className="text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Neden Cateringle */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Neden Cateringle?
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg
                    className="h-8 w-8 text-leaf-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
                title: "Kolay Keşif",
                desc: "Gelişmiş filtrelerle ihtiyacınıza uygun firmayı hızlıca bulun.",
              },
              {
                icon: (
                  <svg
                    className="h-8 w-8 text-leaf-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ),
                title: "Gerçek Yorumlar",
                desc: "Müşteri deneyimlerini okuyun, bilinçli karar verin.",
              },
              {
                icon: (
                  <svg
                    className="h-8 w-8 text-leaf-600"
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
                ),
                title: "Kolay Teklif",
                desc: "Tek formla firmalardan hızlıca teklif alın.",
              },
              {
                icon: (
                  <svg
                    className="h-8 w-8 text-leaf-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Tamamen Ücretsiz",
                desc: "Müşteriler için tüm özellikler ücretsiz.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-50">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Başlamaya hazır mısınız?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Etkinliğiniz için doğru catering firmasını bulmak artık çok kolay.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/vendors"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-leaf-700 hover:shadow-xl"
            >
              Firmaları Keşfedin
              <svg
                className="h-5 w-5"
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
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Firmanızı Ekleyin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
