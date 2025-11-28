// src/app/components/ReviewForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ReviewFormProps {
  vendorId: string;
  vendorName: string;
}

export default function ReviewForm({ vendorId, vendorName }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .maybeSingle();

        setUser({
          id: authUser.id,
          name: profile?.full_name || "",
          email: authUser.email || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setIsCheckingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Lütfen bir puan seçin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      const { error: insertError } = await supabase.from("reviews").insert({
        vendor_id: vendorId,
        customer_id: user?.id || null,
        customer_name: user?.name || "Anonim",
        customer_email: user?.email || null,
        rating,
        comment: comment.trim() || null,
        is_verified: false,
        is_approved: false,
      });

      if (insertError) {
        console.error("Review error:", insertError);
        setError("Yorum gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }

      setSuccess(true);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking user
  if (isCheckingUser) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-center gap-2 py-4">
          <svg
            className="h-5 w-5 animate-spin text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
          >
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-white p-4 text-center">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{vendorName}</span> için yorum yapmak
          için giriş yapmalısınız.
        </p>

        <a
          href={`/auth/login?redirect=/vendors/${vendorId}`}
          className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
        >
          Giriş Yap
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-emerald-700">
            Yorumunuz gönderildi!
          </p>
        </div>
        <p className="mt-1 text-xs text-emerald-600">
          <span className="font-medium">{vendorName}</span> için yorumunuz
          incelendikten sonra yayınlanacaktır.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-3 text-xs font-medium text-emerald-700 hover:underline"
        >
          Başka bir yorum yap
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-900">
        {vendorName} Hakkında Yorum Yap
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Deneyiminizi diğer kullanıcılarla paylaşın
      </p>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Yıldız Puanlama */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-slate-700">
          Puanınız *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} yıldız`}
            >
              <svg
                className={`h-7 w-7 ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 self-center text-sm text-slate-600">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Yorum */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          Yorumunuz (Opsiyonel)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={`${vendorName} ile deneyiminizi paylaşın...`}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {comment.length}/1000
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Gönderiliyor...
          </span>
        ) : (
          "Yorum Gönder"
        )}
      </button>

      <p className="mt-2 text-center text-[10px] text-slate-400">
        Yorumunuz incelendikten sonra yayınlanacaktır.
      </p>
    </form>
  );
}
