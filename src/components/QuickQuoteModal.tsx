"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import QuickQuoteForm from "./QuickQuoteForm";

interface QuickQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

export default function QuickQuoteModal({
  isOpen,
  onClose,
  vendorId,
  vendorName,
}: QuickQuoteModalProps) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC ile kapat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Kapat"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <h2 className="text-xl font-bold text-slate-900">Hızlı Teklif Al</h2>
          <p className="mt-1 text-sm text-slate-600">
            {vendorName} ile iletişime geçin
          </p>
        </div>

        {/* Form */}
        <QuickQuoteForm
          vendorId={vendorId}
          vendorName={vendorName}
          onSuccess={onClose}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
