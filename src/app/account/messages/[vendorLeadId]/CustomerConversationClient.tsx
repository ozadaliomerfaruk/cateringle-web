// src/app/account/messages/[vendorLeadId]/CustomerConversationClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import MessageThread from "@/components/MessageThread";
import MessageInput from "@/components/MessageInput";
import { ArrowLeft, CalendarBlank, Storefront } from "@phosphor-icons/react";
import type { MessageWithSender } from "@/types/messaging";

type Message = MessageWithSender;

interface CustomerConversationClientProps {
  vendorLeadId: string;
  initialMessages: Message[];
  vendorName: string;
  vendorLogo: string | null;
  eventDate: string | null;
  customerName: string;
  userId: string;
}

export default function CustomerConversationClient({
  vendorLeadId,
  initialMessages,
  vendorName,
  vendorLogo,
  eventDate,
  customerName,
  userId,
}: CustomerConversationClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const channel = supabase
      .channel(`messages:${vendorLeadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vendor_lead_messages",
          filter: `vendor_lead_id=eq.${vendorLeadId}`,
        },
        async (payload) => {
          const newMessage = payload.new as {
            id: string;
            sender_id: string;
            sender_type: "vendor" | "customer";
            content: string;
            message_type: "text" | "quote";
            quote_id: string | null;
            is_read: boolean;
            created_at: string;
          };

          // If it's a quote message, refresh to get quote data
          if (newMessage.message_type === "quote") {
            router.refresh();
            return;
          }

          // Don't add if it's our own message (already added optimistically)
          if (newMessage.sender_id === userId) return;

          // Get sender name (vendor name is already known)
          const messageWithMeta: Message = {
            ...newMessage,
            sender_name: vendorName,
            is_own: false,
            quote: null,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, messageWithMeta];
          });

          // Mark as read
          await fetch("/api/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendorLeadId }),
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vendor_lead_messages",
          filter: `vendor_lead_id=eq.${vendorLeadId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; is_read: boolean };
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id ? { ...m, is_read: updated.is_read } : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorLeadId, userId, vendorName, router]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (content: string) => {
      setError(null);
      setIsSending(true);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        sender_id: userId,
        sender_type: "customer",
        content,
        message_type: "text",
        is_read: false,
        created_at: new Date().toISOString(),
        sender_name: customerName,
        is_own: true,
        quote: null,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorLeadId, content }),
        });

        const result = await response.json();

        if (!result.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setError(result.error?.message || "Mesaj gönderilemedi");
          return;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, id: result.data.message_id } : m
          )
        );
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError("Bağlantı hatası");
        console.error("Send message error:", err);
      } finally {
        setIsSending(false);
      }
    },
    [vendorLeadId, userId, customerName]
  );

  // Quote accept handler
  const handleQuoteAccept = useCallback(
    async (quoteId: string) => {
      setError(null);
      try {
        const response = await fetch(`/api/quotes/${quoteId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "accepted" }),
        });

        const result = await response.json();

        if (!result.ok) {
          setError(result.error?.message || "Teklif kabul edilemedi");
          return;
        }

        // Refresh to get updated messages (trigger creates a new message)
        router.refresh();
      } catch (err) {
        setError("Bağlantı hatası");
        console.error("Quote accept error:", err);
      }
    },
    [router]
  );

  // Quote reject handler
  const handleQuoteReject = useCallback(
    async (quoteId: string) => {
      setError(null);
      try {
        const response = await fetch(`/api/quotes/${quoteId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });

        const result = await response.json();

        if (!result.ok) {
          setError(result.error?.message || "Teklif reddedilemedi");
          return;
        }

        // Refresh to get updated messages
        router.refresh();
      } catch (err) {
        setError("Bağlantı hatası");
        console.error("Quote reject error:", err);
      }
    },
    [router]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="shrink-0 border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/account/messages"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {vendorLogo ? (
                <Image
                  src={vendorLogo}
                  alt={vendorName}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-leaf-500 to-teal-600 text-sm font-semibold text-white">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-900">
                  {vendorName}
                </h1>
                {eventDate && (
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarBlank size={12} />
                    {new Date(eventDate).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick link to quotes */}
          <Link
            href="/account/quotes"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Storefront size={14} />
            Teklifler
          </Link>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2">
          <p className="text-center text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
        <MessageThread
          messages={messages}
          currentUserRole="customer"
          onQuoteAccept={handleQuoteAccept}
          onQuoteReject={handleQuoteReject}
        />

        {/* Input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={isSending}
          placeholder="Firmaya mesaj yazın..."
        />
      </div>
    </div>
  );
}
