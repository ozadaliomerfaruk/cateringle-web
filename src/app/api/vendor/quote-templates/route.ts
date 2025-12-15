// src/app/api/vendor/quote-templates/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// Validation Schemas
// ============================================

const templateSchema = z.object({
  name: z.string().min(1, "Şablon adı gerekli").max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  title: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  inclusions: z.string().max(2000).optional(),
  exclusions: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  defaultPricePerPerson: z.number().min(0).optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  validDays: z.number().min(1).max(90).optional(),
});

// ============================================
// GET: List Templates
// ============================================

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

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

    // Get vendor
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!vendor) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_VENDOR", message: "Vendor hesabınız yok" },
        },
        { status: 403 }
      );
    }

    // Get templates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: templates, error } = await (supabase as any)
      .from("quote_templates")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("is_default", { ascending: false })
      .order("usage_count", { ascending: false });

    if (error) {
      console.error("Templates fetch error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Şablonlar yüklenemedi" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: templates,
    });
  } catch (error) {
    console.error("[API /vendor/quote-templates GET Error]", error);
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
// POST: Create Template
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

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

    // Rate limit
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

    // Get vendor
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!vendor) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_VENDOR", message: "Vendor hesabınız yok" },
        },
        { status: 403 }
      );
    }

    // Parse body
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

    const validation = templateSchema.safeParse(body);
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

    const data = validation.data;

    // If setting as default, unset other defaults
    if (data.isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("quote_templates")
        .update({ is_default: false })
        .eq("vendor_id", vendor.id);
    }

    // Create template
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: template, error: insertError } = await (supabase as any)
      .from("quote_templates")
      .insert({
        vendor_id: vendor.id,
        name: data.name,
        description: data.description || null,
        is_default: data.isDefault || false,
        title: data.title || null,
        message: data.message || null,
        inclusions: data.inclusions || null,
        exclusions: data.exclusions || null,
        terms: data.terms || null,
        default_price_per_person: data.defaultPricePerPerson || null,
        deposit_percentage: data.depositPercentage || null,
        valid_days: data.validDays || 7,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Template insert error:", insertError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Şablon oluşturulamadı" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { templateId: template.id },
    });
  } catch (error) {
    console.error("[API /vendor/quote-templates POST Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
