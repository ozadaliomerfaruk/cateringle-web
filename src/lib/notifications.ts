// src/lib/notifications.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Bildirim tipleri
export type NotificationType =
  | "lead_new"
  | "lead_updated"
  | "quote_received"
  | "quote_accepted"
  | "quote_rejected"
  | "message_new"
  | "review_new"
  | "review_approved"
  | "vendor_approved"
  | "vendor_rejected"
  | "vendor_suspended"
  | "booking_confirmed"
  | "booking_reminder"
  | "system";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bildirim oluştur (sadece in-app)
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  entityType,
  entityId,
  actionUrl,
  metadata = {},
}: CreateNotificationParams): Promise<{ success: boolean; notificationId?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        entity_type: entityType,
        entity_id: entityId,
        action_url: actionUrl,
        metadata,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Notification insert error:", error);
      return { success: false };
    }

    return { success: true, notificationId: data.id };
  } catch (error) {
    console.error("createNotification error:", error);
    return { success: false };
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Vendor'a yeni lead bildirimi
 */
export async function notifyNewLead(
  vendorOwnerId: string,
  leadId: string,
  customerName: string
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "lead_new",
    title: "Yeni Talep Aldınız",
    message: `${customerName} adlı müşteriden yeni bir talep geldi.`,
    entityType: "lead",
    entityId: leadId,
    actionUrl: `/vendor/leads`,
  });
}

/**
 * Müşteriye teklif bildirimi
 */
export async function notifyQuoteReceived(
  customerId: string,
  quoteId: string,
  vendorName: string,
  amount: number
) {
  return createNotification({
    userId: customerId,
    type: "quote_received",
    title: "Yeni Teklif Aldınız",
    message: `${vendorName} firmasından ${amount.toLocaleString("tr-TR")} ₺ tutarında teklif aldınız.`,
    entityType: "quote",
    entityId: quoteId,
    actionUrl: `/account/quotes/${quoteId}`,
  });
}

/**
 * Vendor'a teklif kabul bildirimi
 */
export async function notifyQuoteAccepted(
  vendorOwnerId: string,
  quoteId: string,
  customerName: string
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "quote_accepted",
    title: "Teklifiniz Kabul Edildi! 🎉",
    message: `${customerName} teklifinizi kabul etti.`,
    entityType: "quote",
    entityId: quoteId,
    actionUrl: `/vendor/quotes/${quoteId}`,
  });
}

/**
 * Vendor'a teklif red bildirimi
 */
export async function notifyQuoteRejected(
  vendorOwnerId: string,
  quoteId: string,
  customerName: string
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "quote_rejected",
    title: "Teklifiniz Reddedildi",
    message: `${customerName} teklifinizi reddetti.`,
    entityType: "quote",
    entityId: quoteId,
    actionUrl: `/vendor/quotes/${quoteId}`,
  });
}

/**
 * Vendor onay bildirimi
 */
export async function notifyVendorApproved(vendorOwnerId: string) {
  return createNotification({
    userId: vendorOwnerId,
    type: "vendor_approved",
    title: "Hesabınız Onaylandı! 🎉",
    message:
      "Tebrikler! İşletmeniz Cateringle'da yayına alındı. Artık talep almaya başlayabilirsiniz.",
    actionUrl: "/vendor",
  });
}

/**
 * Vendor red bildirimi
 */
export async function notifyVendorRejected(
  vendorOwnerId: string,
  reason?: string
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "vendor_rejected",
    title: "Başvurunuz Reddedildi",
    message: reason || "Başvurunuz inceleme sonucunda reddedilmiştir.",
    actionUrl: "/vendor",
  });
}

/**
 * Yeni yorum bildirimi
 */
export async function notifyNewReview(
  vendorOwnerId: string,
  reviewId: string,
  customerName: string,
  rating: number
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "review_new",
    title: `Yeni ${rating} Yıldızlı Yorum`,
    message: `${customerName} işletmenize yorum bıraktı.`,
    entityType: "review",
    entityId: reviewId,
    actionUrl: "/vendor/reviews",
  });
}

/**
 * Rezervasyon hatırlatma
 */
export async function notifyBookingReminder(
  vendorOwnerId: string,
  bookingId: string,
  eventDate: string,
  customerName: string
) {
  return createNotification({
    userId: vendorOwnerId,
    type: "booking_reminder",
    title: "Yarınki Etkinlik Hatırlatması",
    message: `${customerName} için yarın (${eventDate}) etkinliğiniz var.`,
    entityType: "booking",
    entityId: bookingId,
    actionUrl: "/vendor/calendar",
  });
}
