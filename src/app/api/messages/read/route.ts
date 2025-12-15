// src/app/api/messages/read/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";
import { canUserAccessConversation } from "@/lib/messages";

// ============================================
// Validation Schema
// ============================================

const markReadSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
});

// ============================================
// POST: Mark Messages as Read
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth check (REQUIRED)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Giriş yapmalısınız" },
        },
        { status: 401 }
      );
    }

    // 2. Rate limit
    const { success: rateLimitOk } = await rateLimit(
      user.id,
      rateLimitPresets.apiGeneral
    );

    if (!rateLimitOk) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "RATE_LIMITED", message: "Çok fazla istek" },
        },
        { status: 429 }
      );
    }

    // 3. Parse & validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVALID_JSON", message: "Geçersiz JSON formatı" },
        },
        { status: 400 }
      );
    }

    const validation = markReadSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError.message,
          },
        },
        { status: 400 }
      );
    }

    const { vendorLeadId } = validation.data;

    // 4. Check access
    const canAccess = await canUserAccessConversation(user.id, vendorLeadId);
    if (!canAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu görüşmeye erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // 5. Call RPC to mark messages as read
    const { data, error } = await supabase.rpc("mark_messages_read", {
      p_vendor_lead_id: vendorLeadId,
    });

    if (error) {
      console.error("mark_messages_read RPC error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "İşlem başarısız" },
        },
        { status: 500 }
      );
    }

    const result = data as {
      ok: boolean;
      data?: { marked_count: number };
      error?: { code: string; message: string };
    };

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    console.error("[API /messages/read POST Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
