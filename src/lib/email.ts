import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Cateringle <onboarding@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    console.log("Email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email exception:", error);
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
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .segment-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; }
        .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; margin-top: 4px; color: #1e293b; }
        .highlight-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin: 16px 0; }
        .highlight-box .label { color: #047857; }
        .highlight-box .value { color: #065f46; font-weight: 600; }
        .cta { display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">Yeni Teklif Talebi</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Cateringle.com üzerinden yeni bir talep aldınız</p>
          ${
            segmentName
              ? `<span class="segment-badge">${
                  segmentName === "Kurumsal" ? "🏢" : "🎉"
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
                segmentName === "Kurumsal" ? "🏢" : "🎉"
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
            <div class="value"><a href="mailto:${customerEmail}" style="color: #059669;">${customerEmail}</a></div>
          </div>
          
          ${
            customerPhone
              ? `
          <div class="info-row">
            <div class="label">Telefon</div>
            <div class="value"><a href="tel:${customerPhone}" style="color: #059669;">${customerPhone}</a></div>
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
          
          <a href="https://cateringle.com/vendor" class="cta">Panele Git ve Yanıtla</a>
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
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; }
        .cta { display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; font-weight: 500; }
        .secondary-link { color: #059669; text-decoration: none; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px;">Talebiniz Alındı!</h1>
        </div>
        
        <div class="content">
          <p>Merhaba <strong>${customerName}</strong>,</p>
          <p><strong>${vendorName}</strong> firmasına gönderdiğiniz teklif talebi başarıyla iletildi.</p>
          <p>Firma en kısa sürede sizinle iletişime geçecektir. Genellikle 24 saat içinde dönüş yapılmaktadır.</p>
          
          <a href="https://cateringle.com/account" class="cta">Tekliflerimi Görüntüle</a>
          
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
