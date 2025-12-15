// src/app/offline/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { WifiSlash, ArrowClockwise, House } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Çevrimdışı | Cateringle",
  description: "İnternet bağlantınız yok",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
        <WifiSlash size={48} className="text-slate-400" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-slate-900">Çevrimdışısınız</h1>

      <p className="mb-8 max-w-md text-slate-600">
        İnternet bağlantınız yok gibi görünüyor. Lütfen bağlantınızı kontrol
        edip tekrar deneyin.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-leaf-600 px-6 py-3 font-medium text-white transition-colors hover:bg-leaf-700"
        >
          <ArrowClockwise size={20} />
          Tekrar Dene
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <House size={20} />
          Ana Sayfa
        </Link>
      </div>

      <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>İpucu:</strong> Cateringle&apos;ı ana ekranınıza ekleyerek daha
          hızlı erişebilir ve bazı özellikleri çevrimdışı kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
}
