"use client";

import { useEffect, useRef, useCallback } from "react";

// ==============================================
// CLOUDFLARE TURNSTILE REACT COMPONENT
// ==============================================

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onSuccess,
      "error-callback": onError,
      "expired-callback": onExpire,
      theme,
      size,
    });
  }, [siteKey, onSuccess, onError, onExpire, theme, size]);

  useEffect(() => {
    // Script zaten yüklüyse widget'ı render et
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Script zaten eklenmişse bekle
    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;

    // Turnstile script'ini yükle
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Script yüklenince widget'ı render et
      renderWidget();
    };

    script.onerror = () => {
      console.error("Failed to load Turnstile script");
      onError?.("script-load-error");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: Widget'ı kaldır
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, onError]);

  return (
    <div
      ref={containerRef}
      className={`turnstile-container ${className}`}
      data-testid="turnstile"
    />
  );
}

// Reset fonksiyonu (form tekrar gönderildiğinde kullanılır)
export function resetTurnstile(widgetId: string) {
  if (window.turnstile && widgetId) {
    window.turnstile.reset(widgetId);
  }
}

// ==============================================
// USAGE EXAMPLE:
// ==============================================
//
// const [turnstileToken, setTurnstileToken] = useState<string>("");
//
// <Turnstile
//   siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
//   onSuccess={(token) => setTurnstileToken(token)}
//   onError={(error) => console.error("Turnstile error:", error)}
//   onExpire={() => setTurnstileToken("")}
//   theme="auto"
// />
//
// // Form submit'te:
// const response = await fetch("/api/leads", {
//   method: "POST",
//   body: JSON.stringify({ ...formData, turnstileToken }),
// });
