// src/lib/email-templates/index.ts
import "server-only";

// Helpers
export {
  escapeHtml,
  formatPrice,
  formatDate,
  formatDateTime,
  formatMessageContent,
  isValidUrl,
  safeUrl,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
} from "./helpers";

// Base components
export {
  baseEmailTemplate,
  infoRow,
  ctaButton,
  messageBox,
  priceBox,
  noteBox,
  statusBadge,
  type BaseTemplateOptions,
} from "./base";

// Styles
export { emailStyles, inlineStyles } from "./styles";

// Templates
export {
  newMessageEmailTemplate,
  messageDigestEmailTemplate,
} from "./new-message";

export {
  quoteAcceptedEmailTemplate,
  quoteRejectedEmailTemplate,
  newQuoteEmailTemplate,
} from "./quote-status";

export {
  vendorApprovedEmailTemplate,
  vendorRejectedEmailTemplate,
} from "./vendor-approved";
