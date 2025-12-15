// src/app/api/quotes/[quoteId]/counter-offer/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// Validation Schema
// ============================================

const counterOfferSchema = z.object({
  totalPrice: z.number().min(1, "Fiyat girilmeli"),
  pricePerPerson: z.number().optional(),
  note: z.string().max(500, "Not en fazla 500 karakter olabilir").optional(),
});

// ============================================
// POST: Create Counter Offer
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
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

    const validation = counterOfferSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: firstError.message },
        },
        { status: 400 }
      );
    }

    const { totalPrice, pricePerPerson, note } = validation.data;

    // 4. Get original quote and verify access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: originalQuote, error: quoteError } = await (supabase as any)
      .from("quotes")
      .select(
        `
        id,
        vendor_lead_id,
        total_price,
        status,
        valid_until,
        vendor_lead:vendor_leads!inner (
          id,
          vendor_id,
          lead:leads!inner (
            id,
            customer_profile_id
          ),
          vendor:vendors!inner (
            id,
            owner_id,
            business_name
          )
        )
      `
      )
      .eq("id", quoteId)
      .single();

    if (quoteError || !originalQuote) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Teklif bulunamadı" },
        },
        { status: 404 }
      );
    }

    // Type assertions
    const vendorLead = originalQuote.vendor_lead as {
      id: string;
      vendor_id: string;
      lead: { id: string; customer_profile_id: string };
      vendor: { id: string; owner_id: string; business_name: string };
    };

    const isCustomer = vendorLead.lead.customer_profile_id === user.id;
    const isVendor = vendorLead.vendor.owner_id === user.id;

    if (!isCustomer && !isVendor) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu teklife erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // 5. Check if quote is in valid state for counter-offer
    const validStatuses = ["sent", "viewed", "counter_offered"];
    if (!validStatuses.includes(originalQuote.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_STATE",
            message: "Bu teklif için karşı teklif verilemez",
          },
        },
        { status: 400 }
      );
    }

    // 6. Check if quote is expired
    if (
      originalQuote.valid_until &&
      new Date(originalQuote.valid_until) < new Date()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "EXPIRED",
            message: "Bu teklifin süresi dolmuş",
          },
        },
        { status: 400 }
      );
    }

    // 7. Create counter-offer quote
    const counterOfferBy = isCustomer ? "customer" : "vendor";

    const { data: counterOffer, error: insertError } = await supabase
      .from("quotes")
      .insert({
        vendor_lead_id: originalQuote.vendor_lead_id,
        parent_quote_id: quoteId,
        is_counter_offer: true,
        counter_offer_by: counterOfferBy,
        counter_offer_note: note || null,
        total_price: totalPrice,
        price_per_person: pricePerPerson || null,
        status: "sent",
        sent_at: new Date().toISOString(),
        valid_until: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 gün geçerli
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Counter offer insert error:", insertError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Karşı teklif gönderilemedi" },
        },
        { status: 500 }
      );
    }

    // 8. Update original quote status
    await supabase
      .from("quotes")
      .update({ status: "counter_offered" as never })
      .eq("id", quoteId);

    // 9. Create message for counter-offer
    const messageContent =
      counterOfferBy === "customer"
        ? `Karşı teklif gönderildi: ₺${totalPrice.toLocaleString("tr-TR")}${note ? ` - ${note}` : ""}`
        : `Yeni teklif gönderildi: ₺${totalPrice.toLocaleString("tr-TR")}${note ? ` - ${note}` : ""}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("messages").insert({
      vendor_lead_id: originalQuote.vendor_lead_id,
      sender_id: user.id,
      sender_type: isCustomer ? "customer" : "vendor",
      content: messageContent,
      message_type: "quote",
      quote_id: counterOffer.id,
    });

    return NextResponse.json({
      ok: true,
      data: {
        counterOfferId: counterOffer.id,
        message: "Karşı teklif gönderildi",
      },
    });
  } catch (error) {
    console.error("[API /quotes/[id]/counter-offer POST Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
