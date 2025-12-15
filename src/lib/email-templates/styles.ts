// src/lib/email-templates/styles.ts
import "server-only";

/**
 * Shared CSS for all email templates
 * Email client uyumluluğu için inline styles
 */
export const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1e293b;
    margin: 0;
    padding: 0;
    background-color: #f1f5f9;
    -webkit-font-smoothing: antialiased;
  }
  
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .container {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    padding: 24px 32px;
    text-align: center;
  }
  
  .header-orange {
    background: linear-gradient(135deg, #FF6B35 0%, #f97316 100%);
    color: #ffffff;
  }
  
  .header-green {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
  }
  
  .header-red {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: #ffffff;
  }
  
  .header-blue {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #ffffff;
  }
  
  .header h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  
  .header p {
    margin: 8px 0 0 0;
    opacity: 0.9;
    font-size: 14px;
  }
  
  .content {
    padding: 32px;
  }
  
  .greeting {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .message-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #FF6B35;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
  }
  
  .info-grid {
    margin: 20px 0;
  }
  
  .info-row {
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .info-row:last-child {
    border-bottom: none;
  }
  
  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 15px;
    color: #1e293b;
  }
  
  .price-box {
    background: #fff7ed;
    border: 2px solid #FF6B35;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
    text-align: center;
  }
  
  .price-main {
    font-size: 36px;
    font-weight: 700;
    color: #FF6B35;
  }
  
  .price-detail {
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }
  
  .badge-success {
    background: #dcfce7;
    color: #166534;
  }
  
  .badge-error {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .badge-warning {
    background: #fef3c7;
    color: #92400e;
  }
  
  .badge-info {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .cta {
    display: inline-block;
    background: #FF6B35;
    color: #ffffff !important;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    margin-top: 24px;
  }
  
  .cta:hover {
    background: #ea580c;
  }
  
  .cta-green {
    background: #22c55e;
  }
  
  .cta-green:hover {
    background: #16a34a;
  }
  
  .cta-center {
    text-align: center;
    margin: 24px 0;
  }
  
  .footer {
    text-align: center;
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }
  
  .footer p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
  
  .footer a {
    color: #FF6B35;
    text-decoration: none;
  }
  
  .footer a:hover {
    text-decoration: underline;
  }
  
  .unsubscribe {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }
  
  .unsubscribe a {
    color: #94a3b8;
    font-size: 11px;
  }
  
  .divider {
    height: 1px;
    background: #e2e8f0;
    margin: 24px 0;
  }
  
  .note {
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    color: #92400e;
    margin: 16px 0;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    color: #64748b;
  }
  
  .vendor-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    margin: 16px 0;
  }
  
  .vendor-info h3 {
    margin: 0;
    font-size: 16px;
    color: #1e293b;
  }
  
  .vendor-info p {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: #64748b;
  }
`;

/**
 * Inline style generator for specific elements
 */
export const inlineStyles = {
  body: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9;`,
  wrapper: `max-width: 600px; margin: 0 auto; padding: 20px;`,
  container: `background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);`,
  headerOrange: `background: linear-gradient(135deg, #FF6B35 0%, #f97316 100%); color: #ffffff; padding: 24px 32px; text-align: center;`,
  headerGreen: `background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 24px 32px; text-align: center;`,
  headerRed: `background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 24px 32px; text-align: center;`,
  headerBlue: `background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 24px 32px; text-align: center;`,
  h1: `margin: 0; font-size: 22px; font-weight: 600;`,
  subtitle: `margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;`,
  content: `padding: 32px;`,
  greeting: `font-size: 16px; margin-bottom: 16px;`,
  messageBox: `background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #FF6B35; border-radius: 8px; padding: 16px; margin: 20px 0;`,
  infoRow: `padding: 12px 0; border-bottom: 1px solid #f1f5f9;`,
  infoLabel: `font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;`,
  infoValue: `font-size: 15px; color: #1e293b;`,
  priceBox: `background: #fff7ed; border: 2px solid #FF6B35; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;`,
  priceMain: `font-size: 36px; font-weight: 700; color: #FF6B35;`,
  priceDetail: `font-size: 14px; color: #64748b; margin-top: 4px;`,
  cta: `display: inline-block; background: #FF6B35; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;`,
  ctaGreen: `display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;`,
  ctaCenter: `text-align: center; margin: 24px 0;`,
  footer: `text-align: center; padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;`,
  footerText: `margin: 0; font-size: 12px; color: #64748b;`,
  footerLink: `color: #FF6B35; text-decoration: none;`,
  unsubscribe: `margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;`,
  unsubscribeLink: `color: #94a3b8; font-size: 11px; text-decoration: none;`,
  note: `background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #92400e; margin: 16px 0;`,
  badgeSuccess: `display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; background: #dcfce7; color: #166534;`,
  badgeError: `display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; background: #fee2e2; color: #991b1b;`,
};
