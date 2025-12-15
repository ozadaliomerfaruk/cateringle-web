// src/app/api/messages/conversations/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// Validation Schema
// ============================================

const getConversationsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

// ============================================
// GET: Get Conversations List (Inbox)
// ============================================

export async function GET(request: NextRequest) {
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

    // 3. Parse query params
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const validation = getConversationsSchema.safeParse(params);
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

    const { limit, offset } = validation.data;

    // 4. Call RPC to get conversations
    const { data, error } = await supabase.rpc("get_message_conversations", {
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("get_message_conversations RPC error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Görüşmeler yüklenemedi" },
        },
        { status: 500 }
      );
    }

    const result = data as {
      ok: boolean;
      data?: {
        conversations: unknown[];
        total_count: number;
        has_more: boolean;
      };
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
    console.error("[API /messages/conversations GET Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
