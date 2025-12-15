// src/app/api/quotes/[quoteId]/pdf/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ============================================
// GET: Generate Quote PDF
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

    // 2. Get quote with all details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quote, error: quoteError } = await (supabase as any)
      .from("quotes")
      .select(
        `
        *,
        vendor_lead:vendor_leads!inner (
          id,
          lead:leads!inner (
            id,
            customer_profile_id,
            customer_name,
            customer_email,
            customer_phone,
            event_type,
            event_date,
            guest_count,
            service_style,
            budget_min,
            budget_max,
            city:cities(name),
            district:districts(name)
          ),
          vendor:vendors!inner (
            id,
            owner_id,
            business_name,
            phone,
            email,
            city:cities(name),
            district:districts(name)
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
      id: string;
      lead: {
        id: string;
        customer_profile_id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        event_type: string;
        event_date: string;
        guest_count: number;
        service_style: string;
        budget_min: number;
        budget_max: number;
        city: { name: string } | null;
        district: { name: string } | null;
      };
      vendor: {
        id: string;
        owner_id: string;
        business_name: string;
        phone: string;
        email: string;
        city: { name: string } | null;
        district: { name: string } | null;
      };
    };

    // 3. Check access
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

    // 4. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    // Fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(0.086, 0.639, 0.29); // #16a34a
    const textColor = rgb(0.15, 0.15, 0.15);
    const grayColor = rgb(0.4, 0.4, 0.4);

    let y = height - 50;

    // Header
    page.drawText("TEKLİF", {
      x: 50,
      y,
      size: 28,
      font: helveticaBold,
      color: primaryColor,
    });

    y -= 30;
    page.drawText(`Teklif No: ${quoteId.slice(0, 8).toUpperCase()}`, {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: grayColor,
    });

    // Date
    const createdDate = new Date(quote.created_at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    page.drawText(`Tarih: ${createdDate}`, {
      x: width - 150,
      y: height - 50,
      size: 10,
      font: helvetica,
      color: grayColor,
    });

    // Valid until
    if (quote.valid_until) {
      const validDate = new Date(quote.valid_until).toLocaleDateString("tr-TR");
      page.drawText(`Geçerlilik: ${validDate}`, {
        x: width - 150,
        y: height - 65,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
    }

    // Divider
    y -= 30;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Vendor Info
    y -= 30;
    page.drawText("Firma Bilgileri", {
      x: 50,
      y,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });

    y -= 20;
    page.drawText(vendorLead.vendor.business_name, {
      x: 50,
      y,
      size: 11,
      font: helvetica,
      color: textColor,
    });

    y -= 15;
    if (vendorLead.vendor.city?.name) {
      const location = vendorLead.vendor.district?.name
        ? `${vendorLead.vendor.district.name}, ${vendorLead.vendor.city.name}`
        : vendorLead.vendor.city.name;
      page.drawText(location, {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
      y -= 15;
    }

    if (vendorLead.vendor.phone) {
      page.drawText(`Tel: ${vendorLead.vendor.phone}`, {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
      y -= 15;
    }

    if (vendorLead.vendor.email) {
      page.drawText(`Email: ${vendorLead.vendor.email}`, {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
    }

    // Customer Info (right side)
    let rightY = height - 140;
    page.drawText("Müşteri Bilgileri", {
      x: width / 2 + 20,
      y: rightY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });

    rightY -= 20;
    page.drawText(vendorLead.lead.customer_name, {
      x: width / 2 + 20,
      y: rightY,
      size: 11,
      font: helvetica,
      color: textColor,
    });

    rightY -= 15;
    if (vendorLead.lead.customer_email) {
      page.drawText(vendorLead.lead.customer_email, {
        x: width / 2 + 20,
        y: rightY,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
      rightY -= 15;
    }

    if (vendorLead.lead.customer_phone) {
      page.drawText(vendorLead.lead.customer_phone, {
        x: width / 2 + 20,
        y: rightY,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
    }

    // Event Details
    y -= 50;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 25;
    page.drawText("Etkinlik Detayları", {
      x: 50,
      y,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });

    y -= 25;
    const eventDetails = [
      ["Etkinlik Tipi", vendorLead.lead.event_type || "-"],
      [
        "Tarih",
        vendorLead.lead.event_date
          ? new Date(vendorLead.lead.event_date).toLocaleDateString("tr-TR")
          : "-",
      ],
      ["Kişi Sayısı", vendorLead.lead.guest_count?.toString() || "-"],
      ["Servis Stili", vendorLead.lead.service_style || "-"],
    ];

    for (const [label, value] of eventDetails) {
      page.drawText(`${label}:`, {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: grayColor,
      });
      page.drawText(value, {
        x: 150,
        y,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      y -= 18;
    }

    // Quote Details
    y -= 20;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 25;
    page.drawText("Teklif Detayları", {
      x: 50,
      y,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });

    // Message
    if (quote.message) {
      y -= 25;
      page.drawText("Mesaj:", {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: grayColor,
      });
      y -= 18;

      // Word wrap for message
      const maxWidth = width - 100;
      const words = quote.message.split(" ");
      let line = "";

      for (const word of words) {
        const testLine = line + word + " ";
        const testWidth = helvetica.widthOfTextAtSize(testLine, 10);

        if (testWidth > maxWidth && line !== "") {
          page.drawText(line.trim(), {
            x: 50,
            y,
            size: 10,
            font: helvetica,
            color: textColor,
          });
          line = word + " ";
          y -= 15;
        } else {
          line = testLine;
        }
      }

      if (line.trim()) {
        page.drawText(line.trim(), {
          x: 50,
          y,
          size: 10,
          font: helvetica,
          color: textColor,
        });
        y -= 15;
      }
    }

    // Inclusions
    if (quote.inclusions) {
      y -= 15;
      page.drawText("Dahil Olanlar:", {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: grayColor,
      });
      y -= 18;
      page.drawText(quote.inclusions.substring(0, 100), {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      y -= 15;
    }

    // Exclusions
    if (quote.exclusions) {
      y -= 10;
      page.drawText("Dahil Olmayanlar:", {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: grayColor,
      });
      y -= 18;
      page.drawText(quote.exclusions.substring(0, 100), {
        x: 50,
        y,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      y -= 15;
    }

    // Pricing Box
    y -= 30;
    const boxHeight = 80;
    const boxY = y - boxHeight;

    page.drawRectangle({
      x: 50,
      y: boxY,
      width: width - 100,
      height: boxHeight,
      color: rgb(0.97, 0.97, 0.97),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Price per person
    if (quote.price_per_person) {
      page.drawText("Kişi Başı Fiyat:", {
        x: 70,
        y: boxY + 55,
        size: 11,
        font: helvetica,
        color: grayColor,
      });
      page.drawText(`₺${quote.price_per_person.toLocaleString("tr-TR")}`, {
        x: 200,
        y: boxY + 55,
        size: 11,
        font: helveticaBold,
        color: textColor,
      });
    }

    // Total Price
    page.drawText("TOPLAM FİYAT:", {
      x: 70,
      y: boxY + 25,
      size: 14,
      font: helveticaBold,
      color: textColor,
    });
    page.drawText(`₺${quote.total_price.toLocaleString("tr-TR")}`, {
      x: 200,
      y: boxY + 25,
      size: 16,
      font: helveticaBold,
      color: primaryColor,
    });

    // Deposit
    if (quote.deposit_percentage) {
      const depositAmount =
        quote.deposit_amount ||
        (quote.total_price * quote.deposit_percentage) / 100;
      page.drawText(`Kapora (%${quote.deposit_percentage}):`, {
        x: width / 2,
        y: boxY + 55,
        size: 10,
        font: helvetica,
        color: grayColor,
      });
      page.drawText(`₺${depositAmount.toLocaleString("tr-TR")}`, {
        x: width / 2 + 100,
        y: boxY + 55,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
    }

    // Terms
    if (quote.terms) {
      y = boxY - 30;
      page.drawText("Şartlar ve Koşullar:", {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: grayColor,
      });
      y -= 15;
      page.drawText(quote.terms.substring(0, 200), {
        x: 50,
        y,
        size: 9,
        font: helvetica,
        color: grayColor,
      });
    }

    // Footer
    page.drawText("Bu teklif Cateringle.com üzerinden oluşturulmuştur.", {
      x: 50,
      y: 40,
      size: 8,
      font: helvetica,
      color: grayColor,
    });

    page.drawText("www.cateringle.com", {
      x: width - 120,
      y: 40,
      size: 8,
      font: helvetica,
      color: primaryColor,
    });

    // 5. Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // 6. Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="teklif-${quoteId.slice(
          0,
          8
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[API /quotes/[id]/pdf GET Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "PDF oluşturulamadı" },
      },
      { status: 500 }
    );
  }
}
