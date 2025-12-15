// src/lib/email-templates/new-review.ts
import "server-only";
import { baseEmailTemplate, ctaButton, messageBox, infoRow } from "./base";
import { escapeHtml, formatMessageContent, formatDateTime } from "./helpers";
import { inlineStyles } from "./styles";

interface NewReviewEmailParams {
  vendorName: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string | null;
  reviewDate: string;
  eventType?: string | null;
  guestCount?: number | null;
  reviewsUrl: string; // "reviewUrl" değil "reviewsUrl" (çoğul)
  unsubscribeUrl?: string;
}

/**
 * Yeni yorum email template'i - Vendor'a gönderilir
 */
export function newReviewEmailTemplate({
  vendorName,
  customerName,
  rating,
  comment,
  reviewDate,
  eventType,
  guestCount,
  reviewsUrl,
  unsubscribeUrl,
}: NewReviewEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeCustomerName = escapeHtml(customerName);
  const safeComment = comment ? formatMessageContent(comment, 500) : null;
  const safeEventType = eventType ? escapeHtml(eventType) : null;
  const formattedDate = formatDateTime(reviewDate);

  // Star rating görsel (⭐ emoji ile)
  const stars = "⭐".repeat(rating) + "☆".repeat(5 - rating);

  // Rating'e göre renk ve mesaj
  let ratingStyle: "green" | "orange" | "red";
  let ratingMessage: string;

  if (rating >= 4) {
    ratingStyle = "green";
    ratingMessage = "Harika bir değerlendirme aldınız!";
  } else if (rating >= 3) {
    ratingStyle = "orange";
    ratingMessage = "Yeni bir değerlendirme aldınız.";
  } else {
    ratingStyle = "red";
    ratingMessage = "Müşterinizden geri bildirim aldınız.";
  }

  // Rating badge colors
  const ratingColors = {
    green: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    orange: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    red: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  };

  const ratingColor = ratingColors[ratingStyle];

  // Info rows
  let infoHtml = "";
  infoHtml += infoRow("Müşteri", safeCustomerName);
  infoHtml += infoRow("Puan", `${rating}/5 ${stars}`);
  infoHtml += infoRow("Tarih", formattedDate);
  if (safeEventType) {
    infoHtml += infoRow("Etkinlik Türü", safeEventType);
  }
  if (guestCount) {
    infoHtml += infoRow("Kişi Sayısı", `${guestCount} kişi`);
  }

  const content = `
    <p style="${
      inlineStyles.greeting
    }">Merhaba <strong>${safeVendorName}</strong>,</p>
    
    <p>${ratingMessage}</p>
    
    <!-- Rating Badge -->
    <div style="text-align: center; margin: 24px 0;">
      <div style="
        display: inline-block;
        padding: 16px 32px;
        background: ${ratingColor.bg};
        border: 1px solid ${ratingColor.border};
        border-radius: 12px;
      ">
        <div style="font-size: 28px; margin-bottom: 8px;">${stars}</div>
        <div style="font-size: 24px; font-weight: 700; color: ${
          ratingColor.text
        };">
          ${rating}/5 Puan
        </div>
      </div>
    </div>
    
    <div style="margin: 24px 0;">
      ${infoHtml}
    </div>
    
    ${
      safeComment
        ? `
      <div style="margin: 24px 0;">
        <div style="${inlineStyles.infoLabel}">Müşteri Yorumu</div>
        ${messageBox(`
          <div style="font-style: italic; color: #475569;">
            "${safeComment}"
          </div>
        `)}
      </div>
    `
        : `
      <div style="margin: 24px 0; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 14px; color: #64748b; text-align: center;">
        Müşteri yazılı yorum bırakmadı.
      </div>
    `
    }
    
    ${
      rating >= 4
        ? `
      <div style="margin: 24px 0; padding: 16px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px;">
        <div style="font-size: 14px; color: #166534;">
          💡 <strong>İpucu:</strong> Yüksek puanlı yorumları sosyal medyada paylaşarak yeni müşteriler çekebilirsiniz!
        </div>
      </div>
    `
        : rating <= 2
        ? `
      <div style="margin: 24px 0; padding: 16px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
        <div style="font-size: 14px; color: #92400e;">
          💬 <strong>Öneri:</strong> Müşterinizle iletişime geçip sorunu çözmeye çalışabilirsiniz. Çoğu zaman sorunlar çözüldüğünde müşteriler değerlendirmelerini güncellerler.
        </div>
      </div>
    `
        : ""
    }
    
    <p style="font-size: 14px; color: #64748b;">
      Yorumu görüntülemek ve yanıtlamak için aşağıdaki butona tıklayın.
    </p>
    
    ${ctaButton("Yorumu Görüntüle →", reviewsUrl)}
  `;

  // Header style based on rating
  const headerStyle = ratingStyle;
  const headerEmoji = rating >= 4 ? "🌟" : rating >= 3 ? "📝" : "💬";
  const headerTitle =
    rating >= 4
      ? "Harika Bir Yorum Aldınız!"
      : rating >= 3
      ? "Yeni Değerlendirme"
      : "Müşteri Geri Bildirimi";

  const html = baseEmailTemplate({
    headerStyle,
    headerEmoji,
    headerTitle,
    headerSubtitle: `${safeCustomerName} sizi değerlendirdi`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Yorum bildirimlerini almak istemiyorsanız",
  });

  // Subject based on rating
  let subject: string;
  if (rating >= 4) {
    subject = `🌟 ${customerName} size ${rating} yıldız verdi!`;
  } else if (rating >= 3) {
    subject = `📝 ${customerName} sizi değerlendirdi (${rating}/5)`;
  } else {
    subject = `💬 ${customerName}'dan geri bildirim aldınız`;
  }

  return { subject, html };
}
