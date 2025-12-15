import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendNewLeadNotification, sendLeadConfirmation } from "@/lib/email";
import { createLeadSchema, sanitizeInput } from "@/lib/validations/lead";
import { notifyNewLead } from "@/lib/notifications";
import { ZodError } from "zod";

// Rate limit için basit in-memory store (production'da Redis kullanılmalı)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX = 5; // Dakikada max 5 istek

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1) Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin." },
        { status: 429 }
      );
    }

    // 2) Body Parse
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Geçersiz JSON formatı" },
        { status: 400 }
      );
    }

    // 3) Zod Validation
    const validationResult = createLeadSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { error: "Doğrulama hatası", details: errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 4) Idempotency Check
    if (data.idempotencyKey) {
      const { data: existingKey } = await supabaseAdmin
        .from("idempotency_keys")
        .select("entity_id")
        .eq("key", data.idempotencyKey)
        .eq("scope", "lead")
        .maybeSingle();

      if (existingKey) {
        // Zaten işlenmiş, mevcut lead ID'yi dön
        return NextResponse.json({
          success: true,
          leadId: existingKey.entity_id,
          duplicate: true,
        });
      }
    }

    // 5) Sanitize text inputs
    const sanitizedData = {
      customerName: sanitizeInput(data.customerName),
      customerEmail: data.customerEmail, // Email zaten validated
      customerPhone: data.customerPhone,
      notes: data.notes ? sanitizeInput(data.notes) : null,
      cuisinePreference: data.cuisinePreference
        ? sanitizeInput(data.cuisinePreference)
        : null,
    };

    // 6) Kullanıcı oturum kontrolü
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 7) Vendor'ın varlığını ve aktifliğini kontrol et
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, business_name, email, status, owner_id")
      .eq("id", data.vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }

    if (vendor.status !== "approved") {
      return NextResponse.json(
        { error: "Bu firma şu anda aktif değil" },
        { status: 400 }
      );
    }

    // 8) RPC ile Transaction içinde Lead + VendorLead oluştur
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
      "create_lead_with_vendor",
      {
        p_vendor_id: data.vendorId,
        p_customer_profile_id: user?.id || null,
        p_customer_name: sanitizedData.customerName,
        p_customer_email: sanitizedData.customerEmail,
        p_customer_phone: sanitizedData.customerPhone || null,
        p_segment_id: data.segmentId || null,
        p_event_type: data.eventType || null,
        p_event_date: data.eventDate || null,
        p_guest_count: data.guestCount || null,
        p_budget_min: data.budgetMin || null,
        p_budget_max: data.budgetMax || null,
        p_service_style: data.serviceStyle || null,
        p_needs_service_staff: data.needsServiceStaff,
        p_needs_cleanup: data.needsCleanup,
        p_needs_tables_chairs: data.needsTablesChairs,
        p_wants_real_tableware: data.wantsRealTableware,
        p_wants_disposable_tableware: data.wantsDisposableTableware,
        p_cuisine_preference: sanitizedData.cuisinePreference,
        p_delivery_model: data.deliveryModel || null,
        p_dietary_requirements: data.dietaryRequirements || null,
        p_notes: sanitizedData.notes,
        p_idempotency_key: data.idempotencyKey || null,
      }
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        { error: "Lead oluşturulurken bir hata oluştu" },
        { status: 500 }
      );
    }

    const leadId = result;

    // 9) Segment bilgisini çek (e-posta için)
    let segmentName = "";
    if (data.segmentId) {
      const { data: segment } = await supabaseAdmin
        .from("customer_segments")
        .select("name")
        .eq("id", data.segmentId)
        .single();
      segmentName = segment?.name || "";
    }

    // 10) E-posta bildirimleri gönder (async, response'u bekleme)
    if (vendor.email) {
      sendNewLeadNotification({
        vendorEmail: vendor.email,
        vendorName: vendor.business_name,
        customerName: sanitizedData.customerName,
        customerEmail: sanitizedData.customerEmail,
        customerPhone: sanitizedData.customerPhone || undefined,
        eventDate: data.eventDate || undefined,
        guestCount: data.guestCount || undefined,
        message: sanitizedData.notes || undefined,
        segmentName,
        eventType: data.eventType || undefined,
      }).catch((err) => console.error("Vendor email error:", err));
    }

    sendLeadConfirmation({
      customerEmail: sanitizedData.customerEmail,
      customerName: sanitizedData.customerName,
      vendorName: vendor.business_name,
    }).catch((err) => console.error("Customer email error:", err));

    // 11) In-app bildirim gönder (vendor sahibine)
    if (vendor.owner_id) {
      notifyNewLead(vendor.owner_id, leadId, sanitizedData.customerName).catch(
        (err) => console.error("In-app notification error:", err)
      );
    }

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error("Lead API error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    );
  }
}
