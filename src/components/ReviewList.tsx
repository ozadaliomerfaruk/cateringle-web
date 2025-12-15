"use client";

import { useState } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Users,
  Calendar,
  CheckCircle,
  CaretDown,
  FunnelSimple,
} from "@phosphor-icons/react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  event_type?: string | null;
  guest_count?: number | null;
  is_verified: boolean;
  helpful_count?: number;
  not_helpful_count?: number;
  created_at: string;
  // API returns these field names
  vendor_reply?: string | null;
  vendor_reply_at?: string | null;
  // Legacy support
  reply_text?: string | null;
  reply_created_at?: string | null;
}

interface ReviewListProps {
  reviews: Review[];
  avgRating: number | null;
  reviewCount: number;
  userId?: string | null;
}

export default function ReviewList({
  reviews: initialReviews,
  avgRating,
  reviewCount,
  userId,
}: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [votingId, setVotingId] = useState<string | null>(null);

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((r) => !ratingFilter || r.rating === ratingFilter)
    .sort((a, b) => {
      if (sortBy === "helpful") {
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      }
      if (sortBy === "rating_high") {
        return b.rating - a.rating;
      }
      if (sortBy === "rating_low") {
        return a.rating - b.rating;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!userId) {
      alert("Oy vermek için giriş yapmalısınız");
      return;
    }

    setVotingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful }),
      });

      const data = await res.json();
      if (data.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpful_count: data.data.helpfulCount,
                  not_helpful_count: data.data.notHelpfulCount,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setVotingId(null);
    }
  };

  if (initialReviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm text-slate-500">Henüz yorum yapılmamış</p>
        <p className="mt-1 text-xs text-slate-400">İlk yorumu siz yapın!</p>
      </div>
    );
  }

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: initialReviews.filter((r) => r.rating === star).length,
    percentage:
      (initialReviews.filter((r) => r.rating === star).length /
        initialReviews.length) *
      100,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="flex flex-col gap-6 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
        {/* Left - Average Rating */}
        <div className="text-center sm:border-r sm:border-slate-200 sm:pr-6">
          <div className="text-4xl font-bold text-slate-900">
            {avgRating?.toFixed(1) || "-"}
          </div>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                weight={star <= Math.round(avgRating || 0) ? "fill" : "regular"}
                className={
                  star <= Math.round(avgRating || 0)
                    ? "text-amber-400"
                    : "text-slate-200"
                }
              />
            ))}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {reviewCount} değerlendirme
          </div>
        </div>

        {/* Right - Distribution */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <button
              key={star}
              onClick={() =>
                setRatingFilter(ratingFilter === star ? null : star)
              }
              className={`flex w-full items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-slate-100 ${
                ratingFilter === star ? "bg-slate-200" : ""
              }`}
            >
              <span className="w-3 text-xs text-slate-600">{star}</span>
              <Star size={12} weight="fill" className="text-amber-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-slate-500">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FunnelSimple size={16} className="text-slate-400" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none rounded-lg border bg-white py-1.5 pl-3 pr-7 text-xs focus:border-leaf-500 focus:outline-none"
          >
            <option value="recent">En Yeni</option>
            <option value="helpful">En Faydalı</option>
            <option value="rating_high">En Yüksek Puan</option>
            <option value="rating_low">En Düşük Puan</option>
          </select>
          <CaretDown
            size={12}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Clear filter */}
        {ratingFilter && (
          <button
            onClick={() => setRatingFilter(null)}
            className="text-xs text-leaf-600 hover:underline"
          >
            Filtreyi Temizle
          </button>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-semibold text-leaf-700">
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {review.customer_name}
                    </span>
                    {review.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-medium text-leaf-700">
                        <CheckCircle size={12} weight="fill" />
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                  {/* Stars */}
                  <div className="mt-0.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        weight={star <= review.rating ? "fill" : "regular"}
                        className={
                          star <= review.rating
                            ? "text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <time className="shrink-0 text-xs text-slate-400">
                {new Date(review.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>

            {/* Event Details */}
            {(review.event_type || review.guest_count) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {review.event_type && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    <Calendar size={12} />
                    {review.event_type}
                  </span>
                )}
                {review.guest_count && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    <Users size={12} />
                    {review.guest_count} kişi
                  </span>
                )}
              </div>
            )}

            {/* Comment */}
            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.comment}
              </p>
            )}

            {/* Vendor Reply */}
            {(review.vendor_reply || review.reply_text) && (
              <div className="mt-4 rounded-lg bg-leaf-50 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-leaf-600" />
                  <span className="text-xs font-medium text-leaf-700">
                    İşletme Yanıtı
                  </span>
                </div>
                <p className="mt-2 text-sm text-leaf-800">
                  {review.vendor_reply || review.reply_text}
                </p>
                {(review.vendor_reply_at || review.reply_created_at) && (
                  <time className="mt-1 block text-[10px] text-leaf-600">
                    {new Date(review.vendor_reply_at || review.reply_created_at!).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                )}
              </div>
            )}

            {/* Helpful Voting */}
            <div className="mt-4 flex items-center gap-4 border-t pt-3">
              <span className="text-xs text-slate-500">Bu yorum faydalı mı?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(review.id, true)}
                  disabled={votingId === review.id}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                  <ThumbsUp size={14} />
                  <span>{review.helpful_count || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(review.id, false)}
                  disabled={votingId === review.id}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                  <ThumbsDown size={14} />
                  <span>{review.not_helpful_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {reviewCount > filteredReviews.length && (
        <div className="text-center">
          <button className="text-sm font-medium text-leaf-600 hover:text-leaf-700">
            Tüm yorumları gör ({reviewCount})
          </button>
        </div>
      )}
    </div>
  );
}
