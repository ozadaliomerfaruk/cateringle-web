// src/app/api/messages/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";
import {
  sendMessageWithNotification,
  canUserAccessConversation,
} from "@/lib/messages";

// ============================================
// Validation Schemas
// ============================================

const sendMessageSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
  content: z
    .string()
    .min(1, "Mesaj boş olamaz")
    .max(2000, "Mesaj çok uzun (max 2000 karakter)"),
});

const getMessagesSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// ============================================
// POST: Send Message
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

    // 2. Rate limit (by user ID)
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

    const validation = sendMessageSchema.safeParse(body);
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

    const { vendorLeadId, content } = validation.data;

    // 4. Send message (access validation happens inside)
    const result = await sendMessageWithNotification(
      vendorLeadId,
      content,
      user.id
    );

    if (!result.ok) {
      const statusCode =
        result.error?.code === "FORBIDDEN"
          ? 403
          : result.error?.code === "NOT_FOUND"
            ? 404
            : 400;

      return NextResponse.json({ ok: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (error) {
    console.error("[API /messages POST Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET: Get Messages for a Conversation
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
      vendorLeadId: searchParams.get("vendorLeadId"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const validation = getMessagesSchema.safeParse(params);
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

    const { vendorLeadId, limit, offset } = validation.data;

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

    // 5. Call RPC to get messages (using user's client for RLS)
    const { data, error } = await supabase.rpc("get_vendor_lead_messages", {
      p_vendor_lead_id: vendorLeadId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("get_vendor_lead_messages RPC error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Mesajlar yüklenemedi" },
        },
        { status: 500 }
      );
    }

    // RPC returns JSON with ok/data structure
    const result = data as {
      ok: boolean;
      data?: {
        messages: unknown[];
        total_count: number;
        unread_count: number;
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
    console.error("[API /messages GET Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
