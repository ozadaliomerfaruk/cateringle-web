// src/lib/email-templates/quote-status.ts
import "server-only";
import {
  baseEmailTemplate,
  infoRow,
  ctaButton,
  messageBox,
  priceBox,
  statusBadge,
  noteBox,
} from "./base";
import {
  escapeHtml,
  formatPrice,
  formatDate,
  formatMessageContent,
} from "./helpers";
import { inlineStyles } from "./styles";

interface QuoteAcceptedEmailParams {
  vendorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalPrice: number;
  eventDate?: string | null;
  guestCount?: number | null;
  customerNote?: string | null;
  conversationUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Teklif kabul edildi - Vendor'a gönderilir
 */
export function quoteAcceptedEmailTemplate({
  vendorName,
  customerName,
  customerEmail,
  customerPhone,
  totalPrice,
  eventDate,
  guestCount,
  customerNote,
  conversationUrl,
  unsubscribeUrl,
}: QuoteAcceptedEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeCustomerName = escapeHtml(customerName);
  const safeCustomerEmail = escapeHtml(customerEmail);
  const safeCustomerPhone = customerPhone ? escapeHtml(customerPhone) : null;
  const safeCustomerNote = customerNote
    ? formatMessageContent(customerNote, 500)
    : null;

  const formattedPrice = formatPrice(totalPrice);
  const formattedEventDate = eventDate ? formatDate(eventDate) : null;

  // Info rows
  let infoHtml = "";
  infoHtml += infoRow("Müşteri Adı", safeCustomerName);
  infoHtml += infoRow(
    "E-posta",
    `<a href="mailto:${safeCustomerEmail}" style="color: #22c55e;">${safeCustomerEmail}</a>`
  );
  if (safeCustomerPhone) {
    infoHtml += infoRow(
      "Telefon",
      `<a href="tel:${safeCustomerPhone}" style="color: #22c55e;">${safeCustomerPhone}</a>`
    );
  }
  if (formattedEventDate) {
    infoHtml += infoRow("Etkinlik Tarihi", formattedEventDate);
  }
  if (guestCount) {
    infoHtml += infoRow("Kişi Sayısı", `${guestCount} kişi`);
  }

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeVendorName}</strong>,</p>
    
    <div style="text-align: center; margin: 24px 0;">
      ${statusBadge("✅ Teklif Kabul Edildi", "success")}
    </div>
    
    <p>Harika haber! <strong>${safeCustomerName}</strong> teklifinizi kabul etti.</p>
    
    ${priceBox(formattedPrice, guestCount ? `${guestCount} kişi için` : undefined)}
    
    <div style="margin: 24px 0;">
      ${infoHtml}
    </div>
    
    ${
      safeCustomerNote
        ? `
      <div style="margin: 24px 0;">
        <div style="${inlineStyles.infoLabel}">Müşteri Notu</div>
        ${messageBox(safeCustomerNote)}
      </div>
    `
        : ""
    }
    
    ${noteBox("⚡ Müşteri ile iletişime geçerek etkinlik detaylarını netleştirin.")}
    
    ${ctaButton("Mesaj Gönder →", conversationUrl, "green")}
  `;

  const html = baseEmailTemplate({
    headerStyle: "green",
    headerEmoji: "🎉",
    headerTitle: "Teklifiniz Kabul Edildi!",
    headerSubtitle: `${safeCustomerName} teklifinizi kabul etti`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Teklif bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `🎉 Harika haber! ${customerName} teklifinizi kabul etti`,
    html,
  };
}

interface QuoteRejectedEmailParams {
  vendorName: string;
  customerName: string;
  totalPrice: number;
  customerNote?: string | null;
  dashboardUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Teklif reddedildi - Vendor'a gönderilir
 */
export function quoteRejectedEmailTemplate({
  vendorName,
  customerName,
  totalPrice,
  customerNote,
  dashboardUrl,
  unsubscribeUrl,
}: QuoteRejectedEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeCustomerName = escapeHtml(customerName);
  const safeCustomerNote = customerNote
    ? formatMessageContent(customerNote, 500)
    : null;

  const formattedPrice = formatPrice(totalPrice);

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeVendorName}</strong>,</p>
    
    <div style="text-align: center; margin: 24px 0;">
      ${statusBadge("Teklif Reddedildi", "error")}
    </div>
    
    <p><strong>${safeCustomerName}</strong>, <strong>${formattedPrice} ₺</strong> tutarındaki teklifinizi reddetmiştir.</p>
    
    ${
      safeCustomerNote
        ? `
      <div style="margin: 24px 0;">
        <div style="${inlineStyles.infoLabel}">Müşteri Notu</div>
        ${messageBox(safeCustomerNote)}
      </div>
    `
        : ""
    }
    
    <p style="font-size: 14px; color: #64748b;">
      Bu durumda yapabileceğiniz birkaç şey:
    </p>
    <ul style="font-size: 14px; color: #64748b; margin: 12px 0; padding-left: 20px;">
      <li>Müşteri ile iletişime geçip nedenini öğrenebilirsiniz</li>
      <li>Farklı bir fiyat teklifi gönderebilirsiniz</li>
      <li>Diğer taleplere odaklanabilirsiniz</li>
    </ul>
    
    ${ctaButton("Panele Git →", dashboardUrl)}
  `;

