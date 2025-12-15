"use client";

// src/components/PWAInstallPrompt.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { X, DownloadSimple, DeviceMobile } from "@phosphor-icons/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Check conditions outside component to avoid hydration issues
function checkIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-expect-error - MSStream check for IE
    !window.MSStream
  );
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error - navigator.standalone is iOS Safari specific
    window.navigator?.standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only check after mount to avoid hydration mismatch
  const isIOS = useMemo(() => (mounted ? checkIsIOS() : false), [mounted]);
  const isStandalone = useMemo(
    () => (mounted ? checkIsStandalone() : false),
    [mounted]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isStandalone) {
      return;
    }

    // Check if prompt was dismissed recently
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < weekInMs) {
        return;
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show custom prompt after delay
    if (isIOS) {
      const visitCount = parseInt(
        localStorage.getItem("pwa-visit-count") || "0",
        10
      );
      localStorage.setItem("pwa-visit-count", String(visitCount + 1));

      if (visitCount >= 2) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [mounted, isStandalone, isIOS]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      setShowPrompt(false);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", String(Date.now()));
  }, []);

  if (!mounted || !showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-leaf-100">
            <DeviceMobile size={28} className="text-leaf-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">
              Cateringle&apos;ı Yükle
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Ana ekranınıza ekleyerek daha hızlı erişin.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              <span className="font-medium">iOS&apos;ta yüklemek için:</span>
            </p>
            <ol className="mt-2 space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
                  1
                </span>
                Safari&apos;de paylaş butonuna{" "}
                <span className="text-lg">⬆️</span> tıklayın
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium">
                  2
                </span>
                &quot;Ana Ekrana Ekle&quot; seçin
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="mt-3 w-full rounded-lg bg-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Anladım
            </button>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Şimdi Değil
            </button>
            <button
              onClick={handleInstall}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-leaf-600 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              <DownloadSimple size={18} />
              Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
