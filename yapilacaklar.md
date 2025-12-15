# CATERINGLE.COM — Yapılacaklar

**Son Güncelleme:** 15 Aralık 2025

---

## ✅ Tamamlanan Fazlar

### Phase 0: Altyapı

- [x] Supabase proje kurulumu
- [x] Next.js 16 + React 19 + TypeScript 5
- [x] Tailwind CSS 4 konfigürasyonu
- [x] Authentication sistemi (Supabase Auth)
- [x] RLS politikaları

### Phase 0.2: Güvenlik Altyapısı

- [x] idempotency_keys tablosu + TTL
- [x] activity_logs tablosu + RLS
- [x] RBAC sistemi (roles, user_roles, helper functions)
- [x] Rate limiting
- [x] Turnstile captcha entegrasyonu
- [x] Trigram indexler (pg_trgm)
- [x] Composite indexler

### Phase 1: Temel Modüller

- [x] Vendor listeleme (/vendors)
- [x] Vendor detay sayfası (/vendors/[slug])
- [x] Vendor arama (search_vendors RPC)
- [x] Lead form (talep oluşturma)
- [x] Şehir/ilçe filtreleme
- [x] Kategori sistemi (segments, categories, services)
- [x] Mutfak türleri, teslimat modelleri, etiketler

### Phase 2: Dashboard'lar

- [x] Vendor dashboard (/vendor)
- [x] Vendor leads yönetimi (/vendor/leads)
- [x] Vendor ayarları (/vendor/settings)
- [x] Müşteri hesabı (/account)
- [x] Müşteri talepleri (/account/leads)
- [x] Müşteri teklifleri (/account/quotes)
- [x] Müşteri favorileri (/account/favorites)
- [x] Admin panel (/panel)

### Phase 3: İletişim & Bildirim

- [x] Takvim sistemi (vendor_calendar, availability)
- [x] Bildirim sistemi (notifications tablosu)
- [x] NotificationBell component
- [x] Bildirim tercihleri

### Phase 3.5: Mesajlaşma Sistemi ✅ YENİ

- [x] vendor_lead_messages tablosu
- [x] Real-time messaging (Supabase Realtime)
- [x] MessageThread, MessageInput, ConversationList components
- [x] Vendor inbox (/vendor/messages)
- [x] Customer inbox (/account/messages)
- [x] Conversation sayfaları (/\*/messages/[vendorLeadId])
- [x] Unread count badges (navigation)
- [x] Per-user read state (conversation_read_state tablosu)
- [x] Quote-Message entegrasyonu
- [x] QuoteCard, QuoteSendForm components
- [x] Quote gönderme (/api/quotes)
- [x] Quote kabul/red (/api/quotes/[id]/status)
- [x] Quote state machine (valid transitions)
- [x] Auto-message on quote send/status change

---

## 🔄 Devam Eden / Sonraki Fazlar

### Phase 4: Teklif Sistemi İyileştirmeleri

- [ ] Quote counter-offer (karşı teklif)
- [ ] Quote revision history
- [ ] Quote PDF export
- [ ] Quote templates (vendor için)
- [ ] Bulk quote operations

### Phase 5: Email Bildirimleri

- [ ] Email template sistemi
- [ ] Yeni mesaj email bildirimi
- [ ] Yeni teklif email bildirimi
- [ ] Quote kabul/red email bildirimi
- [ ] Email preference settings
- [ ] Unsubscribe flow

### Phase 6: Performans & SEO

- [ ] Image optimization (next/image)
- [ ] ISR (Incremental Static Regeneration)
- [ ] Sitemap generation
- [ ] Meta tags optimization
- [ ] Structured data (JSON-LD)
- [ ] Core Web Vitals optimization

### Phase 7: Analytics & Monitoring

- [ ] Vendor analytics dashboard
- [ ] Lead conversion tracking
- [ ] Quote success rate metrics
- [ ] Response time tracking
- [ ] Abuse monitoring dashboard

### Phase 8: Ödeme Sistemi

- [ ] Ödeme altyapısı seçimi (iyzico/stripe)
- [ ] Vendor abonelik planları
- [ ] Premium listing
- [ ] Commission tracking

### Phase 9: Mobile App

- [ ] React Native / Expo setup
- [ ] Push notifications
- [ ] Offline support
- [ ] Deep linking

---

## 🐛 Bilinen Sorunlar / Technical Debt

| Sorun                           | Öncelik | Notlar                         |
| ------------------------------- | ------- | ------------------------------ |
| TypeScript strict mode hataları | Düşük   | cache.ts, notifications.ts     |
| Email template HTML escape      | Orta    | User input escape edilmeli     |
| Vendor profile image upload     | Orta    | Storage bucket gerekli         |
| Search performance              | Düşük   | Large dataset'te test edilmeli |

---

## 📊 Database Migrations (Uygulanmış)

| Migration                                 | Tarih      | Açıklama                                 |
| ----------------------------------------- | ---------- | ---------------------------------------- |
| 20251215_vendor_lead_messages.sql         | 15.12.2025 | Mesaj tablosu, RLS, RPC                  |
| 20251215_quote_message_integration.sql    | 15.12.2025 | message_type, quote_id, triggers         |
| 20251215_read_state_and_state_machine.sql | 15.12.2025 | Per-user read state, quote state machine |

---

## 🔧 Teknik Notlar

### API Response Standardı

```typescript
// Success
{ ok: true, data: T }

// Error
{ ok: false, error: { code: string, message: string } }
```

### Güvenlik Zinciri

- **Public endpoint:** Zod → Rate Limit → Turnstile → Idempotency → İşlem
- **Auth endpoint:** Auth → Zod → Rate Limit → İşlem

### RBAC Mapping

- Kod'da `vendor` = DB'de `vendor_owner`
- Tek kaynak: `user_roles` / `roles` tabloları

---

## 📁 Önemli Dosyalar

| Dosya                              | Açıklama                      |
| ---------------------------------- | ----------------------------- |
| `src/types/messaging.ts`           | Mesajlaşma tipleri            |
| `src/lib/messages.ts`              | Server-side messaging helpers |
| `src/components/QuoteCard.tsx`     | Teklif kartı componenti       |
| `src/components/MessageThread.tsx` | Mesaj thread componenti       |
| `src/app/api/quotes/route.ts`      | Quote API                     |
| `src/app/api/messages/route.ts`    | Messages API                  |

---

_Bu dosya proje roadmap'i için tek doğru kaynaktır. Her değişiklikte güncellenmelidir._
