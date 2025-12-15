// src/lib/email-templates/vendor-approved.ts
import "server-only";
import {
  baseEmailTemplate,
  ctaButton,
  noteBox,
} from "./base";
import { escapeHtml } from "./helpers";
import { inlineStyles } from "./styles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cateringle.com";

interface VendorApprovedEmailParams {
  vendorName: string;
  ownerName: string;
  unsubscribeUrl?: string;
}

/**
 * Vendor onaylandı - Vendor owner'a gönderilir
 */
export function vendorApprovedEmailTemplate({
  vendorName,
  ownerName,
  unsubscribeUrl,
}: VendorApprovedEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeOwnerName = escapeHtml(ownerName);

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeOwnerName}</strong>,</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
      <h2 style="margin: 0; font-size: 24px; color: #166534;">Tebrikler!</h2>
      <p style="margin: 8px 0 0 0; font-size: 16px; color: #64748b;">
        <strong>${safeVendorName}</strong> başarıyla onaylandı
      </p>
    </div>
    
    <p>
      İşletmeniz <strong>Cateringle.com</strong>'da yayına alındı! 
      Artık müşterilerden talep almaya başlayabilirsiniz.
    </p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #166534;">📋 Sonraki Adımlar</h3>
      <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
        <li>Firma profilinizi tamamlayın (logo, açıklama, hizmetler)</li>
        <li>Menü ve fiyatlarınızı ekleyin</li>
        <li>Takvim ayarlarınızı yapın</li>
        <li>İlk talebinizi bekleyin!</li>
      </ul>
    </div>
    
    ${noteBox("💡 İpucu: Profiliniz ne kadar detaylı olursa, müşterilerin sizi bulması o kadar kolay olur.")}
    
    ${ctaButton("Panele Git ve Başla →", `${BASE_URL}/vendor`, "green")}
    
    <p style="margin-top: 24px; font-size: 14px; color: #64748b; text-align: center;">
      Sorularınız için bize her zaman ulaşabilirsiniz:<br>
      <a href="mailto:destek@cateringle.com" style="color: #22c55e;">destek@cateringle.com</a>
    </p>
  `;

  const html = baseEmailTemplate({
    headerStyle: "green",
    headerEmoji: "✅",
    headerTitle: "Hesabınız Onaylandı!",
    headerSubtitle: `${safeVendorName} artık Cateringle'da`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Sistem bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `🎉 Tebrikler! ${vendorName} onaylandı - Cateringle.com`,
    html,
  };
}

interface VendorRejectedEmailParams {
  vendorName: string;
  ownerName: string;
  rejectionReason?: string | null;
  unsubscribeUrl?: string;
}

/**
 * Vendor reddedildi - Vendor owner'a gönderilir
 */
export function vendorRejectedEmailTemplate({
  vendorName,
  ownerName,
  rejectionReason,
  unsubscribeUrl,
}: VendorRejectedEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeOwnerName = escapeHtml(ownerName);
  const safeReason = rejectionReason ? escapeHtml(rejectionReason) : null;

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeOwnerName}</strong>,</p>
    
    <p>
      <strong>${safeVendorName}</strong> için yaptığınız başvuru inceleme sonucunda 
      maalesef onaylanamamıştır.
    </p>
    
    ${
      safeReason
        ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div style="font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase; margin-bottom: 8px;">
        Red Nedeni
      </div>
      <p style="margin: 0; color: #b91c1c; font-size: 14px;">
        ${safeReason}
      </p>
    </div>
    `
        : ""
    }
    
    <p style="font-size: 14px; color: #64748b;">
      Eğer bu kararın hatalı olduğunu düşünüyorsanız veya eksik bilgilerinizi 
      tamamlamak istiyorsanız, bizimle iletişime geçebilirsiniz.
    </p>
    
    <p style="margin-top: 24px; font-size: 14px; color: #64748b; text-align: center;">
      İletişim için:<br>
      <a href="mailto:destek@cateringle.com" style="color: #FF6B35;">destek@cateringle.com</a>
    </p>
  `;

  const html = baseEmailTemplate({
    headerStyle: "red",
    headerEmoji: "😔",
    headerTitle: "Başvurunuz Onaylanmadı",
    headerSubtitle: `${safeVendorName} başvurusu reddedildi`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Sistem bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `${vendorName} başvurunuz hakkında - Cateringle.com`,
    html,
  };
}
