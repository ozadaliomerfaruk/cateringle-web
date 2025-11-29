"use client";

import { useState } from "react";

interface QuoteActionsProps {
  quoteId: string;
  respondAction: (formData: FormData) => Promise<void>;
}

export default function QuoteActions({
  quoteId,
  respondAction,
}: QuoteActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const handleAccept = async () => {
    if (!confirm("Bu teklifi kabul etmek istediğinize emin misiniz?")) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("quote_id", quoteId);
    formData.append("action", "accept");
    await respondAction(formData);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("quote_id", quoteId);
    formData.append("action", "reject");
    formData.append("note", rejectNote);
    await respondAction(formData);
    setLoading(false);
    setShowRejectModal(false);
  };

  return (
    <>
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 rounded-xl bg-emerald-600 py-4 text-center font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "İşleniyor..." : "✓ Teklifi Kabul Et"}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-4 text-center font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Reddet
        </button>
      </div>

      {/* Reddetme Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Teklifi Reddet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Bu teklifi reddetmek istediğinize emin misiniz? İsterseniz firmaya
              bir not bırakabilirsiniz.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="İsteğe bağlı not... (örn: bütçemiz uygun değil)"
              rows={3}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                {loading ? "İşleniyor..." : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
