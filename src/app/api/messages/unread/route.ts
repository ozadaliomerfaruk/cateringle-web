// src/app/api/messages/unread/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// GET: Get Unread Message Count
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

    // 2. Rate limit (more lenient for badge polling)
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

    // 3. Call RPC to get unread count
    const { data, error } = await supabase.rpc("get_unread_message_count");

    if (error) {
      console.error("get_unread_message_count RPC error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Sayı alınamadı" },
        },
        { status: 500 }
      );
    }

    const result = data as {
      ok: boolean;
      data?: { unread_count: number };
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
    console.error("[API /messages/unread GET Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
