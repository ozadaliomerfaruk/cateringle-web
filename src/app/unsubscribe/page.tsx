// src/app/unsubscribe/page.tsx
import Link from "next/link";
import { CheckCircle, XCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cateringle.com";

// Email type labels
const EMAIL_TYPE_LABELS: Record<string, string> = {
  message_new: "Yeni mesaj bildirimleri",
  quote_received: "Yeni teklif bildirimleri",
  quote_accepted: "Teklif kabul bildirimleri",
  quote_rejected: "Teklif red bildirimleri",
  lead_new: "Yeni talep bildirimleri",
  review_new: "Yeni yorum bildirimleri",
  booking_reminder: "Rezervasyon hatırlatmaları",
  system: "Sistem bildirimleri",
  all: "Tüm e-posta bildirimleri",
};

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

async function processUnsubscribe(
  token: string
): Promise<{
  success: boolean;
  emailType?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (result.ok) {
      return {
        success: true,
        emailType: result.data.emailType,
      };
    }

    return {
      success: false,
      error: result.error?.message || "Bilinmeyen hata",
    };
  } catch (_error) {
    return {
      success: false,
      error: "İşlem sırasında bir hata oluştu",
    };
  }
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token } = await searchParams;

  // No token provided
  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <WarningCircle size={32} className="text-yellow-600" weight="fill" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            Geçersiz Link
          </h1>
          <p className="mb-6 text-slate-600">
            Bu link geçerli değil veya eksik. E-postadaki linke tekrar tıklamayı deneyin.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-leaf-600 px-6 py-3 font-medium text-white hover:bg-leaf-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  // Process unsubscribe
  const result = await processUnsubscribe(token);

  // Success
  if (result.success) {
    const emailTypeLabel =
      EMAIL_TYPE_LABELS[result.emailType || ""] || "Bu tür bildirimler";

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={32} className="text-green-600" weight="fill" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            Abonelikten Çıkıldı
          </h1>
          <p className="mb-2 text-slate-600">
            <strong>{emailTypeLabel}</strong> artık size gönderilmeyecek.
          </p>
          <p className="mb-6 text-sm text-slate-500">
            Bildirim tercihlerinizi istediğiniz zaman hesap ayarlarından güncelleyebilirsiniz.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account/notifications"
              className="rounded-lg border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Bildirim Ayarları
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-leaf-600 px-6 py-3 font-medium text-white hover:bg-leaf-700"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle size={32} className="text-red-600" weight="fill" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          İşlem Başarısız
        </h1>
        <p className="mb-6 text-slate-600">
          {result.error || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/notifications"
            className="rounded-lg border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Bildirim Ayarları
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-leaf-600 px-6 py-3 font-medium text-white hover:bg-leaf-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
