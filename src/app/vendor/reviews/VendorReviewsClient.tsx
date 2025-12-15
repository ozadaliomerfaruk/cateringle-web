"use client";

// src/app/vendor/reviews/VendorReviewsClient.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Star,
  ChatCircle,
  Clock,
  CheckCircle,
  Warning,
  FunnelSimple,
  CaretDown,
  PaperPlaneRight,
  Users,
  Calendar,
} from "@phosphor-icons/react";

interface Review {
  id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  comment: string | null;
  event_type: string | null;
  guest_count: number | null;
  is_approved: boolean;
  is_verified: boolean;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  reply_text: string | null;
  reply_created_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  replied: number;
  unreplied: number;
  avgRating: number;
}

interface VendorReviewsClientProps {
  vendorId: string;
  vendorName: string;
}

export default function VendorReviewsClient({
  vendorId: _vendorId,
  vendorName,
}: VendorReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      if (ratingFilter) params.set("rating", ratingFilter.toString());

      const res = await fetch(`/api/vendor/reviews?${params}`);
      const data = await res.json();

      if (data.ok) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: replyText.trim() }),
      });

      const data = await res.json();
      if (data.ok) {
        setReplyingTo(null);
        setReplyText("");
        fetchReviews();
      } else {
        alert(data.error?.message || "Yanıt gönderilemedi");
      }
    } catch (error) {
      console.error("Reply error:", error);
      alert("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm("Yanıtı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        fetchReviews();
      } else {
        alert(data.error?.message || "Yanıt silinemedi");
      }
    } catch (error) {
      console.error("Delete reply error:", error);
    }
  };

  const startEditing = (review: Review) => {
    setReplyingTo(review.id);
    setReplyText(review.reply_text || "");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yorumlar</h1>
        <p className="mt-1 text-sm text-slate-500">
          {vendorName} için müşteri yorumlarını görüntüleyin ve yanıtlayın
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500">Toplam</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-1">
              <Star size={20} weight="fill" className="text-amber-400" />
              <span className="text-2xl font-bold text-slate-900">
                {stats.avgRating || "-"}
              </span>
            </div>
            <div className="text-xs text-slate-500">Ortalama</div>
          </div>
          <div className="rounded-xl border bg-amber-50 p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-amber-600">Bekleyen</div>
          </div>
          <div className="rounded-xl border bg-leaf-50 p-4">
            <div className="text-2xl font-bold text-leaf-600">{stats.approved}</div>
            <div className="text-xs text-leaf-600">Onaylı</div>
          </div>
          <div className="rounded-xl border bg-blue-50 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.replied}</div>
            <div className="text-xs text-blue-600">Yanıtlanan</div>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <div className="text-2xl font-bold text-slate-600">{stats.unreplied}</div>
            <div className="text-xs text-slate-500">Yanıtsız</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FunnelSimple size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filtrele:</span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border bg-white py-2 pl-3 pr-8 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekleyen</option>
            <option value="approved">Onaylı</option>
            <option value="replied">Yanıtlanan</option>
            <option value="unreplied">Yanıtsız</option>
          </select>
          <CaretDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <select
            value={ratingFilter || ""}
            onChange={(e) =>
              setRatingFilter(e.target.value ? parseInt(e.target.value) : null)
            }
            className="appearance-none rounded-lg border bg-white py-2 pl-3 pr-8 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
          >
            <option value="">Tüm Puanlar</option>
            <option value="5">5 Yıldız</option>
            <option value="4">4 Yıldız</option>
            <option value="3">3 Yıldız</option>
            <option value="2">2 Yıldız</option>
            <option value="1">1 Yıldız</option>
          </select>
          <CaretDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <ChatCircle size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-slate-500">Henüz yorum bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-semibold text-leaf-700">
                    {review.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {review.customer_name}
                      </span>
                      {!review.is_approved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          <Clock size={12} />
                          Bekliyor
                        </span>
                      )}
                      {review.is_approved && !review.reply_text && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <ChatCircle size={12} />
                          Yanıt Bekliyor
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
                  {formatDate(review.created_at)}
                </time>
              </div>

              {/* Event Details */}
              {(review.event_type || review.guest_count) && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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

              {/* Helpful counts */}
              {(review.helpful_count > 0 || review.not_helpful_count > 0) && (
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  {review.helpful_count > 0 && (
                    <span>{review.helpful_count} kişi faydalı buldu</span>
                  )}
                </div>
              )}

              {/* Existing Reply */}
              {review.reply_text && replyingTo !== review.id && (
                <div className="mt-4 rounded-lg bg-leaf-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="text-leaf-600"
                      />
                      <span className="text-xs font-medium text-leaf-700">
                        Yanıtınız
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(review)}
                        className="text-xs text-leaf-600 hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteReply(review.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-leaf-800">{review.reply_text}</p>
                  {review.reply_created_at && (
                    <time className="mt-1 block text-[10px] text-leaf-600">
                      {formatDate(review.reply_created_at)}
                    </time>
                  )}
                </div>
              )}

              {/* Reply Form */}
              {review.is_approved && replyingTo === review.id && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-1 focus:ring-leaf-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {replyText.length}/1000
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={submitting || !replyText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
                      >
                        {submitting ? (
                          "Gönderiliyor..."
                        ) : (
                          <>
                            <PaperPlaneRight size={14} />
                            Gönder
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {review.is_approved && !review.reply_text && replyingTo !== review.id && (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-leaf-600 hover:text-leaf-700"
                >
                  <ChatCircle size={16} />
                  Yanıtla
                </button>
              )}

              {/* Pending Warning */}
              {!review.is_approved && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <Warning size={14} />
                  Bu yorum admin onayı bekliyor. Onaylandıktan sonra yanıt verebilirsiniz.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
