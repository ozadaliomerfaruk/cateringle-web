import nodemailer from "nodemailer";

// Google SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS kullan
  auth: {
    user: process.env.SMTP_USER, // info@cateringle.com
    pass: process.env.SMTP_PASS, // Google App Password
  },
});

const FROM_EMAIL = `Cateringle <${
  process.env.SMTP_USER || "info@cateringle.com"
}>`;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

// Etkinlik türü etiketleri
const eventTypeLabels: Record<string, string> = {
  "ofis-ogle": "Ofis Öğle Yemeği",
  toplanti: "Toplantı İkramı",
  kahvalti: "Ofis Kahvaltısı",
  etkinlik: "Kurumsal Etkinlik",
  konferans: "Konferans / Seminer",
  fuar: "Fuar / Organizasyon",
  dugun: "Düğün / Nişan",
  "dogum-gunu": "Doğum Günü",
  "ev-partisi": "Ev Partisi",
  "baby-shower": "Baby Shower / Mevlüt",
  mezuniyet: "Mezuniyet",
  yildonumu: "Yıldönümü / Özel Gün",
  piknik: "Piknik / Açık Hava",
};

// Vendor'a yeni teklif bildirimi
export async function sendNewLeadNotification({
  vendorEmail,
  vendorName,
  customerName,
  customerEmail,
  customerPhone,
  eventDate,
  guestCount,
  message,
  segmentName,
  eventType,
}: {
  vendorEmail: string;
  vendorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
  segmentName?: string;
  eventType?: string;
}) {
  const eventTypeLabel = eventType
    ? eventTypeLabels[eventType] || eventType
    : null;
  const subject = `Yeni Teklif Talebi - ${customerName}${
    segmentName ? ` (${segmentName})` : ""
  }`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .segment-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; }
        .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; margin-top: 4px; color: #1e293b; }
        .highlight-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin: 16px 0; }
        .highlight-box .label { color: #c2410c; }
        .highlight-box .value { color: #9a3412; font-weight: 600; }
        .cta { display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">🎉 Yeni Teklif Talebi</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Cateringle.com üzerinden yeni bir talep aldınız</p>
          ${
            segmentName
              ? `<span class="segment-badge">${
                  segmentName === "Kurumsal" ? "🏢" : "🎈"
                } ${segmentName}</span>`
              : ""
          }
        </div>
        
        <div class="content">
          <p>Merhaba <strong>${vendorName}</strong>,</p>
          <p>Firmanıza yeni bir teklif talebi geldi. Detaylar aşağıda:</p>
          
          ${
            segmentName || eventTypeLabel
              ? `
          <div class="highlight-box">
            ${
              segmentName
                ? `
            <div style="display: inline-block; margin-right: 20px;">
              <div class="label">Müşteri Tipi</div>
              <div class="value">${
                segmentName === "Kurumsal" ? "🏢" : "🎈"
              } ${segmentName}</div>
            </div>
            `
                : ""
            }
            ${
              eventTypeLabel
                ? `
            <div style="display: inline-block;">
              <div class="label">Etkinlik Türü</div>
              <div class="value">${eventTypeLabel}</div>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }
          
          <div class="info-row">
            <div class="label">Müşteri Adı</div>
            <div class="value">${customerName}</div>
          </div>
          
          <div class="info-row">
            <div class="label">E-posta</div>
            <div class="value"><a href="mailto:${customerEmail}" style="color: #FF6B35;">${customerEmail}</a></div>
          </div>
          
          ${
            customerPhone
              ? `
          <div class="info-row">
            <div class="label">Telefon</div>
            <div class="value"><a href="tel:${customerPhone}" style="color: #FF6B35;">${customerPhone}</a></div>
          </div>
          `
              : ""
          }
          
          ${
            eventDate
              ? `
          <div class="info-row">
            <div class="label">Etkinlik Tarihi</div>
            <div class="value">${new Date(eventDate).toLocaleDateString(
              "tr-TR",
              { day: "numeric", month: "long", year: "numeric" }
            )}</div>
          </div>
          `
              : ""
          }
          
          ${
            guestCount
              ? `
          <div class="info-row">
            <div class="label">Kişi Sayısı</div>
            <div class="value">${guestCount} kişi</div>
          </div>
          `
              : ""
          }
          
          ${
            message
              ? `
          <div class="info-row">
            <div class="label">Mesaj</div>
            <div class="value">${message}</div>
          </div>
          `
              : ""
          }
          
          <a href="https://cateringle.com/vendor/leads" class="cta">Panele Git ve Yanıtla →</a>
        </div>
        
        <div class="footer">
          <p>Bu e-posta Cateringle.com tarafından gönderilmiştir.</p>
          <p>© ${new Date().getFullYear()} Cateringle.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: vendorEmail, subject, html });
}

