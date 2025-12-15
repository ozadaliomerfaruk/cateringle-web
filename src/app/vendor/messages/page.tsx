// src/app/vendor/messages/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ConversationList from "@/components/ConversationList";
import type { ConversationItem } from "@/types/messaging";
import { ChatCircle, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Mesajlar | Firma Paneli",
  description: "Müşterilerinizle mesajlaşın",
};

export const dynamic = "force-dynamic";

export default async function VendorMessagesPage() {
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

  // Get conversations via RPC
  const { data: result, error } = await supabase.rpc(
    "get_message_conversations",
    {
      p_limit: 50,
      p_offset: 0,
    }
  );

  if (error) {
    console.error("get_message_conversations error:", error);
  }

  const conversationsData = result as unknown as {
    ok: boolean;
    data?: {
      conversations: ConversationItem[];
      total_count: number;
      has_more: boolean;
    };
  } | null;

  const conversations = conversationsData?.data?.conversations || [];
  const totalCount = conversationsData?.data?.total_count || 0;

  // Unread count
  const { data: unreadResult } = await supabase.rpc("get_unread_message_count");
  const unreadCount =
    (unreadResult as { ok: boolean; data?: { unread_count: number } })?.data
      ?.unread_count || 0;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/vendor"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <ArrowLeft size={20} weight="bold" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Mesajlar
                </h1>
                <p className="text-sm text-slate-500">
                  {totalCount > 0
                    ? `${totalCount} görüşme${
                        unreadCount > 0 ? ` • ${unreadCount} okunmamış` : ""
                      }`
                    : "Müşterilerinizle mesajlaşın"}
                </p>
              </div>
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="flex h-8 items-center gap-1.5 rounded-full bg-leaf-100 px-3 text-sm font-medium text-leaf-700">
                <ChatCircle size={16} weight="fill" />
                {unreadCount} yeni
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ConversationList
          conversations={conversations}
          basePath="/vendor/messages"
          emptyMessage="Henüz mesajınız yok"
        />

        {/* Load more hint */}
        {conversationsData?.data?.has_more && (
          <p className="mt-4 text-center text-sm text-slate-400">
            Daha fazla görüşme için aşağı kaydırın
          </p>
        )}
      </div>
    </main>
  );
}
