# Phase 3.5 — Unified Messaging + Quote System

## Overview

Birleşik mesajlaşma ve teklif sistemi. Vendor ve customer arasındaki tüm iletişim tek bir thread'de akıyor. Teklifler mesaj olarak görünüyor, kabul/red işlemleri conversation içinde yapılıyor.

## Architecture

```
Müşteri                          Vendor
   │                                │
   ├─── Talep oluştur ───────────►  │
   │                                ├─── Talebi gör (/vendor/leads)
   │                                ├─── "Yanıtla" → /vendor/messages/[id]
   │                                │
   │                                ├─── Mesaj veya Teklif gönder
   │  ◄─── [QuoteCard in thread] ───┤
   │                                │
   ├─── /account/messages/[id]      │
   ├─── Teklifi thread'de görür     │
   ├─── Kabul/Red butonu            │
   │  ─── ✅ Kabul ─────────────► ──┤
   │                                ├─── "Teklif kabul edildi" mesajı
```

## Files Created

### Database Migrations

| File                                        | Purpose                                  |
| ------------------------------------------- | ---------------------------------------- |
| `20251215_vendor_lead_messages.sql`         | Messages table, RLS, RPC functions       |
| `20251215_quote_message_integration.sql`    | message_type, quote_id, triggers         |
| `20251215_read_state_and_state_machine.sql` | Per-user read state, quote state machine |

### Backend (20 files)

#### Types

| File                     | Purpose                     |
| ------------------------ | --------------------------- |
| `src/types/messaging.ts` | All messaging + quote types |

#### Library

| File                             | Purpose                       |
| -------------------------------- | ----------------------------- |
| `src/lib/messages.ts`            | Server-side messaging helpers |
| `src/lib/validations/message.ts` | Zod schemas                   |

#### API Routes

| Endpoint                      | File                        | Method | Purpose       |
| ----------------------------- | --------------------------- | ------ | ------------- |
| `/api/messages`               | `route.ts`                  | POST   | Send message  |
| `/api/messages`               | `route.ts`                  | GET    | Get messages  |
| `/api/messages/read`          | `read/route.ts`             | POST   | Mark as read  |
| `/api/messages/conversations` | `conversations/route.ts`    | GET    | Inbox list    |
| `/api/messages/unread`        | `unread/route.ts`           | GET    | Badge count   |
| `/api/quotes`                 | `quotes/route.ts`           | POST   | Send quote    |
| `/api/quotes/[id]/status`     | `[quoteId]/status/route.ts` | PATCH  | Accept/reject |

### Frontend (14 files)

#### Components

| File                                  | Purpose                 |
| ------------------------------------- | ----------------------- |
| `src/components/MessageThread.tsx`    | Messages + QuoteCards   |
| `src/components/MessageInput.tsx`     | Text input              |
| `src/components/ConversationList.tsx` | Inbox list              |
| `src/components/QuoteCard.tsx`        | Quote display + actions |
| `src/components/QuoteSendForm.tsx`    | Quote form for vendors  |

#### Layouts

| File                         | Purpose                          |
| ---------------------------- | -------------------------------- |
| `src/app/vendor/layout.tsx`  | Vendor nav with messages badge   |
| `src/app/account/layout.tsx` | Customer nav with messages badge |

#### Vendor Pages

| File                                                                  | Purpose                |
| --------------------------------------------------------------------- | ---------------------- |
| `src/app/vendor/messages/page.tsx`                                    | Vendor inbox           |
| `src/app/vendor/messages/[vendorLeadId]/page.tsx`                     | Conversation (server)  |
| `src/app/vendor/messages/[vendorLeadId]/VendorConversationClient.tsx` | Real-time + quote form |

#### Customer Pages

| File                                                                     | Purpose                   |
| ------------------------------------------------------------------------ | ------------------------- |
| `src/app/account/messages/page.tsx`                                      | Customer inbox            |
| `src/app/account/messages/[vendorLeadId]/page.tsx`                       | Conversation (server)     |
| `src/app/account/messages/[vendorLeadId]/CustomerConversationClient.tsx` | Real-time + quote actions |

---

## Installation

### Step 1: Run Database Migrations

Supabase SQL Editor'da sırayla çalıştır:

```sql
-- 1. Mesaj tablosu (daha önce yapıldıysa atla)
-- 20251215_vendor_lead_messages.sql

-- 2. Quote-Message integration
-- 20251215_quote_message_integration.sql

-- 3. Read state + State machine
-- 20251215_read_state_and_state_machine.sql
```

### Step 2: Copy Files

```powershell
# Zip'i çıkar
Expand-Archive -Path "quote-message-integration.zip" -DestinationPath "." -Force

# Veya manuel kopyalama
Copy-Item -Path "outputs/src/*" -Destination "src/" -Recurse -Force
```

