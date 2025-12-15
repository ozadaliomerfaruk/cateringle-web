// src/lib/email-templates/base.ts
import "server-only";
import { inlineStyles } from "./styles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cateringle.com";

export interface BaseTemplateOptions {
  /** Header background style: 'orange' | 'green' | 'red' | 'blue' */
  headerStyle?: "orange" | "green" | "red" | "blue";
  /** Header emoji + title */
  headerEmoji?: string;
  headerTitle: string;
  headerSubtitle?: string;
  /** Main content HTML */
  content: string;
  /** Optional footer note */
  footerNote?: string;
  /** Unsubscribe link (null to hide) */
  unsubscribeUrl?: string | null;
  /** Unsubscribe text */
  unsubscribeText?: string;
}

/**
 * Base email template wrapper
 * Tüm email'ler bu wrapper'ı kullanır
 */
export function baseEmailTemplate({
  headerStyle = "orange",
  headerEmoji = "",
  headerTitle,
  headerSubtitle,
  content,
  footerNote,
  unsubscribeUrl,
  unsubscribeText = "Bu tür bildirimleri almak istemiyorsanız",
}: BaseTemplateOptions): string {
  const headerStyles: Record<string, string> = {
    orange: inlineStyles.headerOrange,
    green: inlineStyles.headerGreen,
    red: inlineStyles.headerRed,
    blue: inlineStyles.headerBlue,
  };

  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${headerTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="${inlineStyles.body}">
  <div style="${inlineStyles.wrapper}">
    <div style="${inlineStyles.container}">
      <!-- Header -->
      <div style="${headerStyles[headerStyle]}">
        <h1 style="${inlineStyles.h1}">${headerEmoji ? `${headerEmoji} ` : ""}${headerTitle}</h1>
        ${headerSubtitle ? `<p style="${inlineStyles.subtitle}">${headerSubtitle}</p>` : ""}
      </div>
      
      <!-- Content -->
      <div style="${inlineStyles.content}">
        ${content}
      </div>
      
      <!-- Footer -->
      <div style="${inlineStyles.footer}">
        ${footerNote ? `<p style="${inlineStyles.footerText}; margin-bottom: 12px;">${footerNote}</p>` : ""}
        <p style="${inlineStyles.footerText}">
          Bu e-posta <a href="${BASE_URL}" style="${inlineStyles.footerLink}">Cateringle.com</a> tarafından gönderilmiştir.
        </p>
        <p style="${inlineStyles.footerText}; margin-top: 4px;">
          © ${year} Cateringle.com - Tüm hakları saklıdır.
        </p>
        ${
          unsubscribeUrl
            ? `
        <div style="${inlineStyles.unsubscribe}">
          <a href="${unsubscribeUrl}" style="${inlineStyles.unsubscribeLink}">
            ${unsubscribeText} buraya tıklayın
          </a>
        </div>
        `
            : ""
        }
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Simple info row component
 */
export function infoRow(label: string, value: string): string {
  return `
    <div style="${inlineStyles.infoRow}">
      <div style="${inlineStyles.infoLabel}">${label}</div>
      <div style="${inlineStyles.infoValue}">${value}</div>
    </div>
  `;
}

/**
 * CTA button component
 */
export function ctaButton(
  text: string,
  url: string,
  style: "orange" | "green" = "orange"
): string {
  const buttonStyle = style === "green" ? inlineStyles.ctaGreen : inlineStyles.cta;
  return `
    <div style="${inlineStyles.ctaCenter}">
      <a href="${url}" style="${buttonStyle}">${text}</a>
    </div>
  `;
}

/**
 * Message box component
 */
export function messageBox(content: string): string {
  return `
    <div style="${inlineStyles.messageBox}">
      ${content}
    </div>
  `;
}

/**
 * Price box component
 */
export function priceBox(
  amount: string,
  detail?: string
): string {
  return `
    <div style="${inlineStyles.priceBox}">
      <div style="${inlineStyles.priceMain}">${amount} ₺</div>
      ${detail ? `<div style="${inlineStyles.priceDetail}">${detail}</div>` : ""}
    </div>
  `;
}

/**
 * Note/warning box component
 */
export function noteBox(content: string): string {
  return `
    <div style="${inlineStyles.note}">
      ${content}
    </div>
  `;
}

/**
 * Status badge component
 */
export function statusBadge(
  text: string,
  type: "success" | "error" | "warning" | "info" = "info"
): string {
  const styles: Record<string, string> = {
    success: inlineStyles.badgeSuccess,
    error: inlineStyles.badgeError,
    warning: `display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; background: #fef3c7; color: #92400e;`,
    info: `display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; background: #dbeafe; color: #1e40af;`,
  };

  return `<span style="${styles[type]}">${text}</span>`;
}
