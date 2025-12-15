// src/app/api/vendor/quote-templates/[templateId]/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";

// ============================================
// Validation Schema
// ============================================

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
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
// GET: Get Single Template
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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

    // Get template with vendor check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: template, error } = await (supabase as any)
      .from("quote_templates")
      .select(
        `
        *,
        vendor:vendors!inner (
          owner_id
        )
      `
      )
      .eq("id", templateId)
      .single();

    if (error || !template) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Şablon bulunamadı" },
        },
        { status: 404 }
      );
    }

    const vendor = template.vendor as { owner_id: string };
    if (vendor.owner_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu şablona erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // Remove vendor relation from response
    const { vendor: _vendor, ...templateData } = template;

    return NextResponse.json({
      ok: true,
      data: templateData,
    });
  } catch (error) {
    console.error("[API /vendor/quote-templates/[id] GET Error]", error);
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
// PATCH: Update Template
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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

    // Get template with vendor check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from("quote_templates")
      .select(
        `
        id,
        vendor_id,
        vendor:vendors!inner (
          owner_id
        )
      `
      )
      .eq("id", templateId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Şablon bulunamadı" },
        },
        { status: 404 }
      );
    }

    const vendor = existing.vendor as { owner_id: string };
    if (vendor.owner_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu şablona erişiminiz yok" },
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

    const validation = updateTemplateSchema.safeParse(body);
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
        .eq("vendor_id", existing.vendor_id)
        .neq("id", templateId);
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.isDefault !== undefined) updateData.is_default = data.isDefault;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.inclusions !== undefined) updateData.inclusions = data.inclusions;
    if (data.exclusions !== undefined) updateData.exclusions = data.exclusions;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.defaultPricePerPerson !== undefined)
      updateData.default_price_per_person = data.defaultPricePerPerson;
    if (data.depositPercentage !== undefined)
      updateData.deposit_percentage = data.depositPercentage;
    if (data.validDays !== undefined) updateData.valid_days = data.validDays;

    // Update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("quote_templates")
      .update(updateData)
      .eq("id", templateId);

    if (updateError) {
      console.error("Template update error:", updateError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Şablon güncellenemedi" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { message: "Şablon güncellendi" },
    });
  } catch (error) {
    console.error("[API /vendor/quote-templates/[id] PATCH Error]", error);
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
// DELETE: Delete Template
// ============================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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

    // Get template with vendor check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from("quote_templates")
      .select(
        `
        id,
        vendor:vendors!inner (
          owner_id
        )
      `
      )
      .eq("id", templateId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Şablon bulunamadı" },
        },
        { status: 404 }
      );
    }

    const vendor = existing.vendor as { owner_id: string };
    if (vendor.owner_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Bu şablona erişiminiz yok" },
        },
        { status: 403 }
      );
    }

    // Delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from("quote_templates")
      .delete()
      .eq("id", templateId);

    if (deleteError) {
      console.error("Template delete error:", deleteError);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "SERVER_ERROR", message: "Şablon silinemedi" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { message: "Şablon silindi" },
    });
  } catch (error) {
    console.error("[API /vendor/quote-templates/[id] DELETE Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}
