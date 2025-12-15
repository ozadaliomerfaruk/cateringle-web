// src/components/MessageThread.tsx
"use client";

import { useEffect, useRef } from "react";
import { Check, CheckCircle } from "@phosphor-icons/react";
import type { MessageWithSender } from "@/types/messaging";
import QuoteCard from "./QuoteCard";

// Re-export for convenience
export type Message = MessageWithSender;

interface MessageThreadProps {
  messages: Message[];
  currentUserRole: "vendor" | "customer";
  isLoading?: boolean;
  onQuoteAccept?: (quoteId: string) => Promise<void>;
  onQuoteReject?: (quoteId: string) => Promise<void>;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return timeStr;
  } else if (diffDays === 1) {
    return `Dün ${timeStr}`;
  } else if (diffDays < 7) {
    const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" });
    return `${dayName} ${timeStr}`;
  } else {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export default function MessageThread({
  messages,
  currentUserRole,
  isLoading = false,
  onQuoteAccept,
  onQuoteReject,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-leaf-600" />
          <p className="text-sm text-slate-500">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">Henüz mesaj yok</p>
          <p className="mt-1 text-xs text-slate-500">
            {currentUserRole === "vendor"
              ? "Müşterinize mesaj veya teklif gönderin"
              : "Firmaya mesaj gönderin"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 space-y-3 overflow-y-auto p-4"
    >
      {messages.map((message, index) => {
        const isOwn = message.is_own;
        const isQuote = message.message_type === "quote" && message.quote;
        const showDateSeparator =
          index === 0 ||
          new Date(message.created_at).toDateString() !==
            new Date(messages[index - 1].created_at).toDateString();

        return (
          <div key={message.id}>
            {/* Date separator */}
            {showDateSeparator && (
              <div className="my-4 flex items-center justify-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {new Date(message.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year:
                      new Date(message.created_at).getFullYear() !==
                      new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  })}
                </span>
              </div>
            )}

            {/* Quote Card or Regular Message */}
            <div
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {isQuote && message.quote ? (
                /* Quote Card */
                <div className="max-w-[85%]">
                  <QuoteCard
                    quote={message.quote}
                    userRole={currentUserRole}
                    isOwnMessage={isOwn}
                    onAccept={onQuoteAccept}
                    onReject={onQuoteReject}
                  />
                  {/* Time below quote card */}
                  <p
                    className={`mt-1 text-xs ${
                      isOwn ? "text-right text-slate-400" : "text-left text-slate-400"
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              ) : (
                /* Regular Message Bubble */
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? "rounded-br-md bg-leaf-600 text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-900"
                  }`}
                >
                  {/* Sender name for received messages */}
                  {!isOwn && message.sender_name && (
                    <p
                      className={`mb-1 text-xs font-medium ${
                        isOwn ? "text-leaf-100" : "text-slate-500"
                      }`}
                    >
                      {message.sender_name}
                    </p>
                  )}

                  {/* Message content */}
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </p>

                  {/* Time and read status */}
                  <div
                    className={`mt-1.5 flex items-center justify-end gap-1 ${
                      isOwn ? "text-leaf-100" : "text-slate-400"
                    }`}
                  >
                    <span className="text-xs">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {isOwn && (
                      <span className="ml-0.5">
                        {message.is_read ? (
                          <CheckCircle size={14} weight="fill" />
                        ) : (
                          <Check size={14} weight="bold" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
