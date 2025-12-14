import "server-only";

// ==============================================
// CLOUDFLARE TURNSTILE VERIFICATION
// https://developers.cloudflare.com/turnstile/
// ==============================================

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

interface VerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Cloudflare Turnstile token'ını doğrula
 * @param token - Client'tan gelen turnstile token
 * @param remoteIp - İsteği yapan IP (opsiyonel ama önerilir)
 */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<VerifyResult> {
  // Secret key yoksa development modunda varsay geçerli
  if (!TURNSTILE_SECRET_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Turnstile secret key not configured, skipping verification in development"
      );
      return { success: true };
    }
    console.error("❌ TURNSTILE_SECRET_KEY is not configured");
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  // Token boşsa reddet
  if (!token) {
    return { success: false, errorCodes: ["missing-token"] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`Turnstile API error: ${response.status}`);
      return { success: false, errorCodes: ["api-error"] };
    }

    const result: TurnstileVerifyResponse = await response.json();

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      errorCodes: result["error-codes"] || ["unknown-error"],
    };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, errorCodes: ["network-error"] };
  }
}

/**
 * Turnstile error codes'u Türkçe mesaja çevir
 */
export function getTurnstileErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return "Güvenlik doğrulaması başarısız oldu.";
  }

  const errorMessages: Record<string, string> = {
    "missing-input-secret": "Sunucu yapılandırma hatası.",
    "invalid-input-secret": "Sunucu yapılandırma hatası.",
    "missing-input-response": "Lütfen güvenlik doğrulamasını tamamlayın.",
    "invalid-input-response": "Güvenlik doğrulaması geçersiz. Lütfen tekrar deneyin.",
    "bad-request": "Geçersiz istek.",
    "timeout-or-duplicate": "Doğrulama süresi doldu. Lütfen sayfayı yenileyip tekrar deneyin.",
    "internal-error": "Geçici bir hata oluştu. Lütfen tekrar deneyin.",
    "missing-token": "Güvenlik doğrulaması eksik.",
    "missing-secret-key": "Sunucu yapılandırma hatası.",
    "api-error": "Güvenlik servisi geçici olarak kullanılamıyor.",
    "network-error": "Bağlantı hatası. Lütfen tekrar deneyin.",
  };

  const firstError = errorCodes[0];
  return errorMessages[firstError] || "Güvenlik doğrulaması başarısız oldu.";
}

// ==============================================
// USAGE EXAMPLE IN API ROUTE:
// ==============================================
// 
// import { verifyTurnstile, getTurnstileErrorMessage } from "@/lib/turnstile";
// 
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const { turnstileToken, ...data } = body;
//   
//   // Verify Turnstile
//   const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
//   const turnstileResult = await verifyTurnstile(turnstileToken, ip);
//   
//   if (!turnstileResult.success) {
//     return NextResponse.json(
//       { error: getTurnstileErrorMessage(turnstileResult.errorCodes) },
//       { status: 400 }
//     );
//   }
//   
//   // Continue with your logic...
// }
