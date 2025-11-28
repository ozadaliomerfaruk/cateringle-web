"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  vendorId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function FavoriteButton({
  vendorId,
  initialFavorited = false,
  size = "md",
  showTooltip = true,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("vendor_id", vendorId)
          .maybeSingle();

        setIsFavorited(!!data);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setIsChecking(false);
    }
  }, [vendorId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleToggle = async () => {
    if (!userId) {
      window.location.href = `/auth/login?redirect=/vendors/${vendorId}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      if (isFavorited) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("vendor_id", vendorId);

        if (deleteError) throw deleteError;
        setIsFavorited(false);
      } else {
        const { error: insertError } = await supabase
          .from("favorites")
          .insert({ user_id: userId, vendor_id: vendorId });

        if (insertError) throw insertError;
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      setError("İşlem başarısız");
      setTimeout(() => setError(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-12 w-12 text-2xl",
  };

  if (isChecking) {
    return (
      <div
        className={`${sizeClasses[size]} animate-pulse rounded-full bg-slate-100`}
      />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`group relative flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${
          sizeClasses[size]
        } ${
          isFavorited
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400"
        }`}
        aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
        ) : (
          <svg
            className={`transition-transform ${isFavorited ? "scale-110" : ""}`}
            fill={isFavorited ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ width: "60%", height: "60%" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          </span>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-red-600 px-2 py-1 text-xs text-white">
          {error}
        </span>
      )}
    </div>
  );
}
