// src/components/MessageInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 2000;

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Mesajınızı yazın...",
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedContent);
      setContent("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Message send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const showCharCount = content.length > MAX_LENGTH - 200;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-4"
    >
      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 pr-12 text-sm transition-colors placeholder:text-slate-400 focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              isOverLimit ? "border-red-300" : "border-slate-200"
            }`}
          />

          {/* Character count */}
          {showCharCount && (
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                isOverLimit ? "text-red-500" : "text-slate-400"
              }`}
            >
              {remainingChars}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={
            disabled || isSending || !content.trim() || isOverLimit
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-600 text-white transition-all hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isSending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PaperPlaneRight size={20} weight="fill" />
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-xs text-slate-400">
        Enter ile gönder • Shift+Enter ile yeni satır
      </p>
    </form>
  );
}
