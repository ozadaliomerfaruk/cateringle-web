# CATERINGLE.COM — Yapılacaklar

**Son Güncelleme:** 15 Aralık 2025 (Gece)

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

### Phase 3.5: Mesajlaşma Sistemi

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

### Phase 4: Teklif Sistemi İyileştirmeleri ✅

- [x] Quote counter-offer (karşı teklif)
- [x] Quote revision history (otomatik trigger)
- [x] Quote PDF export (pdf-lib)
- [x] Quote templates (vendor şablonları)

### Altyapı: Image Upload ✅

- [x] ImageUpload component (logo)
- [x] GalleryUpload component (max 12 fotoğraf)
- [x] Supabase Storage bucket (vendor-images)
- [x] Storage RLS policies
- [x] vendor_images table + RLS

### Altyapı: PWA ✅

- [x] Web App Manifest (manifest.ts)
- [x] Service Worker (cache, offline)
- [x] Install prompt (Chrome/Edge/Safari)
- [x] iOS talimatları
- [x] Offline sayfası
- [x] Push notification altyapısı

### Review System İyileştirmeleri ✅

- [x] Vendor yanıtları (reviews.vendor_reply)
- [x] Helpful voting (review_votes)
- [x] Filtreleme ve sıralama
- [x] Organizasyon detayları (event_type, guest_count)
- [x] Vendor panel sayfası (/vendor/reviews)
- [x] Review API endpoints
- [x] Yeni yorum email bildirimi (vendor'a)

### Phase 5: Email Bildirimleri ✅

- [x] Email template sistemi (modular, reusable templates)
- [x] HTML escape utility (XSS koruması)
- [x] Yeni mesaj email bildirimi
- [x] Yeni teklif email bildirimi
- [x] Quote kabul/red email bildirimi
- [x] Vendor onay/red email bildirimi
- [x] Yeni yorum email bildirimi
- [x] Email preference checking (notification_preferences)
- [x] Email rate limiting (10/saat/kullanıcı)
- [x] Unsubscribe flow (HMAC signed tokens)
- [x] Email logging (email_logs tablosu)

### Phase 6: SEO & Performans ✅

- [x] JSON-LD Structured Data (WebSite, Organization, LocalBusiness, Breadcrumb)
- [x] Meta tags optimization (Open Graph, Twitter Cards)
- [x] Canonical URLs
- [x] OG Image oluşturma (1200x630)
- [x] Dynamic sitemap.xml (vendors, categories, cities)
- [x] robots.txt (crawler kuralları, AI bot engelleme)
- [x] Google Search Console entegrasyonu
- [x] Next.js Image optimization (vendor layout)

### Phase 7: Analytics ✅

- [x] Vendor Analytics Dashboard (/vendor/analytics)
  - [x] Özet kartlar (talep, teklif, dönüşüm, yanıt süresi)
  - [x] Trend göstergeleri (aylık % değişim)
  - [x] Günlük grafikler (Recharts - Area, Bar, Pie)
  - [x] Etkinlik türleri dağılımı
  - [x] Misafir sayısı dağılımı
  - [x] Mesaj istatistikleri
- [x] Admin Analytics Dashboard (/panel/analytics)
  - [x] Platform özet istatistikleri
  - [x] Haftalık aktivite banner
  - [x] Günlük talepler/vendorlar/teklifler grafikleri
  - [x] Şehir ve kategori dağılımları
  - [x] Top 10 vendor tablosu
  - [x] Etkinlik türleri dağılımı

---

## 🔄 Devam Eden / Sonraki Fazlar

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

### Phase 10: İleri Seviye

- [x] PWA (Progressive Web App)
- [ ] Email digest (batch notifications)
- [ ] ISR (Incremental Static Regeneration)
- [ ] Core Web Vitals optimization
- [ ] Abuse monitoring dashboard

---

## 📦 Eklenen Paketler

| Paket | Versiyon | Kullanım |
|-------|----------|----------|
| recharts | ^2.x | Analytics grafikleri |
| pdf-lib | ^1.x | Quote PDF export |

---

## 🐛 Bilinen Sorunlar / Technical Debt

| Sorun                           | Öncelik | Notlar                         |
| ------------------------------- | ------- | ------------------------------ |
| Search performance              | Düşük   | Large dataset'te test edilmeli |

---

## 📊 Database Migrations (Uygulanmış)

| Migration                                 | Tarih      | Açıklama                                 |
| ----------------------------------------- | ---------- | ---------------------------------------- |
| 20251215_vendor_lead_messages.sql         | 15.12.2025 | Mesaj tablosu, RLS, RPC                  |
| 20251215_quote_message_integration.sql    | 15.12.2025 | message_type, quote_id, triggers         |
| 20251215_read_state_and_state_machine.sql | 15.12.2025 | Per-user read state, quote state machine |
| 20251215_email_notifications.sql          | 15.12.2025 | Email logs, preferences, rate limit fn   |
| 20251215_vendor_analytics.sql             | 15.12.2025 | Vendor analytics RPC function            |
| 20251215_admin_analytics.sql              | 15.12.2025 | Admin platform analytics RPC function    |
| 20251215_quote_improvements.sql           | 15.12.2025 | Counter-offer, revisions, templates      |
| storage-policies.sql                      | 15.12.2025 | Vendor image storage RLS policies        |
| 20251216_review_system.sql                | 16.12.2025 | Review improvements, vendor reply, voting |
| 20251215_review_improvements.sql          | 15.12.2025 | Review replies, votes, event details     |

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

| Dosya                                    | Açıklama                         |
| ---------------------------------------- | -------------------------------- |
| `src/types/messaging.ts`                 | Mesajlaşma tipleri               |
| `src/lib/messages.ts`                    | Server-side messaging helpers    |
| `src/lib/email-notifications.ts`         | Email bildirim servisi           |
| `src/lib/email-templates/`               | Modüler email template'leri      |
| `src/lib/types/analytics.ts`             | Vendor analytics tipleri         |
| `src/lib/types/admin-analytics.ts`       | Admin analytics tipleri          |
| `src/components/seo/`                    | JSON-LD schema components        |
| `src/components/QuoteCard.tsx`           | Teklif kartı componenti          |
| `src/components/MessageThread.tsx`       | Mesaj thread componenti          |
| `src/app/vendor/analytics/`              | Vendor analytics dashboard       |
| `src/app/panel/analytics/`               | Admin analytics dashboard        |
| `src/app/sitemap.ts`                     | Dynamic sitemap                  |
| `src/app/robots.ts`                      | Robots.txt kuralları             |
| `src/app/api/quotes/[id]/counter-offer/` | Karşı teklif API                 |
| `src/app/api/quotes/[id]/pdf/`           | PDF export API                   |
| `src/app/api/quotes/[id]/history/`       | Teklif geçmişi API               |
| `src/app/api/vendor/quote-templates/`    | Şablon CRUD API                  |
| `src/app/manifest.ts`                    | PWA Web App Manifest             |
| `src/app/offline/page.tsx`               | PWA Offline sayfası              |
| `src/components/PWAInstallPrompt.tsx`    | PWA Install prompt               |
| `public/sw.js`                           | Service Worker                   |
| `src/app/api/reviews/`                   | Review CRUD API                  |
| `src/app/api/vendor/reviews/`            | Vendor reviews API               |
| `src/app/vendor/reviews/`                | Vendor reviews panel             |

---

## 📈 SEO Checklist

- [x] JSON-LD: WebSite, Organization (ana sayfa)
- [x] JSON-LD: LocalBusiness, Breadcrumb (vendor sayfaları)
- [x] Open Graph meta tags
- [x] Twitter Cards
- [x] Canonical URLs
- [x] sitemap.xml (dinamik)
- [x] robots.txt
- [x] Google Search Console bağlantısı
- [x] OG Image (1200x630)

---

_Bu dosya proje roadmap'i için tek doğru kaynaktır. Her değişiklikte güncellenmelidir._
