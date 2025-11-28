"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({
  className,
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    setError(false);

    try {
      const supabase = createBrowserSupabaseClient();

      // Global scope ile tüm session'ları temizle
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global",
      });

      if (signOutError) throw signOutError;

      // Önce refresh et, sonra yönlendir
      router.refresh();

      // Kısa bir gecikme ile yönlendir (state'in güncellenmesi için)
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (err) {
      console.error("Logout error:", err);
      setError(true);
      setTimeout(() => setError(false), 2000);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        `inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 disabled:opacity-50 ${
          error
            ? "border-red-300 text-red-600"
            : "border-slate-200 text-slate-600"
        }`
      }
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Çıkış yapılıyor...
        </>
      ) : error ? (
        "Hata! Tekrar deneyin"
      ) : (
        children || "Çıkış Yap"
      )}
    </button>
  );
}
