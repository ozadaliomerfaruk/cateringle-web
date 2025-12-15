// src/lib/email-notifications.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { rateLimit, rateLimitPresets } from "@/lib/rate-limit";
import {
  newMessageEmailTemplate,
  quoteAcceptedEmailTemplate,
  quoteRejectedEmailTemplate,
  newQuoteEmailTemplate,
  vendorApprovedEmailTemplate,
  vendorRejectedEmailTemplate,
  newReviewEmailTemplate,
  generateUnsubscribeToken,
} from "@/lib/email-templates";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cateringle.com";
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "default-secret-change-me";

// Email preference keys
type EmailPreferenceKey =
  | "lead_new_email"
  | "quote_received_email"
  | "quote_accepted_email"
  | "quote_rejected_email"
  | "message_new_email"
  | "review_new_email"
  | "booking_reminder_email"
  | "system_email";

/**
 * Check if user wants to receive this type of email
 */
async function shouldSendEmail(
  userId: string,
  preferenceKey: EmailPreferenceKey
): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("notification_preferences")
      .select(preferenceKey)
      .eq("user_id", userId)
      .single();

    // Default to true if no preference set
    if (!data) return true;

    return data[preferenceKey] !== false;
  } catch (error) {
    console.error("Error checking email preference:", error);
    // Default to true on error
    return true;
  }
}

/**
 * Check email rate limit for a user
 * Returns true if user is within rate limit (can send)
 */
async function checkEmailRateLimit(userId: string): Promise<boolean> {
  try {
    const { success } = await rateLimit(userId, rateLimitPresets.email);
    return success;
  } catch (error) {
    console.error("Email rate limit check error:", error);
    // Fail open - allow email on error
    return true;
  }
}

/**
 * Generate unsubscribe URL for a user
 */
