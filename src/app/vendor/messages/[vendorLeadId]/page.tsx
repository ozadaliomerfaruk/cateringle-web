// src/app/vendor/messages/[vendorLeadId]/page.tsx
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConversationContext } from "@/lib/messages";
import VendorConversationClient from "./VendorConversationClient";
import type { MessageWithSender } from "@/types/messaging";

export const metadata: Metadata = {
  title: "Mesaj | Firma Paneli",
  description: "Müşteri ile mesajlaşma",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ vendorLeadId: string }>;
}

export default async function VendorConversationPage({ params }: PageProps) {
  const { vendorLeadId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vendor/messages");
  }

  // Vendor kontrolü
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!vendor) {
    redirect("/auth/register");
  }

  // Get conversation context
  const context = await getConversationContext(vendorLeadId);

  if (!context) {
    notFound();
  }

  // Verify this vendor owns the conversation
  if (context.vendor?.owner_id !== user.id) {
    notFound();
  }

  // Get guest count from lead
  const { data: leadData } = await supabase
    .from("leads")
    .select("guest_count")
    .eq("id", context.leadId)
    .single();

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
    <VendorConversationClient
      vendorLeadId={vendorLeadId}
      initialMessages={initialMessages}
      customerName={context.lead?.customer_name || "Müşteri"}
      eventDate={context.lead?.event_date || null}
      guestCount={leadData?.guest_count || null}
      vendorName={vendor.business_name}
      userId={user.id}
    />
  );
}
