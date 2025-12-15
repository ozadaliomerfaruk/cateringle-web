// src/app/vendor/messages/[vendorLeadId]/VendorConversationClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import MessageThread from "@/components/MessageThread";
import MessageInput from "@/components/MessageInput";
import QuoteSendForm from "@/components/QuoteSendForm";
import { ArrowLeft, CalendarBlank, User, CurrencyCircleDollar } from "@phosphor-icons/react";
import type { MessageWithSender } from "@/types/messaging";

type Message = MessageWithSender;

interface VendorConversationClientProps {
  vendorLeadId: string;
  initialMessages: Message[];
  customerName: string;
  eventDate: string | null;
  guestCount: number | null;
  vendorName: string;
  userId: string;
}

export default function VendorConversationClient({
  vendorLeadId,
  initialMessages,
  customerName,
  eventDate,
  guestCount,
  vendorName,
  userId,
}: VendorConversationClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

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

          // Don't add if it's our own message (already added optimistically or via trigger)
          if (newMessage.sender_id === userId) {
            // But if it's a quote message (created by trigger), we need to refresh to get quote data
            if (newMessage.message_type === "quote") {
              router.refresh();
            }
            return;
          }

          // Get sender name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMessage.sender_id)
            .single();

          const messageWithMeta: Message = {
            ...newMessage,
            sender_name: profile?.full_name || customerName,
            is_own: false,
            quote: null, // Will be fetched on refresh if needed
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
  }, [vendorLeadId, userId, customerName, router]);

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
        sender_type: "vendor",
        content,
        message_type: "text",
        is_read: false,
        created_at: new Date().toISOString(),
        sender_name: vendorName,
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
    [vendorLeadId, userId, vendorName]
  );

  // Send quote handler
  const handleSendQuote = useCallback(
    async (data: {
      totalPrice: number;
      pricePerPerson?: number;
      message?: string;
      validUntil?: string;
    }) => {
      setError(null);

      try {
        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorLeadId,
            totalPrice: data.totalPrice,
            pricePerPerson: data.pricePerPerson,
            message: data.message,
            validUntil: data.validUntil,
          }),
        });

        const result = await response.json();

        if (!result.ok) {
          setError(result.error?.message || "Teklif gönderilemedi");
          return;
        }

        // Close form and refresh to get the quote message
        setShowQuoteForm(false);
        router.refresh();
      } catch (err) {
        setError("Bağlantı hatası");
        console.error("Send quote error:", err);
      }
    },
    [vendorLeadId, router]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="shrink-0 border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/vendor/messages"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-sm font-semibold text-white">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-900">
                  {customerName}
                </h1>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  {eventDate && (
                    <span className="flex items-center gap-1">
                      <CalendarBlank size={12} />
                      {new Date(eventDate).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  {guestCount && (
                    <span>{guestCount} kişi</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick link to lead */}
          <Link
            href={`/vendor/leads`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <User size={14} />
            Talep
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
          currentUserRole="vendor"
        />

        {/* Quote Form or Input Toggle */}
        {showQuoteForm ? (
          <QuoteSendForm
            vendorLeadId={vendorLeadId}
            guestCount={guestCount || undefined}
            onSend={handleSendQuote}
            onCancel={() => setShowQuoteForm(false)}
          />
        ) : (
          <div className="border-t border-slate-200 bg-white">
            {/* Toggle buttons */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setShowQuoteForm(true)}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium text-leaf-600 transition-colors hover:bg-leaf-50"
              >
                <CurrencyCircleDollar size={18} weight="fill" />
                Teklif Gönder
              </button>
            </div>
            {/* Message input */}
            <MessageInput
              onSend={handleSendMessage}
              disabled={isSending}
              placeholder="Mesaj yazın..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
