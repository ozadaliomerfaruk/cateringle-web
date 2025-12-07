import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendNewLeadNotification, sendLeadConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      customerName,
      customerEmail,
      customerPhone,
      segmentId,
      eventType,
      eventDate,
      guestCount,
      budgetMin,
      budgetMax,
      serviceStyle,
      needsServiceStaff,
      needsCleanup,
      needsTablesChairs,
      wantsRealTableware,
      wantsDisposableTableware,
      // Yeni alanlar
      cuisinePreference,
      deliveryModel,
      dietaryRequirements,
      notes,
    } = body;

    // Kullanıcı oturum kontrolü
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1) Lead oluştur
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert({
        customer_profile_id: user?.id || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        segment_id: segmentId || null,
        event_type: eventType || null,
        event_date: eventDate || null,
        guest_count: guestCount ? parseInt(guestCount, 10) : null,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        service_style: serviceStyle || null,
        needs_service_staff: needsServiceStaff || false,
        needs_cleanup: needsCleanup || false,
        needs_tables_chairs: needsTablesChairs || false,
        wants_real_tableware: wantsRealTableware || false,
        wants_disposable_tableware: wantsDisposableTableware || false,
        // Yeni alanlar
        cuisine_preference: cuisinePreference || null,
        delivery_model: deliveryModel || null,
        dietary_requirements: dietaryRequirements || null,
        notes: notes || null,
        source: "vendor_page_form",
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error("Lead oluşturulamadı:", leadError);
      return NextResponse.json(
        { error: leadError?.message || "Lead oluşturulamadı" },
        { status: 500 }
      );
    }

    // 2) Vendor-lead bağlantısı
    const { error: vendorLeadError } = await supabaseAdmin
      .from("vendor_leads")
      .insert({
        lead_id: lead.id,
        vendor_id: vendorId,
        status: "sent",
      });

    if (vendorLeadError) {
      console.error("Vendor lead bağlantısı kurulamadı:", vendorLeadError);
      return NextResponse.json(
        { error: vendorLeadError.message },
        { status: 500 }
      );
    }

    // 3) Vendor bilgilerini çek
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("business_name, email")
      .eq("id", vendorId)
      .single();

    console.log("Vendor bilgisi:", {
      vendorId,
      vendorEmail: vendor?.email,
      vendorName: vendor?.business_name,
    });

    // 4) Segment bilgisini çek (e-posta için)
    let segmentName = "";
    if (segmentId) {
      const { data: segment } = await supabaseAdmin
        .from("customer_segments")
        .select("name")
        .eq("id", segmentId)
        .single();
      segmentName = segment?.name || "";
    }

    // 5) E-posta bildirimleri gönder
    if (vendor?.email) {
      console.log("Vendor'a email gönderiliyor:", vendor.email);
      try {
        const vendorEmailResult = await sendNewLeadNotification({
          vendorEmail: vendor.email,
          vendorName: vendor.business_name,
          customerName,
          customerEmail,
          customerPhone,
          eventDate,
          guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
          message: notes,
          segmentName,
          eventType,
        });
        console.log("Vendor email sonucu:", vendorEmailResult);
      } catch (err) {
        console.error("Vendor email error:", err);
      }
    } else {
      console.log("Vendor email adresi bulunamadı, mail gönderilmedi");
    }

    // Müşteriye onay e-postası
    console.log("Müşteriye email gönderiliyor:", customerEmail);
    try {
      const customerEmailResult = await sendLeadConfirmation({
        customerEmail,
        customerName,
        vendorName: vendor?.business_name || "Firma",
      });
      console.log("Customer email sonucu:", customerEmailResult);
    } catch (err) {
      console.error("Customer email error:", err);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    );
  }
}
