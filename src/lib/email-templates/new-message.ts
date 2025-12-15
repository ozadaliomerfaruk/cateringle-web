// src/lib/email-templates/new-message.ts
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

interface NewMessageEmailParams {
  recipientName: string;
  senderName: string;
  senderType: "vendor" | "customer";
  messageContent: string;
  messageTime: string;
  conversationUrl: string;
  /** Lead context */
  eventDate?: string | null;
  guestCount?: number | null;
  /** Unsubscribe */
  unsubscribeUrl?: string;
}

/**
 * Yeni mesaj email template'i
 */
export function newMessageEmailTemplate({
  recipientName,
  senderName,
  senderType,
  messageContent,
  messageTime,
  conversationUrl,
  eventDate,
  guestCount,
  unsubscribeUrl,
}: NewMessageEmailParams): { subject: string; html: string } {
  const safeRecipientName = escapeHtml(recipientName);
  const safeSenderName = escapeHtml(senderName);
  const safeMessageContent = formatMessageContent(messageContent, 500);
  const formattedTime = formatDateTime(messageTime);

  const emoji = senderType === "vendor" ? "🏢" : "👤";

  // Context bilgisi
  let contextHtml = "";
  if (eventDate || guestCount) {
    const contextItems: string[] = [];
    if (eventDate) {
      contextItems.push(`📅 ${formatDateTime(eventDate)}`);
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

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeRecipientName}</strong>,</p>
    
    <p>${emoji} <strong>${safeSenderName}</strong> size yeni bir mesaj gönderdi.</p>
    
    ${contextHtml}
    
    ${messageBox(`
      <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
        <strong>${safeSenderName}</strong> • ${formattedTime}
      </div>
      <div style="font-size: 15px; color: #1e293b; line-height: 1.6;">
        ${safeMessageContent}
      </div>
    `)}
    
    <p style="font-size: 14px; color: #64748b;">
      Mesaja yanıt vermek için aşağıdaki butona tıklayın.
    </p>
    
    ${ctaButton("Mesajı Görüntüle ve Yanıtla →", conversationUrl)}
  `;

  const html = baseEmailTemplate({
    headerStyle: "blue",
    headerEmoji: "💬",
    headerTitle: "Yeni Mesajınız Var",
    headerSubtitle: `${safeSenderName} size mesaj gönderdi`,
    content,
    unsubscribeUrl,
    unsubscribeText: "Mesaj bildirimlerini almak istemiyorsanız",
  });

  return {
    subject: `💬 ${senderName} size mesaj gönderdi`,
    html,
  };
}

/**
 * Çoklu mesaj bildirimi (digest)
 */
export function messageDigestEmailTemplate({
  recipientName,
  unreadCount,
  conversations,
  inboxUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  unreadCount: number;
  conversations: Array<{
    senderName: string;
    lastMessage: string;
    messageCount: number;
  }>;
  inboxUrl: string;
  unsubscribeUrl?: string;
}): { subject: string; html: string } {
  const safeRecipientName = escapeHtml(recipientName);

  const conversationListHtml = conversations
    .slice(0, 5)
    .map(
      (conv) => `
      <div style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="font-weight: 600; color: #1e293b;">
          ${escapeHtml(conv.senderName)}
          ${conv.messageCount > 1 ? `<span style="font-weight: normal; color: #64748b;"> (${conv.messageCount} mesaj)</span>` : ""}
        </div>
        <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
          ${formatMessageContent(conv.lastMessage, 100)}
        </div>
      </div>
    `
    )
    .join("");

  const content = `
    <p style="${inlineStyles.greeting}">Merhaba <strong>${safeRecipientName}</strong>,</p>
    
    <p>Okunmamış <strong>${unreadCount}</strong> mesajınız var.</p>
    
    <div style="margin: 20px 0;">
      ${conversationListHtml}
    </div>
    
    ${conversations.length > 5 ? `<p style="font-size: 14px; color: #64748b;">ve ${conversations.length - 5} konuşma daha...</p>` : ""}
    
    ${ctaButton("Gelen Kutusuna Git →", inboxUrl)}
  `;

  const html = baseEmailTemplate({
    headerStyle: "blue",
    headerEmoji: "📬",
    headerTitle: `${unreadCount} Okunmamış Mesaj`,
    headerSubtitle: "Mesajlarınızı kontrol edin",
    content,
    unsubscribeUrl,
  });

  return {
    subject: `📬 ${unreadCount} okunmamış mesajınız var`,
    html,
  };
}
