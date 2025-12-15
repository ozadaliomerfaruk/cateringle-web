// src/app/api/quotes/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// Validation Schemas
// ============================================

const sendQuoteSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz talep ID"),
  totalPrice: z.number().min(1, "Fiyat girilmeli"),
  pricePerPerson: z.number().optional(),
  message: z.string().max(1000).optional(),
  validUntil: z.string().datetime().optional(),
});

// ============================================
// POST: Send Quote (Vendor only)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth check
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

    const validation = sendQuoteSchema.safeParse(body);
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

    const { vendorLeadId, totalPrice, pricePerPerson, message, validUntil } =
      validation.data;

    // 4. Verify vendor owns this lead
    const { data: vendorLead, error: vlError } = await supabase
      .from("vendor_leads")
      .select(
        `
        id,
        vendor_id,
        lead_id,
        vendor:vendors!inner (
          id,
          owner_id
        )
      `
      )
      .eq("id", vendorLeadId)
      .single();

    if (vlError || !vendorLead) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Talep bulunamadı" },
        },
        { status: 404 }
      );
    }

    const vendor = vendorLead.vendor as { id: string; owner_id: string };
    if (vendor.owner_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu talebe erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // 5. Insert quote (trigger will create message automatically)
    const { data: quote, error: insertError } = await supabase
      .from("quotes")
      .insert({
        vendor_lead_id: vendorLeadId,
        total_price: totalPrice,
        price_per_person: pricePerPerson || null,
        message: message || null,
        valid_until: validUntil || null,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Quote insert error:", insertError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Teklif gönderilemedi" },
        },
        { status: 500 }
      );
    }

    // 6. Update vendor_lead status
    await supabase
      .from("vendor_leads")
      .update({ status: "quoted" })
      .eq("id", vendorLeadId);

    return NextResponse.json({
      ok: true,
      data: { quoteId: quote.id },
    });
  } catch (error) {
    console.error("[API /quotes POST Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
