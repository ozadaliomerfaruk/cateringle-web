// src/app/api/reviews/[reviewId]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const replySchema = z.object({
  replyText: z.string().min(1).max(1000),
});

// POST - Create or update vendor reply
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

    // Check if review belongs to this vendor
    const { data: review } = await supabase
      .from("reviews")
      .select("id, vendor_id, is_approved")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Yorum bulunamadı" } },
        { status: 404 }
      );
    }

    if (review.vendor_id !== vendor.id) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Bu yorum size ait değil" } },
        { status: 403 }
      );
    }

    if (!review.is_approved) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_APPROVED", message: "Onaylanmamış yorumlara yanıt verilemez" } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Yanıt metni gerekli (max 1000 karakter)" } },
        { status: 400 }
      );
    }

    const { replyText } = parsed.data;

    // Update review with vendor reply
    const { data: updatedReview, error } = await supabase
      .from("reviews")
      .update({
        vendor_reply: replyText.trim(),
        vendor_reply_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Reply error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Yanıt kaydedilemedi" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: updatedReview });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}

// DELETE - Delete vendor reply
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

    // Check if review belongs to this vendor
    const { data: review } = await supabase
      .from("reviews")
      .select("id, vendor_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review || review.vendor_id !== vendor.id) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Bu yanıtı silemezsiniz" } },
        { status: 403 }
      );
    }

    // Clear vendor reply
    const { error } = await supabase
      .from("reviews")
      .update({
        vendor_reply: null,
        vendor_reply_at: null,
      } as Record<string, unknown>)
      .eq("id", reviewId);

    if (error) {
      console.error("Delete reply error:", error);
      return NextResponse.json(
        { ok: false, error: { code: "DB_ERROR", message: "Yanıt silinemedi" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete reply error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası" } },
      { status: 500 }
    );
  }
}
