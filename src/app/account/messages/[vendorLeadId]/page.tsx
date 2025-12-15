// src/app/account/messages/[vendorLeadId]/page.tsx
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConversationContext } from "@/lib/messages";
import CustomerConversationClient from "./CustomerConversationClient";
import type { MessageWithSender } from "@/types/messaging";

export const metadata: Metadata = {
  title: "Mesaj | Hesabım",
  description: "Firma ile mesajlaşma",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ vendorLeadId: string }>;
}

export default async function CustomerConversationPage({ params }: PageProps) {
  const { vendorLeadId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/messages");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Get conversation context
  const context = await getConversationContext(vendorLeadId);

  if (!context) {
    notFound();
  }

  // Verify this customer owns the conversation
  if (context.lead?.customer_profile_id !== user.id) {
    notFound();
  }

  // Get initial messages
  const { data: messagesResult } = await supabase.rpc(
    "get_vendor_lead_messages",
    {
      p_vendor_lead_id: vendorLeadId,
      p_limit: 50,
      p_offset: 0,
    }
  );

  const messagesData = messagesResult as unknown as {
    ok: boolean;
    data?: {
      messages: MessageWithSender[];
      total_count: number;
      unread_count: number;
      has_more: boolean;
    };
  } | null;

  const initialMessages = messagesData?.data?.messages || [];

  // Mark messages as read
  if (messagesData?.data?.unread_count && messagesData.data.unread_count > 0) {
    await supabase.rpc("mark_messages_read", {
      p_vendor_lead_id: vendorLeadId,
    });
  }

  return (
    <CustomerConversationClient
      vendorLeadId={vendorLeadId}
      initialMessages={initialMessages}
      vendorName={context.vendor?.business_name || "Firma"}
      vendorLogo={context.vendor?.logo_url || null}
      eventDate={context.lead?.event_date || null}
      customerName={profile?.full_name || "Müşteri"}
      userId={user.id}
    />
  );
}
