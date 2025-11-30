interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  avgRating: number | null;
  reviewCount: number;
}

export default function ReviewList({
  reviews,
  avgRating,
  reviewCount,
}: ReviewListProps) {
  if (reviews.length === 0) {
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

  // Rating dağılımı hesapla
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Özet Kartı */}
      <div className="flex flex-col gap-6 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
        {/* Sol - Ortalama Puan */}
        <div className="text-center sm:pr-6 sm:border-r sm:border-slate-200">
          <div className="text-4xl font-bold text-slate-900">
            {avgRating?.toFixed(1) || "-"}
          </div>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(avgRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-200 text-slate-200"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {reviewCount} değerlendirme
          </div>
        </div>

        {/* Sağ - Dağılım */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 text-xs text-slate-600">{star}</span>
              <svg
                className="h-3 w-3 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-slate-500">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Yorum Listesi */}
      <div className="space-y-4">
        {reviews.map((review) => (
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
                        <svg
                          className="h-3 w-3"
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
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
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
            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Daha fazla yorum varsa */}
      {reviewCount > reviews.length && (
        <div className="text-center">
          <button className="text-sm font-medium text-leaf-600 hover:text-leaf-700">
            Tüm yorumları gör ({reviewCount})
          </button>
        </div>
      )}
    </div>
  );
}