// Müşteriye onay e-postası
export async function sendLeadConfirmation({
  customerEmail,
  customerName,
  vendorName,
}: {
  customerEmail: string;
  customerName: string;
  vendorName: string;
}) {
  const subject = `Teklif Talebiniz Alındı - ${vendorName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; }
        .cta { display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; font-weight: 500; }
        .secondary-link { color: #FF6B35; text-decoration: none; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">✅ Talebiniz Alındı!</h1>
        </div>
        
        <div class="content">
          <p>Merhaba <strong>${customerName}</strong>,</p>
          <p><strong>${vendorName}</strong> firmasına gönderdiğiniz teklif talebi başarıyla iletildi.</p>
          <p>Firma en kısa sürede sizinle iletişime geçecektir. Genellikle 24 saat içinde dönüş yapılmaktadır.</p>
          
          <a href="https://cateringle.com/account/quotes" class="cta">Tekliflerimi Görüntüle →</a>
          
          <p style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <strong>Daha fazla teklif almak ister misiniz?</strong><br>
            <a href="https://cateringle.com/vendors" class="secondary-link">Diğer catering firmalarını keşfedin →</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Bu e-posta Cateringle.com tarafından gönderilmiştir.</p>
          <p>© ${new Date().getFullYear()} Cateringle.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: customerEmail, subject, html });
}

// Admin'e yeni tedarikçi başvurusu bildirimi
export async function sendNewVendorNotification({
  vendorName,
  ownerName,
  ownerEmail,
  phone,
  cityName,
  description,
  segments,
}: {
  vendorName: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  cityName?: string;
  description?: string;
  segments?: string[];
}) {
  const adminEmail =
    process.env.ADMIN_EMAIL || process.env.SMTP_USER || "info@cateringle.com";
  const subject = `🆕 Yeni Tedarikçi Başvurusu: ${vendorName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
        .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 15px; margin-top: 4px; color: #1e293b; }
        .segment-badge { display: inline-block; background: #f3e8ff; color: #7c3aed; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; margin-top: 4px; }
        .cta { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; }
        .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">🆕 Yeni Tedarikçi Başvurusu</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Cateringle.com'a yeni bir firma başvuru yaptı</p>
        </div>
        
        <div class="content">
          <div style="margin-bottom: 20px;">
            <span class="status-badge">⏳ Onay Bekliyor</span>
          </div>
          
          <div class="info-row">
            <div class="label">Firma Adı</div>
            <div class="value" style="font-size: 18px; font-weight: 600;">${vendorName}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Yetkili Kişi</div>
            <div class="value">${ownerName}</div>
          </div>
          
          <div class="info-row">
            <div class="label">E-posta</div>
            <div class="value"><a href="mailto:${ownerEmail}" style="color: #7c3aed;">${ownerEmail}</a></div>
          </div>
          
          ${
            phone
              ? `
          <div class="info-row">
            <div class="label">Telefon</div>
            <div class="value"><a href="tel:${phone}" style="color: #7c3aed;">${phone}</a></div>
          </div>
          `
              : ""
          }
          
          ${
            cityName
              ? `
          <div class="info-row">
            <div class="label">Şehir</div>
            <div class="value">${cityName}</div>
          </div>
          `
              : ""
          }
          
          ${
            segments && segments.length > 0
              ? `
          <div class="info-row">
            <div class="label">Hizmet Segmentleri</div>
            <div class="value">
              ${segments
                .map(
                  (s) =>
                    `<span class="segment-badge">${
                      s === "kurumsal" ? "🏢 Kurumsal" : "🎉 Bireysel"
                    }</span>`
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            description
              ? `
          <div class="info-row">
            <div class="label">Firma Açıklaması</div>
            <div class="value">${description}</div>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://cateringle.com/panel/users" class="cta">Admin Paneline Git →</a>
          </div>
          
          <p style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 14px; color: #92400e;">
            ⚠️ Bu başvuruyu inceleyip onaylamanız veya reddetmeniz gerekmektedir.
          </p>
        </div>
        
        <div class="footer">
          <p>Bu e-posta Cateringle.com tarafından otomatik olarak gönderilmiştir.</p>
          <p>© ${new Date().getFullYear()} Cateringle.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

// Müşteriye teklif yanıtı bildirimi
export async function sendQuoteNotification({
  customerEmail,
  customerName,
  vendorName,
  totalPrice,
  pricePerPerson,
  guestCount,
  message,
  validUntil,
  quoteId,
}: {
  customerEmail: string;
  customerName: string;
  vendorName: string;
  totalPrice: number;
  pricePerPerson?: number | null;
  guestCount?: number | null;
  message?: string | null;
  validUntil?: string | null;
  quoteId: string;
}) {
  const subject = `🎉 ${vendorName} size fiyat teklifi gönderdi!`;

  const formattedPrice = totalPrice.toLocaleString("tr-TR");
  const formattedPricePerPerson = pricePerPerson
    ? pricePerPerson.toLocaleString("tr-TR")
    : null;
  const formattedValidUntil = validUntil
    ? new Date(validUntil).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #f97316 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; }
        .price-box { background: white; border: 2px solid #FF6B35; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .price-main { font-size: 32px; font-weight: 700; color: #FF6B35; }
        .price-detail { font-size: 14px; color: #64748b; margin-top: 4px; }
        .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 15px; margin-top: 4px; color: #1e293b; }
        .cta { display: inline-block; background: #FF6B35; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; font-size: 16px; }
        .cta:hover { background: #ea580c; }
        .validity { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-top: 16px; text-align: center; }
        .validity-text { color: #92400e; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">🎉 Teklif Aldınız!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">${vendorName} firması talebinize yanıt verdi</p>
        </div>
        
        <div class="content">
          <p>Merhaba <strong>${customerName}</strong>,</p>
          <p>Harika haber! <strong>${vendorName}</strong> firması teklif talebinizi inceledi ve size özel bir fiyat teklifi hazırladı.</p>
          
          <div class="price-box">
            <div class="price-main">${formattedPrice} ₺</div>
            ${
              formattedPricePerPerson && guestCount
                ? `<div class="price-detail">${guestCount} kişi × ${formattedPricePerPerson} ₺/kişi</div>`
                : ""
            }
          </div>
          
          ${
            message
              ? `
          <div class="info-row">
            <div class="label">Firma Mesajı</div>
            <div class="value">${message}</div>
          </div>
          `
              : ""
          }
          
          ${
            formattedValidUntil
              ? `
          <div class="validity">
            <span class="validity-text">⏰ Bu teklif <strong>${formattedValidUntil}</strong> tarihine kadar geçerlidir</span>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center;">
            <a href="https://cateringle.com/account/quotes/${quoteId}" class="cta">Teklifi İncele ve Yanıtla →</a>
          </div>
          
          <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
            Teklifi beğendiyseniz kabul edebilir, sorularınız varsa firma ile doğrudan iletişime geçebilirsiniz.
          </p>
        </div>
        
        <div class="footer">
          <p>Bu e-posta Cateringle.com tarafından gönderilmiştir.</p>
          <p>© ${new Date().getFullYear()} Cateringle.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: customerEmail, subject, html });
}
