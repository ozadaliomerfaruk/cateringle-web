// src/lib/messages.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import type {
  MessageSenderType,
  ApiResponse,
  SendMessageResponse,
  ConversationContext,
} from "@/types/messaging";

// Re-export types for convenience
export type {
  MessageWithSender as Message,
  ConversationItem as Conversation,
  ApiResponse,
  SendMessageResponse,
  GetMessagesResponse,
  GetConversationsResponse,
  ConversationContext,
} from "@/types/messaging";

// Result types using ApiResponse wrapper
export type SendMessageResult = ApiResponse<SendMessageResponse>;
export type GetMessagesResult = ApiResponse<{
  messages: Array<{
    id: string;
    sender_id: string;
    sender_type: MessageSenderType;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name: string | null;
    is_own: boolean;
  }>;
  total_count: number;
  unread_count: number;
  has_more: boolean;
}>;
export type GetConversationsResult = ApiResponse<{
  conversations: Array<{
    vendor_lead_id: string;
    last_message_at: string;
    vendor_id: string;
    business_name: string;
    logo_url: string | null;
    lead_id: string;
    customer_name: string;
    event_date: string | null;
    last_message: {
      content: string;
      sender_type: MessageSenderType;
      created_at: string;
      is_read: boolean;
    } | null;
    unread_count: number;
    user_role: MessageSenderType;
  }>;
  total_count: number;
  has_more: boolean;
}>;

// ============================================
// Server-side Functions (for API routes)
// ============================================

/**
 * Send a message and create notification for recipient
 * Called from API route after auth validation
 */
export async function sendMessageWithNotification(
  vendorLeadId: string,
  content: string,
  senderUserId: string
): Promise<SendMessageResult> {
  // Get conversation context first
  const context = await getConversationContext(vendorLeadId);
  if (!context) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Görüşme bulunamadı" },
    };
  }

  // Determine sender type
  const isVendorOwner = context.vendor?.owner_id === senderUserId;
  const isCustomer = context.lead?.customer_profile_id === senderUserId;

  if (!isVendorOwner && !isCustomer) {
    return {
      ok: false,
      error: { code: "FORBIDDEN", message: "Bu görüşmeye erişiminiz yok" },
    };
  }

  const senderType = isVendorOwner ? "vendor" : "customer";
  const recipientId = isVendorOwner
    ? context.lead?.customer_profile_id
    : context.vendor?.owner_id;

  // Insert message using admin client
  const { data: message, error } = await supabaseAdmin
    .from("vendor_lead_messages")
    .insert({
      vendor_lead_id: vendorLeadId,
      sender_id: senderUserId,
      sender_type: senderType,
      content: content.trim(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("sendMessageWithNotification insert error:", error);
    return {
      ok: false,
      error: { code: "SERVER_ERROR", message: "Mesaj gönderilemedi" },
    };
  }

  // Create notification for recipient (if they exist)
  if (recipientId) {
    const notificationTitle =
      senderType === "vendor" ? "Yeni Mesaj Aldınız" : "Yeni Müşteri Mesajı";

    const truncatedContent =
      content.length > 100 ? content.substring(0, 100) + "..." : content;

    const actionUrl =
      senderType === "vendor"
        ? `/account/messages/${vendorLeadId}`
        : `/vendor/messages/${vendorLeadId}`;

    // Fire and forget - don't block on notification
    createNotification({
      userId: recipientId,
      type: "message_new",
      title: notificationTitle,
      message: truncatedContent,
      entityType: "vendor_lead",
      entityId: vendorLeadId,
      actionUrl,
    }).catch((err) => console.error("Message notification error:", err));
  }

  return {
    ok: true,
    data: {
      message_id: message.id,
      recipient_id: recipientId || "",
      sender_type: senderType,
      vendor_lead_id: vendorLeadId,
    },
  };
}

/**
 * Get conversation context for a vendor_lead
 * Used to validate access and get participant info
 */
export async function getConversationContext(vendorLeadId: string) {
  const { data, error } = await supabaseAdmin
    .from("vendor_leads")
    .select(
      `
      id,
      vendor_id,
      lead_id,
      status,
      vendor:vendors (
        id,
        owner_id,
        business_name,
        logo_url
      ),
      lead:leads (
        id,
        customer_profile_id,
        customer_name,
        customer_email,
        event_date
      )
    `
    )
    .eq("id", vendorLeadId)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    vendorLeadId: data.id,
    vendorId: data.vendor_id,
    leadId: data.lead_id,
    status: data.status,
    vendor: data.vendor as {
      id: string;
      owner_id: string;
      business_name: string;
      logo_url: string | null;
    },
    lead: data.lead as {
      id: string;
      customer_profile_id: string | null;
      customer_name: string;
      customer_email: string;
      event_date: string | null;
    },
  };
}

/**
 * Check if a user can access a conversation
 */
export async function canUserAccessConversation(
  userId: string,
  vendorLeadId: string
): Promise<boolean> {
  const context = await getConversationContext(vendorLeadId);
  if (!context) return false;

  const isVendorOwner = context.vendor?.owner_id === userId;
  const isCustomer = context.lead?.customer_profile_id === userId;

  return isVendorOwner || isCustomer;
}

/**
 * Get user's role in a conversation
 */
export async function getUserRoleInConversation(
  userId: string,
  vendorLeadId: string
): Promise<"vendor" | "customer" | null> {
  const context = await getConversationContext(vendorLeadId);
  if (!context) return null;

  if (context.vendor?.owner_id === userId) return "vendor";
  if (context.lead?.customer_profile_id === userId) return "customer";

  return null;
}