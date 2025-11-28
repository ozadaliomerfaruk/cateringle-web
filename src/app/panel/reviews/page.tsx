import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Tip tanımları
type PendingReview = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  vendor: { id: string; business_name: string } | null;
};

type ApprovedReview = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  vendor: { id: string; business_name: string } | null;
};

async function approveReview(formData: FormData) {
  "use server";
  const reviewId = formData.get("review_id") as string;

  await supabaseAdmin
    .from("reviews")
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq("id", reviewId);

  revalidatePath("/panel/reviews");
}

async function rejectReview(formData: FormData) {
  "use server";
  const reviewId = formData.get("review_id") as string;

  await supabaseAdmin.from("reviews").delete().eq("id", reviewId);

  revalidatePath("/panel/reviews");
}

export default async function AdminReviewsPage() {
  // Bekleyen yorumlar
  const { data: pendingReviews } = await supabaseAdmin
    .from("reviews")
    .select(
      `
      id,
      customer_name,
      customer_email,
      rating,
      comment,
      is_verified,
      created_at,
      vendor:vendors(id, business_name)
    `
    )
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  // Onaylı yorumlar
  const { data: approvedReviews } = await supabaseAdmin
    .from("reviews")
    .select(
      `
      id,
      customer_name,
      rating,
      comment,
      created_at,
      vendor:vendors(id, business_name)
    `
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedPendingReviews = pendingReviews as PendingReview[] | null;
  const typedApprovedReviews = approvedReviews as ApprovedReview[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Yorum Yönetimi</h1>
        <p className="text-sm text-slate-600">
          Müşteri yorumlarını inceleyin ve onaylayın.
        </p>
      </div>

      {/* Bekleyen Yorumlar */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-amber-700">
          Onay Bekleyen Yorumlar ({typedPendingReviews?.length || 0})
        </h2>

        {typedPendingReviews && typedPendingReviews.length > 0 ? (
          <div className="space-y-3">
            {typedPendingReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-amber-200 bg-amber-50 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{review.customer_name}</p>
                    <p className="text-xs text-slate-500">
                      {review.customer_email} • {review.vendor?.business_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="mb-3 text-sm text-slate-700">
                    {review.comment}
                  </p>
                )}

                <div className="flex gap-2">
                  <form action={approveReview}>
                    <input type="hidden" name="review_id" value={review.id} />
                    <button
                      type="submit"
                      className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Onayla
                    </button>
                  </form>
                  <form action={rejectReview}>
                    <input type="hidden" name="review_id" value={review.id} />
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-white p-4 text-sm text-slate-500">
            Onay bekleyen yorum yok.
          </p>
        )}
      </section>

      {/* Onaylı Yorumlar */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-emerald-700">
          Onaylı Yorumlar (Son 20)
        </h2>

        {typedApprovedReviews && typedApprovedReviews.length > 0 ? (
          <div className="space-y-2">
            {typedApprovedReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium">{review.customer_name}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-600">
                    {review.vendor?.business_name}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {review.created_at &&
                    new Date(review.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-white p-4 text-sm text-slate-500">
            Henüz onaylı yorum yok.
          </p>
        )}
      </section>
    </div>
  );
}
