// src/app/api/vendor/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET - Get vendor's reviews with replies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Giriş yapmalısınız" } },
        { status: 401 }
      );
    }

    // Get vendor
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!vendor) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_VENDOR", message: "Vendor hesabınız yok" } },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const rating = searchParams.get("rating");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("get_vendor_reviews", {
      p_vendor_id: vendor.id,
      p_status: status,
      p_rating: rating ? parseInt(rating) : null,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("Get vendor reviews error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Yorumlar yüklenemedi" } },
        { status: 500 }
      );
    }

    // Get stats directly from reviews table
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("is_approved, rating, vendor_reply" as "*")
      .eq("vendor_id", vendor.id)
      .is("deleted_at", null) as { data: Array<{ is_approved: boolean; rating: number; vendor_reply: string | null }> | null };

    const reviews = allReviews || [];
    const totalReviews = reviews.length;
    const pendingCount = reviews.filter((r) => !r.is_approved).length;
    const approvedCount = reviews.filter((r) => r.is_approved).length;
    const approvedReviews = reviews.filter((r) => r.is_approved);
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;
    const repliedCount = reviews.filter((r) => r.vendor_reply).length;

    return NextResponse.json({
      ok: true,
      data: {
        reviews: data || [],
        stats: {
          total: totalReviews,
          pending: pendingCount,
          approved: approvedCount,
          replied: repliedCount,
          unreplied: approvedCount - repliedCount,
          avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : 0,
        },
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Vendor reviews API error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}
