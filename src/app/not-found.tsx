// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="mx-auto max-w-lg text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 h-48 w-48">
          {/* Plate */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border-8 border-slate-200 bg-white shadow-lg"></div>
          </div>
          {/* Fork and Knife */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-32 w-8 -rotate-12 text-slate-300"
              viewBox="0 0 24 80"
              fill="currentColor"
            >
              <rect x="10" y="0" width="4" height="50" rx="2" />
              <rect x="6" y="0" width="2" height="20" rx="1" />
              <rect x="10" y="0" width="2" height="20" rx="1" />
              <rect x="14" y="0" width="2" height="20" rx="1" />
            </svg>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-32 w-8 rotate-12 text-slate-300"
              viewBox="0 0 24 80"
              fill="currentColor"
            >
              <path d="M8 0 C8 15, 16 15, 16 0 L16 20 C16 25, 8 25, 8 20 Z" />
              <rect x="10" y="20" width="4" height="40" rx="2" />
            </svg>
          </div>
          {/* 404 Text on plate */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-leaf-600">404</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Bu sayfa menüde yok
        </h1>
        <p className="mt-4 text-slate-600">
          Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak
          kullanım dışı olabilir.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-leaf-700 hover:shadow-md"
          >
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/vendors"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
          >
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Firmaları Keşfet
          </Link>
        </div>

        {/* Help */}
        <p className="mt-8 text-sm text-slate-500">
          Yardıma mı ihtiyacınız var?{" "}
          <Link
            href="/iletisim"
            className="font-medium text-leaf-600 hover:text-leaf-700"
          >
            Bize ulaşın
          </Link>
        </p>
      </div>
    </main>
  );
}
