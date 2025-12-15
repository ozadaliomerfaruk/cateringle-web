// src/components/ConversationList.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChatCircle } from "@phosphor-icons/react";
import type { ConversationItem } from "@/types/messaging";

// Re-export for convenience
export type { ConversationItem };

interface ConversationListProps {
  conversations: ConversationItem[];
  basePath: string; // "/vendor/messages" or "/account/messages"
  emptyMessage?: string;
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Şimdi";
  if (diffMins < 60) return `${diffMins} dk`;
  if (diffHours < 24) return `${diffHours} sa`;
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function truncateContent(content: string, maxLength: number = 60): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
}

export default function ConversationList({
  conversations,
  basePath,
  emptyMessage = "Henüz mesajınız yok",
  isLoading = false,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 bg-white p-4"
          >
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <ChatCircle size={32} weight="light" className="text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
        <p className="mt-1 text-xs text-slate-400">
          Bir talep üzerinden mesajlaşma başlatabilirsiniz
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isVendor = conversation.user_role === "vendor";
        const displayName = isVendor
          ? conversation.customer_name
          : conversation.business_name;
        const hasUnread = conversation.unread_count > 0;

        return (
          <Link
            key={conversation.vendor_lead_id}
            href={`${basePath}/${conversation.vendor_lead_id}`}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-leaf-200 hover:bg-leaf-50/50 ${
              hasUnread
                ? "border-leaf-200 bg-leaf-50/30"
                : "border-slate-100 bg-white"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {conversation.logo_url ? (
                <Image
                  src={conversation.logo_url}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-leaf-500 to-teal-600 text-lg font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Unread badge */}
              {hasUnread && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-leaf-600 px-1.5 text-xs font-bold text-white">
                  {conversation.unread_count > 9
                    ? "9+"
                    : conversation.unread_count}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={`truncate text-sm ${
                    hasUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                  }`}
                >
                  {displayName}
                </h3>
                {conversation.last_message && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatRelativeTime(conversation.last_message.created_at)}
                  </span>
                )}
              </div>

              {/* Last message preview */}
              {conversation.last_message ? (
                <p
                  className={`mt-0.5 truncate text-sm ${
                    hasUnread ? "font-medium text-slate-600" : "text-slate-500"
                  }`}
                >
                  {conversation.last_message.sender_type ===
                  conversation.user_role
                    ? "Sen: "
                    : ""}
                  {truncateContent(conversation.last_message.content)}
                </p>
              ) : (
                <p className="mt-0.5 text-sm italic text-slate-400">
                  Henüz mesaj yok
                </p>
              )}

              {/* Event date badge */}
              {conversation.event_date && (
                <p className="mt-1 text-xs text-slate-400">
                  Etkinlik:{" "}
                  {new Date(conversation.event_date).toLocaleDateString(
                    "tr-TR",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