### Step 3: Update Types (Optional)

```powershell
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Step 4: Test

```powershell
npm run dev
```

---

## Features

### ✅ Implemented

- Real-time messaging via Supabase Realtime
- Optimistic UI updates
- **Per-user read state** (conversation_read_state table)
- Read receipts (single/double check marks)
- Unread count badges (accurate, per-user)
- Date separators in conversation
- Character limit (2000)
- Rate limiting
- Access control (RLS + API validation)
- In-app notifications on new message
- Auto-scroll to latest message
- Mobile-responsive design
- **Quote cards in message thread**
- **Inline quote sending (vendor)**
- **Quote accept/reject buttons (customer)**
- **Auto-message on quote send**
- **Auto-message on quote status change**
- **Quote state machine** (valid transitions enforced)
- **Price per person auto-calculation**
- **Quote validity period**

### ❌ Not Included (Future Enhancements)

- File/image attachments
- Typing indicators
- Message reactions
- Search within messages
- Email notifications for offline users
- Push notifications
- Message deletion UI
- Quote counter-offer
- Quote revision history

---

## Security Checklist

- [x] Auth required on all endpoints
- [x] Rate limiting via `rateLimitPresets.apiGeneral`
- [x] Zod validation on all inputs
- [x] Access control via `canUserAccessConversation()`
- [x] RLS enforced at DB level
- [x] Content length validated (max 2000 chars)
- [x] XSS prevention (React auto-escapes)
- [x] No PII in logs
- [x] Quote ownership validation
- [x] Status transition validation (state machine)
- [x] Per-user read state (no cross-user data leak)

---

## Testing

### Manual Test Flow

**Basic Messaging:**

1. **Create a lead** → Customer submits lead form for a vendor
2. **Vendor opens conversation** → `/vendor/messages/{vendorLeadId}`
3. **Vendor sends message** → Should appear instantly
4. **Customer opens conversation** → `/account/messages/{vendorLeadId}`
5. **Customer sees message** → Read receipt should update
6. **Customer replies** → Vendor sees real-time update
7. **Check unread counts** → Badge should update on inbox

**Quote Flow:**

1. **Vendor clicks "Teklif Gönder"** → Quote form opens
2. **Vendor fills price, validity** → Submits quote
3. **Quote card appears in thread** → Shows price, status "Gönderildi"
4. **Customer opens conversation** → Sees QuoteCard with Kabul/Red buttons
5. **Customer clicks "Kabul Et"** → Status changes to "Kabul Edildi"
6. **New message appears** → "✅ Teklif kabul edildi"
7. **vendor_lead.status** → Updated to "won"

### API Test (curl)

```bash
# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"vendorLeadId": "uuid-here", "content": "Test message"}'

# Send quote (vendor only)
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "vendorLeadId": "uuid-here",
    "totalPrice": 15000,
    "pricePerPerson": 150,
    "message": "Menü detayları...",
    "validUntil": "2024-12-22T00:00:00Z"
  }'

# Accept quote (customer only)
curl -X PATCH http://localhost:3000/api/quotes/{quoteId}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"status": "accepted"}'

# Get unread count
curl http://localhost:3000/api/messages/unread \
  -H "Cookie: sb-access-token=..."
```

---

## Troubleshooting

### "Giriş yapmalısınız" error

- User is not authenticated
- Check Supabase session cookies

### Real-time not working

- Verify table is in `supabase_realtime` publication
- Check browser console for WebSocket errors
- Verify RLS allows SELECT for the user

### Messages not appearing

- Check RLS policies allow access
- Verify `can_send_message_to_vendor_lead()` returns true
- Check browser Network tab for API errors

---

## Database Schema Reference

```sql
-- Table: vendor_lead_messages
id UUID PRIMARY KEY
vendor_lead_id UUID REFERENCES vendor_leads(id)
sender_id UUID REFERENCES auth.users(id)
sender_type TEXT ('vendor' | 'customer')
content TEXT (max 2000)
is_read BOOLEAN
created_at TIMESTAMPTZ
deleted_at TIMESTAMPTZ

-- Added column on vendor_leads
last_message_at TIMESTAMPTZ
```

---

## RPC Functions

| Function                                   | Purpose                         |
| ------------------------------------------ | ------------------------------- |
| `send_vendor_lead_message(uuid, text)`     | Send message (validates access) |
| `get_vendor_lead_messages(uuid, int, int)` | Get paginated messages          |
| `mark_messages_read(uuid)`                 | Mark conversation as read       |
| `get_unread_message_count()`               | Total unread for badge          |
| `get_message_conversations(int, int)`      | Inbox list with last message    |
