// src/app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/email-templates";

const UNSUBSCRIBE_SECRET =
  process.env.UNSUBSCRIBE_SECRET || "default-secret-change-me";

// Email type to preference column mapping
const EMAIL_TYPE_TO_PREFERENCE: Record<string, string> = {
  message_new: "message_new_email",
  quote_received: "quote_received_email",
  quote_accepted: "quote_accepted_email",
  quote_rejected: "quote_rejected_email",
  lead_new: "lead_new_email",
  review_new: "review_new_email",
  booking_reminder: "booking_reminder_email",
  system: "system_email",
  all: "all", // Special case - disable all emails
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_TOKEN", message: "Token gerekli" } },
        { status: 400 }
      );
    }

    // Verify token
    const { valid, userId, emailType } = verifyUnsubscribeToken(
      token,
      UNSUBSCRIBE_SECRET
    );

    if (!valid || !userId || !emailType) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Geçersiz veya süresi dolmuş link",
          },
        },
        { status: 400 }
      );
    }

    // Get preference column
    const preferenceColumn = EMAIL_TYPE_TO_PREFERENCE[emailType];
    if (!preferenceColumn) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVALID_TYPE", message: "Geçersiz bildirim türü" },
        },
        { status: 400 }
      );
    }

    // Update preference
    if (preferenceColumn === "all") {
      // Disable all email notifications
      const { error } = await supabaseAdmin
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          lead_new_email: false,
          quote_received_email: false,
          quote_accepted_email: false,
          quote_rejected_email: false,
          message_new_email: false,
          review_new_email: false,
          booking_reminder_email: false,
          system_email: false,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } else {
      // Disable specific email type
      const { error } = await supabaseAdmin
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          [preferenceColumn]: false,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    // Return success
    return NextResponse.json({
      ok: true,
      data: {
        userId,
        emailType,
        message: "Bildirim tercihiniz güncellendi",
      },
    });
  } catch (error) {
    console.error("[Unsubscribe API Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SERVER_ERROR", message: "Bir hata oluştu" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for form submissions
  return GET(request);
}
