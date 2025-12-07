// src/components/Footer.tsx
import Link from "next/link";
import { Buildings, Confetti } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-leaf--500 to-teal-600 text-xl font-bold text-white">
                C
              </div>
              <span className="text-xl font-bold text-white">
                Cater<span className="text-leaf-400">ingle</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Türkiye&apos;nin en kapsamlı catering platformu. Kurumsal ve
              bireysel etkinlikleriniz için en uygun firmayı bulun.
            </p>
            {/* Social */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/cateringlecom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-leaf-600 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/cateringlecom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-leaf-600 hover:text-white"
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
                href="https://linkedin.com/company/cateringlecom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-leaf-600 hover:text-white"
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

          {/* Kurumsal Hizmetler */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
                <Buildings size={14} weight="light" className="text-blue-400" />
              </span>
              Kurumsal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/vendors?segment=kurumsal"
                  className="text-sm text-slate-400 transition-colors hover:text-blue-400"
                >
                  Tüm Kurumsal Hizmetler
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=kurumsal&category=ofis-ogle-yemekleri"
                  className="text-sm text-slate-400 transition-colors hover:text-blue-400"
                >
                  Ofis Öğle Yemekleri
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=kurumsal&category=toplanti-ikramlari"
                  className="text-sm text-slate-400 transition-colors hover:text-blue-400"
                >
                  Toplantı İkramları
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=kurumsal&category=kurumsal-etkinlik"
                  className="text-sm text-slate-400 transition-colors hover:text-blue-400"
                >
                  Kurumsal Etkinlik
                </Link>
              </li>
            </ul>
          </div>

          {/* Bireysel Hizmetler */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-leaf-500/20">
                <Confetti size={14} weight="light" className="text-leaf-400" />
              </span>
              Bireysel
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/vendors?segment=bireysel"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Tüm Bireysel Hizmetler
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=bireysel&category=dugun-nisan"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Düğün & Nişan
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=bireysel&category=dogum-gunu"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Doğum Günü
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?segment=bireysel&category=evde-sef-hizmeti"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Evde Şef Hizmeti
                </Link>
              </li>
            </ul>
          </div>

          {/* Firmalar İçin */}
          <div>
            <h3 className="font-semibold text-white">Firmalar İçin</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Tedarikçi Ol
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Firma Girişi
                </Link>
              </li>
              <li>
                <Link
                  href="/hakkimizda"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Neden Cateringle?
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="font-semibold text-white">Yasal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/hakkimizda"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  İletişim
                </Link>
              </li>
              <li>
                <Link
                  href="/gizlilik-politikasi"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/kullanim-sartlari"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link
                  href="/kvkk"
                  className="text-sm text-slate-400 transition-colors hover:text-leaf-400"
                >
                  KVKK
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © 2025 Cateringle.com. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Türkiye&apos;de tasarlandı</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
