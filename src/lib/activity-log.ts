// src/lib/activity-log.ts
import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { headers } from "next/headers";

// Activity log tipleri
export type ActivityAction =
  // Auth işlemleri
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.password_reset"
  // Vendor işlemleri
  | "vendor.create"
  | "vendor.update"
  | "vendor.delete"
  | "vendor.approve"
  | "vendor.reject"
  | "vendor.suspend"
  // Lead işlemleri
  | "lead.create"
  | "lead.update"
  | "lead.delete"
  // Quote işlemleri
  | "quote.create"
  | "quote.send"
  | "quote.accept"
  | "quote.reject"
  // Review işlemleri
  | "review.create"
  | "review.approve"
  | "review.reject"
  | "review.delete"
  // Admin işlemleri
  | "admin.user_role_change"
  | "admin.settings_update"
  | "admin.bulk_action";

export type EntityType =
  | "user"
  | "vendor"
  | "lead"
  | "quote"
  | "review"
  | "settings";

export type ActorType = "user" | "service" | "system";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  actorType?: ActorType;
  actorId?: string;
}

/**
 * IP adresini al
 */
async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    return (
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * PII verilerini temizle (activity log'a yazılmadan önce)
 */
function sanitizePII(
  data: Record<string, unknown> | undefined
): Record<string, unknown> | null {
  if (!data) return null;

  const piiFields = [
    "password",
    "email",
    "phone",
    "customer_phone",
    "customer_email",
    "full_name",
    "customer_name",
    "address",
    "credit_card",
    "ssn",
    "tc_kimlik",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (piiFields.some((field) => key.toLowerCase().includes(field))) {
      // PII alanları için sadece varlığını belirt
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      // Nested object'leri de temizle
      sanitized[key] = sanitizePII(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Activity log kaydı oluştur
 */
export async function logActivity({
  action,
  entityType,
  entityId,
  oldData,
  newData,
  actorType = "user",
  actorId,
}: LogActivityParams): Promise<boolean> {
  try {
    // Actor ID'yi al (yoksa mevcut kullanıcıyı kullan)
    let finalActorId = actorId;
    if (!finalActorId && actorType === "user") {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      finalActorId = user?.id || undefined;
    }

    const ipAddress = await getClientIp();

    // Admin client ile log yaz (RLS bypass)
    const { error } = await supabaseAdmin.from("activity_logs").insert({
      actor_id: finalActorId || null,
      actor_type: actorType,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_data: sanitizePII(oldData),
      new_data: sanitizePII(newData),
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Activity log error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Activity log exception:", error);
    return false;
  }
}

/**
 * Batch activity log - birden fazla kaydı tek seferde yaz
 */
export async function logActivities(
  logs: LogActivityParams[]
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ipAddress = await getClientIp();

    const records = logs.map((log) => ({
      actor_id: log.actorId || user?.id || null,
      actor_type: log.actorType || "user",
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      old_data: sanitizePII(log.oldData),
      new_data: sanitizePII(log.newData),
      ip_address: ipAddress,
    }));

    const { error } = await supabaseAdmin.from("activity_logs").insert(records);

    if (error) {
      console.error("Batch activity log error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Batch activity log exception:", error);
    return false;
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Vendor işlemlerini logla
 */
export async function logVendorActivity(
  action: "create" | "update" | "delete" | "approve" | "reject" | "suspend",
  vendorId: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  return logActivity({
    action: `vendor.${action}` as ActivityAction,
    entityType: "vendor",
    entityId: vendorId,
    oldData,
    newData,
  });
}

/**
 * Lead işlemlerini logla
 */
export async function logLeadActivity(
  action: "create" | "update" | "delete",
  leadId: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  return logActivity({
    action: `lead.${action}` as ActivityAction,
    entityType: "lead",
    entityId: leadId,
    oldData,
    newData,
  });
}

/**
 * Quote işlemlerini logla
 */
export async function logQuoteActivity(
  action: "create" | "send" | "accept" | "reject",
  quoteId: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  return logActivity({
    action: `quote.${action}` as ActivityAction,
    entityType: "quote",
    entityId: quoteId,
    oldData,
    newData,
  });
}

/**
 * Review işlemlerini logla
 */
export async function logReviewActivity(
  action: "create" | "approve" | "reject" | "delete",
  reviewId: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  return logActivity({
    action: `review.${action}` as ActivityAction,
    entityType: "review",
    entityId: reviewId,
    oldData,
    newData,
  });
}

/**
 * Admin işlemlerini logla
 */
export async function logAdminActivity(
  action: "user_role_change" | "settings_update" | "bulk_action",
  entityType: EntityType,
  entityId?: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  return logActivity({
    action: `admin.${action}` as ActivityAction,
    entityType,
    entityId,
    oldData,
    newData,
  });
}
