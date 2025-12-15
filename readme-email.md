# Phase 5: Email Notifications - Implementation

**Date:** 15 December 2025

---

## Overview

This implementation adds a comprehensive email notification system with:

- Modular, reusable email templates
- HTML escape for XSS protection (security fix)
- User preference checking before sending
- Secure unsubscribe flow with signed tokens
- Email logging for monitoring

---

## Files Created

### Email Templates (`src/lib/email-templates/`)

| File              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `helpers.ts`      | HTML escape, formatters, unsubscribe token generation |
| `styles.ts`       | Shared CSS-in-JS styles for email compatibility       |
| `base.ts`         | Base template wrapper with header/footer              |
| `new-message.ts`  | New message email template                            |
| `quote-status.ts` | Quote accepted/rejected/new templates                 |
| `index.ts`        | Exports all template functions                        |

### Services

| File                             | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `src/lib/email-notifications.ts` | Main notification service with preference checking |

### API Routes

| File                               | Description              |
| ---------------------------------- | ------------------------ |
| `src/app/api/unsubscribe/route.ts` | Unsubscribe API endpoint |

### Pages

| File                           | Description                    |
| ------------------------------ | ------------------------------ |
| `src/app/unsubscribe/page.tsx` | User-friendly unsubscribe page |

### Modified Files

| File                                           | Changes                                        |
| ---------------------------------------------- | ---------------------------------------------- |
| `src/lib/email.ts`                             | Added `escapeHtml` import, secured user inputs |
| `src/lib/messages.ts`                          | Added email notification trigger               |
| `src/app/api/quotes/[quoteId]/status/route.ts` | Added quote status email notifications         |

### Database

| File                                                   | Description                                               |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `supabase/migrations/20251215_email_notifications.sql` | Email logs table, preference columns, rate limit function |

---

## Installation

### Step 1: Copy Files

```bash
# From project root
cp -r phase5-email-notifications/src/* src/
cp -r phase5-email-notifications/supabase/* supabase/
```

### Step 2: Run Migration

```sql
-- Run in Supabase SQL Editor
-- Or via CLI: supabase db push

-- File: supabase/migrations/20251215_email_notifications.sql
```

### Step 3: Add Environment Variable

```bash
# .env.local
UNSUBSCRIBE_SECRET=your-random-secret-key-min-32-chars
```

### Step 4: Regenerate Types (Optional)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## Security Checklist ✅

- [x] `import "server-only"` in all email files
- [x] HTML escape for all user inputs
- [x] Signed unsubscribe tokens with expiry
- [x] No PII in email_logs table
- [x] Rate limit function available
- [x] User preference checking before send
- [x] No secrets/env in error responses

---

## Email Flow

### New Message Email

```
User sends message
    ↓
messages.ts → sendMessageWithNotification()
    ↓
Check message_new_email preference
    ↓ (if enabled)
email-notifications.ts → sendNewMessageEmail()
    ↓
email-templates/new-message.ts → Generate HTML
    ↓
email.ts → sendEmail()
    ↓
Log to email_logs table
```

### Quote Status Email

```
Customer accepts/rejects quote
    ↓
quotes/[quoteId]/status/route.ts → PATCH
    ↓
Check quote_accepted_email or quote_rejected_email preference
    ↓ (if enabled)
email-notifications.ts → sendQuoteAcceptedEmail() or sendQuoteRejectedEmail()
    ↓
email-templates/quote-status.ts → Generate HTML
    ↓
email.ts → sendEmail()
    ↓
Log to email_logs table
```

---

## Unsubscribe Flow

1. User clicks unsubscribe link in email
2. Link contains signed token: `/unsubscribe?token=xxx`
3. `unsubscribe/page.tsx` calls API
4. `api/unsubscribe/route.ts` verifies token
5. Updates `notification_preferences` table
6. Shows success/error page

---

## Email Types & Preference Keys

| Email Type              | Preference Column        | Default |
| ----------------------- | ------------------------ | ------- |
| New message             | `message_new_email`      | `true`  |
| New quote (customer)    | `quote_received_email`   | `true`  |
| Quote accepted (vendor) | `quote_accepted_email`   | `true`  |
| Quote rejected (vendor) | `quote_rejected_email`   | `false` |
| New lead (vendor)       | `lead_new_email`         | `true`  |
| New review              | `review_new_email`       | `true`  |
| Booking reminder        | `booking_reminder_email` | `true`  |
| System                  | `system_email`           | `false` |

---

## Testing

### Manual Test

1. Create a lead
2. Vendor sends message → Customer should receive email
3. Customer replies → Vendor should receive email
4. Vendor sends quote → Customer receives email
5. Customer accepts → Vendor receives email
6. Click unsubscribe → Preference should update

### Check Email Logs

```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

### Check Preferences

```sql
SELECT * FROM notification_preferences WHERE user_id = 'xxx';
```

---

## Risks & Rollback

### Risks

| Risk                  | Mitigation                          |
| --------------------- | ----------------------------------- |
| SMTP rate limits      | Use queue/batch in future           |
| Token collision       | Uses timestamp + user-specific hash |
| Email delivery issues | Logged in email_logs for debugging  |

### Rollback

```sql
-- Disable email notifications
UPDATE notification_preferences
SET message_new_email = false,
    quote_received_email = false,
    quote_accepted_email = false,
    quote_rejected_email = false;
```

---

## Future Improvements

- [ ] Email queue with retry logic
- [ ] Email digest (batch daily/weekly)
- [ ] Email analytics (open/click tracking)
- [ ] Template preview in admin panel
- [ ] A/B testing for email content