function getUnsubscribeUrl(userId: string, emailType: string): string {
  const token = generateUnsubscribeToken(userId, emailType, UNSUBSCRIBE_SECRET);
  return `${BASE_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Get user email by ID
 */
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data?.user?.email || null;
  } catch (error) {
    console.error("Error getting user email:", error);
    return null;
  }
}

/**
 * Log email send attempt (no PII)
 * Note: email_logs table will be created by migration 20251215_email_notifications.sql
 * After running migration, regenerate types with: npx supabase gen types typescript
 */
async function logEmailSend(
  recipientId: string,
  emailType: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  status: "sent" | "failed" | "skipped" = "sent",
  errorMessage?: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin as any).from("email_logs").insert({
      recipient_id: recipientId,
      email_type: emailType,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      status,
      error_message: errorMessage,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    });
  } catch (error) {
    // Log error but don't fail the main operation
    // This will fail silently until the email_logs table is created
    console.error("Error logging email:", error);
  }
}

// ============================================
// Email Notification Functions
// ============================================

interface SendNewMessageEmailParams {
  recipientUserId: string;
  recipientName: string;
  senderName: string;
  senderType: "vendor" | "customer";
  messageContent: string;
  messageTime: string;
  vendorLeadId: string;
  eventDate?: string | null;
  guestCount?: number | null;
}

/**
 * Send new message email notification
 */
export async function sendNewMessageEmail({
  recipientUserId,
  recipientName,
  senderName,
  senderType,
  messageContent,
  messageTime,
  vendorLeadId,
  eventDate,
  guestCount,
}: SendNewMessageEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check preference
  const shouldSend = await shouldSendEmail(recipientUserId, "message_new_email");
  if (!shouldSend) {
    await logEmailSend(recipientUserId, "message_new", "message", vendorLeadId, "skipped");
    return { success: true, skipped: true };
  }

  // Check rate limit (10 emails/user/hour)
  const withinLimit = await checkEmailRateLimit(recipientUserId);
  if (!withinLimit) {
    await logEmailSend(recipientUserId, "message_new", "message", vendorLeadId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(recipientUserId);
  if (!email) {
    await logEmailSend(recipientUserId, "message_new", "message", vendorLeadId, "failed", "No email found");
    return { success: false };
  }

  // Determine conversation URL based on recipient type
  const conversationUrl =
    senderType === "vendor"
      ? `${BASE_URL}/account/messages/${vendorLeadId}`
      : `${BASE_URL}/vendor/messages/${vendorLeadId}`;

  // Generate email
  const { subject, html } = newMessageEmailTemplate({
    recipientName,
    senderName,
    senderType,
    messageContent,
    messageTime,
    conversationUrl,
    eventDate,
    guestCount,
    unsubscribeUrl: getUnsubscribeUrl(recipientUserId, "message_new"),
  });

  // Send
  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    recipientUserId,
    "message_new",
    "message",
    vendorLeadId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

interface SendQuoteAcceptedEmailParams {
  vendorOwnerId: string;
  vendorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  quoteId: string;
  totalPrice: number;
  eventDate?: string | null;
  guestCount?: number | null;
  customerNote?: string | null;
  vendorLeadId: string;
}

/**
 * Send quote accepted email to vendor
 */
export async function sendQuoteAcceptedEmail({
  vendorOwnerId,
  vendorName,
  customerName,
  customerEmail,
  customerPhone,
  quoteId,
  totalPrice,
  eventDate,
  guestCount,
  customerNote,
  vendorLeadId,
}: SendQuoteAcceptedEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check preference
  const shouldSend = await shouldSendEmail(vendorOwnerId, "quote_accepted_email");
  if (!shouldSend) {
    await logEmailSend(vendorOwnerId, "quote_accepted", "quote", quoteId, "skipped");
    return { success: true, skipped: true };
  }

  // Check rate limit
  const withinLimit = await checkEmailRateLimit(vendorOwnerId);
  if (!withinLimit) {
    await logEmailSend(vendorOwnerId, "quote_accepted", "quote", quoteId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(vendorOwnerId);
  if (!email) {
    await logEmailSend(vendorOwnerId, "quote_accepted", "quote", quoteId, "failed", "No email found");
    return { success: false };
  }

  const conversationUrl = `${BASE_URL}/vendor/messages/${vendorLeadId}`;

  const { subject, html } = quoteAcceptedEmailTemplate({
    vendorName,
    customerName,
    customerEmail,
    customerPhone,
    totalPrice,
    eventDate,
    guestCount,
    customerNote,
    conversationUrl,
    unsubscribeUrl: getUnsubscribeUrl(vendorOwnerId, "quote_accepted"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    vendorOwnerId,
    "quote_accepted",
    "quote",
    quoteId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

interface SendQuoteRejectedEmailParams {
  vendorOwnerId: string;
  vendorName: string;
  customerName: string;
  quoteId: string;
  totalPrice: number;
  customerNote?: string | null;
}

/**
 * Send quote rejected email to vendor
 */
export async function sendQuoteRejectedEmail({
  vendorOwnerId,
  vendorName,
  customerName,
  quoteId,
  totalPrice,
  customerNote,
}: SendQuoteRejectedEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check preference
  const shouldSend = await shouldSendEmail(vendorOwnerId, "quote_rejected_email");
  if (!shouldSend) {
    await logEmailSend(vendorOwnerId, "quote_rejected", "quote", quoteId, "skipped");
    return { success: true, skipped: true };
  }

  // Check rate limit
  const withinLimit = await checkEmailRateLimit(vendorOwnerId);
  if (!withinLimit) {
    await logEmailSend(vendorOwnerId, "quote_rejected", "quote", quoteId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(vendorOwnerId);
  if (!email) {
    await logEmailSend(vendorOwnerId, "quote_rejected", "quote", quoteId, "failed", "No email found");
    return { success: false };
  }

  const dashboardUrl = `${BASE_URL}/vendor/leads`;

  const { subject, html } = quoteRejectedEmailTemplate({
    vendorName,
    customerName,
    totalPrice,
    customerNote,
    dashboardUrl,
    unsubscribeUrl: getUnsubscribeUrl(vendorOwnerId, "quote_rejected"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    vendorOwnerId,
    "quote_rejected",
    "quote",
    quoteId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

interface SendNewQuoteEmailParams {
  customerId: string;
  customerName: string;
  vendorName: string;
  quoteId: string;
  totalPrice: number;
  pricePerPerson?: number | null;
  guestCount?: number | null;
  vendorMessage?: string | null;
  validUntil?: string | null;
}

/**
 * Send new quote email to customer
 */
export async function sendNewQuoteEmail({
  customerId,
  customerName,
  vendorName,
  quoteId,
  totalPrice,
  pricePerPerson,
  guestCount,
  vendorMessage,
  validUntil,
}: SendNewQuoteEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check preference
  const shouldSend = await shouldSendEmail(customerId, "quote_received_email");
  if (!shouldSend) {
    await logEmailSend(customerId, "quote_received", "quote", quoteId, "skipped");
    return { success: true, skipped: true };
  }

  // Check rate limit
  const withinLimit = await checkEmailRateLimit(customerId);
  if (!withinLimit) {
    await logEmailSend(customerId, "quote_received", "quote", quoteId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(customerId);
  if (!email) {
    await logEmailSend(customerId, "quote_received", "quote", quoteId, "failed", "No email found");
    return { success: false };
  }

  const quoteUrl = `${BASE_URL}/account/quotes/${quoteId}`;

  const { subject, html } = newQuoteEmailTemplate({
    customerName,
    vendorName,
    totalPrice,
    pricePerPerson,
    guestCount,
    vendorMessage,
    validUntil,
    quoteUrl,
    unsubscribeUrl: getUnsubscribeUrl(customerId, "quote_received"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    customerId,
    "quote_received",
    "quote",
    quoteId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

// ============================================
// Vendor Approval Email Functions
// ============================================

interface SendVendorApprovedEmailParams {
  vendorOwnerId: string;
  vendorName: string;
  ownerName: string;
  vendorId: string;
}

/**
 * Send vendor approved email to vendor owner
 */
export async function sendVendorApprovedEmail({
  vendorOwnerId,
  vendorName,
  ownerName,
  vendorId,
}: SendVendorApprovedEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Always send approval emails (important notification)
  // But respect rate limit
  
  // Check rate limit
  const withinLimit = await checkEmailRateLimit(vendorOwnerId);
  if (!withinLimit) {
    await logEmailSend(vendorOwnerId, "vendor_approved", "vendor", vendorId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(vendorOwnerId);
  if (!email) {
    await logEmailSend(vendorOwnerId, "vendor_approved", "vendor", vendorId, "failed", "No email found");
    return { success: false };
  }

  const { subject, html } = vendorApprovedEmailTemplate({
    vendorName,
    ownerName,
    unsubscribeUrl: getUnsubscribeUrl(vendorOwnerId, "system"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    vendorOwnerId,
    "vendor_approved",
    "vendor",
    vendorId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

interface SendVendorRejectedEmailParams {
  vendorOwnerId: string;
  vendorName: string;
  ownerName: string;
  vendorId: string;
  rejectionReason?: string | null;
}

/**
 * Send vendor rejected email to vendor owner
 */
export async function sendVendorRejectedEmail({
  vendorOwnerId,
  vendorName,
  ownerName,
  vendorId,
  rejectionReason,
}: SendVendorRejectedEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check rate limit
  const withinLimit = await checkEmailRateLimit(vendorOwnerId);
  if (!withinLimit) {
    await logEmailSend(vendorOwnerId, "vendor_rejected", "vendor", vendorId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(vendorOwnerId);
  if (!email) {
    await logEmailSend(vendorOwnerId, "vendor_rejected", "vendor", vendorId, "failed", "No email found");
    return { success: false };
  }

  const { subject, html } = vendorRejectedEmailTemplate({
    vendorName,
    ownerName,
    rejectionReason,
    unsubscribeUrl: getUnsubscribeUrl(vendorOwnerId, "system"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    vendorOwnerId,
    "vendor_rejected",
    "vendor",
    vendorId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}

// ============================================
// Review Email Functions
// ============================================

interface SendNewReviewEmailParams {
  vendorOwnerId: string;
  vendorName: string;
  customerName: string;
  reviewId: string;
  rating: number;
  comment?: string | null;
  eventType?: string | null;
  guestCount?: number | null;
  reviewDate: string;
}

/**
 * Send new review notification email to vendor
 */
export async function sendNewReviewEmail({
  vendorOwnerId,
  vendorName,
  customerName,
  reviewId,
  rating,
  comment,
  eventType,
  guestCount,
  reviewDate,
}: SendNewReviewEmailParams): Promise<{ success: boolean; skipped?: boolean; rateLimited?: boolean }> {
  // Check preference
  const shouldSend = await shouldSendEmail(vendorOwnerId, "review_new_email");
  if (!shouldSend) {
    await logEmailSend(vendorOwnerId, "review_new", "review", reviewId, "skipped");
    return { success: true, skipped: true };
  }

  // Check rate limit
  const withinLimit = await checkEmailRateLimit(vendorOwnerId);
  if (!withinLimit) {
    await logEmailSend(vendorOwnerId, "review_new", "review", reviewId, "skipped", "Rate limited");
    return { success: true, rateLimited: true };
  }

  // Get email
  const email = await getUserEmail(vendorOwnerId);
  if (!email) {
    await logEmailSend(vendorOwnerId, "review_new", "review", reviewId, "failed", "No email found");
    return { success: false };
  }

  const reviewsUrl = `${BASE_URL}/vendor/reviews`;

  const { subject, html } = newReviewEmailTemplate({
    vendorName,
    customerName,
    rating,
    comment,
    eventType,
    guestCount,
    reviewDate,
    reviewsUrl,
    unsubscribeUrl: getUnsubscribeUrl(vendorOwnerId, "review_new"),
  });

  const result = await sendEmail({ to: email, subject, html });

  await logEmailSend(
    vendorOwnerId,
    "review_new",
    "review",
    reviewId,
    result.success ? "sent" : "failed",
    result.success ? undefined : String(result.error)
  );

  return { success: result.success };
}
