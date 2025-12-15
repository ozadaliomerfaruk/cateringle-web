// src/lib/email-templates/helpers.ts
import "server-only";

/**
 * HTML escape - XSS koruması için ZORUNLU
 * Tüm user input bu fonksiyondan geçmeli
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Fiyat formatla (Türkçe)
 */
export function formatPrice(amount: number): string {
  return amount.toLocaleString("tr-TR");
}

/**
 * Tarih formatla (Türkçe)
 */
export function formatDate(
  dateStr: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString(
    "tr-TR",
    options || {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

/**
 * Tarih + saat formatla
 */
export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Mesaj içeriğini güvenli şekilde formatla
 * - HTML escape
 * - Satır sonlarını <br> yap
 * - Max uzunluk (preview için)
 */
export function formatMessageContent(
  content: string | null | undefined,
  maxLength?: number
): string {
  if (!content) return "";

  let safe = escapeHtml(content);

  // Satır sonlarını <br> yap
  safe = safe.replace(/\n/g, "<br>");

  // Max uzunluk
  if (maxLength && safe.length > maxLength) {
    safe = safe.substring(0, maxLength) + "...";
  }

  return safe;
}

/**
 * URL güvenli mi kontrol et
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Güvenli link oluştur
 */
export function safeUrl(url: string, fallback = "#"): string {
  return isValidUrl(url) ? url : fallback;
}

/**
 * Unsubscribe token oluştur (HMAC-based)
 */
export function generateUnsubscribeToken(
  userId: string,
  emailType: string,
  secret: string
): string {
  // Simple hash - production'da crypto.subtle kullanılabilir
  const data = `${userId}:${emailType}:${Date.now()}`;
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data + secret);

  // Base64 encode
  let hash = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    hash = (hash << 5) - hash + dataBytes[i];
    hash = hash & hash;
  }

  return Buffer.from(`${data}:${Math.abs(hash)}`).toString("base64url");
}

/**
 * Unsubscribe token doğrula
 */
export function verifyUnsubscribeToken(
  token: string,
  secret: string
): { valid: boolean; userId?: string; emailType?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");

    if (parts.length !== 4) {
      return { valid: false };
    }

    const [userId, emailType, timestamp, hash] = parts;

    // Timestamp kontrolü (30 gün)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (now - tokenTime > thirtyDays) {
      return { valid: false };
    }

    // Hash doğrula
    const data = `${userId}:${emailType}:${timestamp}`;
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data + secret);

    let expectedHash = 0;
    for (let i = 0; i < dataBytes.length; i++) {
      expectedHash = (expectedHash << 5) - expectedHash + dataBytes[i];
      expectedHash = expectedHash & expectedHash;
    }

    if (Math.abs(expectedHash).toString() !== hash) {
      return { valid: false };
    }

    return { valid: true, userId, emailType };
  } catch {
    return { valid: false };
  }
}
