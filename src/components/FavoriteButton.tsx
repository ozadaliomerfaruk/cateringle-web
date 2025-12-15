"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteButtonProps {
  vendorId: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export default function FavoriteButton({
  vendorId,
  size = "md",
  showTooltip = true,
  className = "",
}: FavoriteButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    isFavorite,
    toggleFavorite,
    loading: favoritesLoading,
  } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);

  const isFavorited = isFavorite(vendorId);
  const isLoading = authLoading || favoritesLoading;

  const handleToggle = async () => {
    // Giriş yapmamış kullanıcıyı login'e yönlendir
    if (!user) {
      window.location.href = `/auth/login?redirect=/vendors`;
      return;
    }

    // Optimistic update için toggle'ı çağır
    setIsToggling(true);
    try {
      await toggleFavorite(vendorId);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-12 w-12 text-2xl",
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} animate-pulse rounded-full bg-slate-100 ${className}`}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`group relative flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${
          sizeClasses[size]
        } ${
          isFavorited
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400"
        }`}
        aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {isToggling ? (
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
    </div>
  );
}
