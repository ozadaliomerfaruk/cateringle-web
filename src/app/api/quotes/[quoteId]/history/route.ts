// src/app/api/quotes/[quoteId]/history/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ============================================
// GET: Get Quote History
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const supabase = await createServerSupabaseClient();

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Giriş yapmalısınız" },
        },
        { status: 401 }
      );
    }

    // 2. Get quote and verify access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quote, error: quoteError } = await (supabase as any)
      .from("quotes")
      .select(
        `
        id,
        vendor_lead:vendor_leads!inner (
          lead:leads!inner (
            customer_profile_id
          ),
          vendor:vendors!inner (
            owner_id
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

    // Type assertions
    const vendorLead = quote.vendor_lead as {
      lead: { customer_profile_id: string };
      vendor: { owner_id: string };
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

    // 3. Get history using RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: history, error: historyError } = await (supabase.rpc as any)(
      "get_quote_with_history",
      { p_quote_id: quoteId }
    );

    if (historyError) {
      console.error("Quote history fetch error:", historyError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Geçmiş yüklenemedi" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: history,
    });
  } catch (error) {
    console.error("[API /quotes/[id]/history GET Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