  const html = baseEmailTemplate({
    headerStyle: "red",
    headerEmoji: "😔",
    headerTitle: "Teklif Reddedildi",
    headerSubtitle: `${safeCustomerName} teklifinizi reddetmiştir`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Teklif bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `${customerName} teklifinizi reddetti`,
    html,
  };
}

interface NewQuoteEmailParams {
  customerName: string;
  vendorName: string;
  totalPrice: number;
  pricePerPerson?: number | null;
  guestCount?: number | null;
  vendorMessage?: string | null;
  validUntil?: string | null;
  quoteUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Yeni teklif - Müşteriye gönderilir
 * (Mevcut sendQuoteNotification yerine kullanılacak)
 */
export function newQuoteEmailTemplate({
  customerName,
  vendorName,
  totalPrice,
  pricePerPerson,
  guestCount,
  vendorMessage,
  validUntil,
  quoteUrl,
  unsubscribeUrl,
}: NewQuoteEmailParams): { subject: string; html: string } {
  const safeCustomerName = escapeHtml(customerName);
  const safeVendorName = escapeHtml(vendorName);
  const safeVendorMessage = vendorMessage
    ? formatMessageContent(vendorMessage, 500)
    : null;

  const formattedPrice = formatPrice(totalPrice);
  const formattedPricePerPerson = pricePerPerson
    ? formatPrice(pricePerPerson)
    : null;
  const formattedValidUntil = validUntil ? formatDate(validUntil) : null;

  // Price detail
  let priceDetail: string | undefined;
  if (formattedPricePerPerson && guestCount) {
    priceDetail = `${guestCount} kişi × ${formattedPricePerPerson} ₺/kişi`;
  }

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeCustomerName}</strong>,</p>
    
    <p>Harika haber! <strong>${safeVendorName}</strong> firması teklif talebinizi inceledi ve size özel bir fiyat teklifi hazırladı.</p>
    
    ${priceBox(formattedPrice, priceDetail)}
    
    ${
      safeVendorMessage
        ? `
      <div style="margin: 24px 0;">
        <div style="${inlineStyles.infoLabel}">Firma Mesajı</div>
        ${messageBox(safeVendorMessage)}
      </div>
    `
        : ""
    }
    
    ${
      formattedValidUntil
        ? noteBox(`⏰ Bu teklif <strong>${formattedValidUntil}</strong> tarihine kadar geçerlidir.`)
        : ""
    }
    
    <p style="font-size: 14px; color: #64748b;">
      Teklifi beğendiyseniz kabul edebilir, sorularınız varsa firma ile doğrudan mesajlaşabilirsiniz.
    </p>
    
    ${ctaButton("Teklifi İncele ve Yanıtla →", quoteUrl)}
  `;

  const html = baseEmailTemplate({
    headerStyle: "orange",
    headerEmoji: "🎉",
    headerTitle: "Yeni Teklif Aldınız!",
    headerSubtitle: `${safeVendorName} size fiyat teklifi gönderdi`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Teklif bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `🎉 ${vendorName} size fiyat teklifi gönderdi!`,
    html,
  };
}
