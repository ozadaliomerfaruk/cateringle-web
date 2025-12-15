// src/app/api/quotes/[quoteId]/status/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";
import {
  sendQuoteAcceptedEmail,
  sendQuoteRejectedEmail,
} from "@/lib/email-notifications";

// ============================================
// Validation Schema
// ============================================

const updateStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"], {
    message: "Geçersiz durum",
  }),
});

// ============================================
// PATCH: Update Quote Status (Customer only)
// ============================================

export async function PATCH(
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

    const validation = updateStatusSchema.safeParse(body);
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

    const { status } = validation.data;

    // 4. Get quote and verify customer ownership
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(
        `
        id,
        status,
        total_price,
        vendor_lead:vendor_leads!inner (
          id,
          vendor:vendors!inner (
            id,
            owner_id,
            business_name
          ),
          lead:leads!inner (
            id,
            customer_profile_id,
            customer_name,
            customer_email,
            customer_phone,
            event_date,
            guest_count
          )
        )
      `
      )
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Teklif bulunamadı" },
        },
        { status: 404 }
      );
    }

    const vendorLead = quote.vendor_lead as {
      id: string;
      vendor: {
        id: string;
        owner_id: string;
        business_name: string;
      };
      lead: {
        id: string;
        customer_profile_id: string | null;
        customer_name: string;
        customer_email: string;
        customer_phone: string | null;
        event_date: string | null;
        guest_count: number | null;
      };
    };

    // Verify customer ownership
    if (vendorLead.lead.customer_profile_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu teklife erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // 5. Check if quote can be updated
    if (!["sent", "viewed"].includes(quote.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_STATUS",
            message: "Bu teklif artık güncellenemez",
          },
        },
        { status: 400 }
      );
    }

    // 6. Update quote status (trigger will create message automatically)
    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        status,
        ...(status === "accepted"
          ? { accepted_at: new Date().toISOString() }
          : {}),
        ...(status === "rejected"
          ? { rejected_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", quoteId);

    if (updateError) {
      console.error("Quote status update error:", updateError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Teklif güncellenemedi" },
        },
        { status: 500 }
      );
    }

    // 7. Update vendor_lead status if accepted
    if (status === "accepted") {
      await supabase
        .from("vendor_leads")
        .update({ status: "won" })
        .eq("id", vendorLead.id);
    }

    // 8. Send email notification to vendor (async, don't block)
    if (status === "accepted") {
      sendQuoteAcceptedEmail({
        vendorOwnerId: vendorLead.vendor.owner_id,
        vendorName: vendorLead.vendor.business_name,
        customerName: vendorLead.lead.customer_name,
        customerEmail: vendorLead.lead.customer_email,
        customerPhone: vendorLead.lead.customer_phone,
        quoteId,
        totalPrice: quote.total_price,
        eventDate: vendorLead.lead.event_date,
        guestCount: vendorLead.lead.guest_count,
        customerNote: null, // Could be added from request body
        vendorLeadId: vendorLead.id,
      }).catch((err) => console.error("Quote accepted email error:", err));
    } else if (status === "rejected") {
      sendQuoteRejectedEmail({
        vendorOwnerId: vendorLead.vendor.owner_id,
        vendorName: vendorLead.vendor.business_name,
        customerName: vendorLead.lead.customer_name,
        quoteId,
        totalPrice: quote.total_price,
        customerNote: null, // Could be added from request body
      }).catch((err) => console.error("Quote rejected email error:", err));
    }

    return NextResponse.json({
      ok: true,
      data: { status },
    });
  } catch (error) {
    console.error("[API /quotes/[quoteId]/status PATCH Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
