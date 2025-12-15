// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET - Public reviews for a vendor
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get("vendorId");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "recent";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!vendorId) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_VENDOR_ID", message: "vendorId gerekli" } },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("get_public_reviews", {
      p_vendor_id: vendorId,
      p_rating: rating ? parseInt(rating) : null,
      p_sort: sort,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("Get reviews error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Yorumlar yüklenemedi" } },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendorId)
      .eq("is_approved", true)
      .is("deleted_at", null);

    return NextResponse.json({
      ok: true,
      data: {
        reviews: data || [],
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}

// POST - Create a new review
const createReviewSchema = z.object({
  vendorId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  eventType: z.string().max(100).optional(),
  guestCount: z.number().min(1).max(10000).optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri" } },
        { status: 400 }
      );
    }

    const { vendorId, rating, comment, eventType, guestCount } = parsed.data;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    // Check if user already reviewed this vendor
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("customer_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { ok: false, error: { code: "ALREADY_REVIEWED", message: "Bu firmayı zaten değerlendirdiniz" } },
        { status: 400 }
      );
    }

    // Insert review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        vendor_id: vendorId,
        customer_id: user.id,
        customer_name: profile?.full_name || "Anonim",
        customer_email: user.email,
        rating,
        comment: comment?.trim() || null,
        event_type: eventType || null,
        guest_count: guestCount || null,
        is_verified: false,
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Create review error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Yorum kaydedilemedi" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}
