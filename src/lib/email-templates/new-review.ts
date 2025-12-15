// src/lib/email-templates/new-review.ts
import "server-only";
import {
  baseEmailTemplate,
  ctaButton,
  messageBox,
} from "./base";
import {
  escapeHtml,
  formatMessageContent,
  formatDateTime,
} from "./helpers";
import { inlineStyles } from "./styles";

interface NewReviewEmailParams {
  vendorName: string;
  customerName: string;
  rating: number;
  comment?: string | null;
  eventType?: string | null;
  guestCount?: number | null;
  reviewDate: string;
  reviewsUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Yeni yorum email template'i
 */
export function newReviewEmailTemplate({
  vendorName,
  customerName,
  rating,
  comment,
  eventType,
  guestCount,
  reviewDate,
  reviewsUrl,
  unsubscribeUrl,
}: NewReviewEmailParams): { subject: string; html: string } {
  const safeVendorName = escapeHtml(vendorName);
  const safeCustomerName = escapeHtml(customerName);
  const safeComment = comment ? formatMessageContent(comment, 500) : null;
  const formattedDate = formatDateTime(reviewDate);

  // Yıldız render
  const starsHtml = Array.from({ length: 5 }, (_, i) => {
    const filled = i < rating;
    return `<span style="color: ${filled ? '#f59e0b' : '#e2e8f0'}; font-size: 20px;">★</span>`;
  }).join("");

  // Rating emoji ve renk
  let ratingEmoji = "⭐";
  let ratingColor = "#f59e0b";
  let ratingText = "yorum";
  if (rating >= 4) {
    ratingEmoji = "🌟";
    ratingColor = "#22c55e";
    ratingText = "harika bir yorum";
  } else if (rating <= 2) {
    ratingEmoji = "📝";
    ratingColor = "#ef4444";
    ratingText = "yorum";
  }

  // Event context
  let contextHtml = "";
  if (eventType || guestCount) {
    const contextItems: string[] = [];
    if (eventType) {
      contextItems.push(`🎉 ${escapeHtml(eventType)}`);
    }
    if (guestCount) {
      contextItems.push(`👥 ${guestCount} kişi`);
    }
    contextHtml = `
      <div style="margin-bottom: 16px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #64748b;">
        ${contextItems.join(" &nbsp;•&nbsp; ")}
      </div>
    `;
  }

  // Comment box
  const commentHtml = safeComment ? messageBox(`
    <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
      <strong>${safeCustomerName}</strong> • ${formattedDate}
    </div>
    <div style="font-size: 15px; color: #1e293b; line-height: 1.6;">
      "${safeComment}"
    </div>
  `) : "";

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeVendorName}</strong>,</p>
    
    <p>${ratingEmoji} Bir müşteriniz size ${ratingText} bıraktı!</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <div style="display: inline-block; padding: 16px 24px; background: #fffbeb; border-radius: 12px; border: 2px solid #fcd34d;">
        <div style="margin-bottom: 8px;">${starsHtml}</div>
        <div style="font-size: 24px; font-weight: bold; color: ${ratingColor};">${rating}/5</div>
        <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
          ${safeCustomerName}
        </div>
      </div>
    </div>
    
    ${contextHtml}
    
    ${commentHtml}
    
    <p style="font-size: 14px; color: #64748b;">
      Bu yorum onaylandıktan sonra profilinizde görünecektir. Yoruma yanıt vermek için aşağıdaki butona tıklayın.
    </p>
    
    ${ctaButton("Yorumları Yönet →", reviewsUrl)}
    
    <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
      <p style="margin: 0; font-size: 14px; color: #166534;">
        <strong>💡 İpucu:</strong> Müşteri yorumlarına yanıt vermek, potansiyel müşterilerinize profesyonelliğinizi gösterir ve güven oluşturur.
      </p>
    </div>
  `;

  const html = baseEmailTemplate({
    headerStyle: rating >= 4 ? "green" : "orange",
    headerEmoji: ratingEmoji,
    headerTitle: "Yeni Müşteri Yorumu",
    headerSubtitle: `${safeCustomerName} size ${rating} yıldız verdi`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Yorum bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `${ratingEmoji} ${customerName} size ${rating} yıldız verdi`,
    html,
  };
}
