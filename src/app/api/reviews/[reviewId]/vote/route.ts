// src/app/api/reviews/[reviewId]/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const voteSchema = z.object({
  isHelpful: z.boolean(),
});

// POST - Vote on a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
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
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri" } },
        { status: 400 }
      );
    }

    const { isHelpful } = parsed.data;

    // Check if review exists and is approved
    const { data: review } = await supabase
      .from("reviews")
      .select("id, is_approved")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Yorum bulunamadı" } },
        { status: 404 }
      );
    }

    if (!review.is_approved) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_APPROVED", message: "Bu yorum henüz onaylanmamış" } },
        { status: 400 }
      );
    }

    // Upsert vote (insert or update)
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("review_votes" as any)
      .upsert(
        {
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        },
        {
          onConflict: "review_id,user_id",
        }
      );

    if (error) {
      console.error("Vote error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Oy kaydedilemedi" } },
        { status: 500 }
      );
    }

    // Get updated counts
    const { data: updatedReview } = await supabase
      .from("reviews")
      .select("helpful_count, not_helpful_count")
      .eq("id", reviewId)
      .single() as { data: { helpful_count: number; not_helpful_count: number } | null };

    return NextResponse.json({
      ok: true,
      data: {
        helpfulCount: updatedReview?.helpful_count || 0,
        notHelpfulCount: updatedReview?.not_helpful_count || 0,
      },
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}

// DELETE - Remove vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Giriş yapmalısınız" } },
        { status: 401 }
      );
    }

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("review_votes" as any)
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete vote error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Oy silinemedi" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete vote error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}
