/**
 * Email doğrula
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Telefon doğrula (Türkiye)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return (
    cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("0"))
  );
}

/**
 * TC Kimlik No doğrula
 */
export function isValidTCKN(tckn: string): boolean {
  if (!/^\d{11}$/.test(tckn)) return false;
  if (tckn[0] === "0") return false;

  const digits = tckn.split("").map(Number);

  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (oddSum * 7 - evenSum) % 10;
  const digit11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;

  return digits[9] === digit10 && digits[10] === digit11;
}

/**
 * URL doğrula
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Şifre gücü kontrol
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Zayıf", color: "red" };
  if (score <= 4) return { score, label: "Orta", color: "yellow" };
  return { score, label: "Güçlü", color: "green" };
}
