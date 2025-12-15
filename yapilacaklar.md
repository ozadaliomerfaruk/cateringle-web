# CATERINGLE.COM — Yapılacaklar

**Son Güncelleme:** 15 Aralık 2025  
**Versiyon:** 3.0 (Final)

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
- [x] Per-user read state (conversation_read_state)
- [x] Quote-message entegrasyonu
- [x] Quote state machine
- [x] Unread count badges

### Phase 4: Email Bildirimleri

- [x] Email template sistemi
- [x] New message email
- [x] Quote status emails
- [x] Unsubscribe flow
- [x] email_logs tablosu

---

## 🔴 Acil — Bug Fix & Quick Wins

### Favoriler Bug Fix ⚡

> **Öncelik:** Kritik | **Süre:** 1-2 saat | **Risk:** Düşük

**Mimari Karar:**

- ✅ **Single source of truth:** Favorites state **sadece** `useFavorites()` hook üzerinden yönetilecek
- ✅ Component local state yasak
- ⚠️ **Known limitation:** Cross-tab sync yok (aynı kullanıcı iki sekme açarsa manuel refresh gerekir)
- 📝 İleride: React Query/SWR ile cache + cross-tab sync eklenebilir

**Checklist:**

- [ ] `useFavorites.ts` → dependency'leri `user?.id` seviyesine indir
- [ ] `FavoriteButton.tsx` → kendi state'i kaldır, `useFavorites()` hook'a bağla
- [ ] `FavoriteButton` props: `vendorId`, `className` (stateless)
- [ ] Optimistic update ekle (toggle anında UI güncelle, hata olursa geri al)
- [ ] Test: Farklı sayfalarda favori toggle → hepsi senkron mu?

**Dosyalar:**

```
src/hooks/useFavorites.ts
src/components/FavoriteButton.tsx
src/app/vendors/VendorCard.tsx (import değişikliği)
src/app/account/favorites/page.tsx (import değişikliği)
```

---

### Fiyat Filtresi Kaldırma ⚡

> **Öncelik:** Yüksek | **Süre:** 30 dk | **Risk:** Düşük

**Mimari Karar:**

- ✅ **Seçenek A:** RPC parametreleri (`p_min_price`, `p_max_price`) kalacak ama **deprecated**
- ✅ UI'dan kaldırılacak, URL param handling kaldırılacak
- ✅ Backward compatibility korunacak (eski bookmarklar bozulmaz)
- 📝 Dokümantasyon: RPC parametreleri deprecated olarak işaretlenecek

**Checklist:**

- [ ] `FilterSidebar.tsx` → "Kişi başı fiyat" accordion'u kaldır
- [ ] `page.tsx` → `min_price`, `max_price` URL param handling kaldır
- [ ] `search_vendors` RPC → parametreler kalacak ama kullanılmayacak (breaking change yok)
- [ ] Knowledge dokümanına not: "min_price/max_price deprecated (v3.0)"

**Dosyalar:**

```
src/app/vendors/FilterSidebar.tsx
src/app/vendors/page.tsx
```

---

## 🟡 Phase 5: Vendor Foto Galerisi

### 5.1 Database Migration

> **Öncelik:** Yüksek | **Süre:** 15 dk

**Checklist:**

- [ ] `vendor_images` tablosuna `is_primary` kolonu ekle (BOOLEAN NOT NULL DEFAULT false)
- [ ] Mevcut ilk fotoları primary olarak işaretle
- [ ] Unique partial index: vendor başına tek primary
- [ ] Soft delete için index hazırlığı (şimdilik yorum satırı)

**Migration:**

```sql
-- 20251215_vendor_images_is_primary.sql

-- 1. Kolon ekle
ALTER TABLE vendor_images
ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

-- 2. Mevcut ilk fotoları primary yap
WITH first_images AS (
  SELECT DISTINCT ON (vendor_id) id
  FROM vendor_images
  WHERE vendor_id IS NOT NULL
  ORDER BY vendor_id, sort_order ASC NULLS LAST, created_at ASC
)
UPDATE vendor_images
SET is_primary = true
WHERE id IN (SELECT id FROM first_images);

-- 3. Unique partial index (vendor başına tek primary)
CREATE UNIQUE INDEX idx_vendor_images_primary
ON vendor_images (vendor_id)
WHERE is_primary = true;

-- 4. İleride soft delete eklenirse bu index'i güncelle:
-- DROP INDEX idx_vendor_images_primary;
-- CREATE UNIQUE INDEX idx_vendor_images_primary
-- ON vendor_images (vendor_id)
-- WHERE is_primary = true AND deleted_at IS NULL;

COMMENT ON COLUMN vendor_images.is_primary IS 'Ana vitrin fotoğrafı (vendor başına tek)';
```

---

### 5.2 Query Güncelleme

> **Öncelik:** Yüksek | **Süre:** 1 saat

**Mimari Karar:**

- ✅ Liste sayfası (`/vendors`): Vendor başına **1-3 foto** (performans)
- ✅ Detay sayfası (`/vendors/[slug]`): **Tüm galeri** (ayrı query)
- ✅ Primary foto her zaman ilk sırada

**Checklist:**

- [ ] `search_vendors` RPC → her vendor için `images` array döndür (limit 3, primary önce)
- [ ] Veya: Vendor list query'sine LEFT JOIN ile images ekle
- [ ] Detay sayfası için: `get_vendor_images(vendor_id)` RPC veya direkt query
- [ ] Fallback: images boşsa `logo_url` kullan

---

### 5.3 Frontend Components

> **Öncelik:** Yüksek | **Süre:** 2-3 saat

**Checklist:**

- [ ] `ImageGallery.tsx` → Swipe component (Embla Carousel önerilir)
  - Touch/swipe desteği
  - Indicator dots (kaç foto varsa)
  - Lazy loading (`loading="lazy"`)
  - Placeholder blur (next/image)
- [ ] `VendorCard.tsx` → Primary foto göster, fallback: logo_url
- [ ] Vendor detay → Full gallery modal (lightbox)
- [ ] **Empty state:** Foto yoksa placeholder görsel + "Henüz fotoğraf eklenmemiş"

**Image Loading Stratejisi:**

```tsx
// next/image ile optimize
<Image
  src={imageUrl}
  alt={vendor.business_name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={PLACEHOLDER_BLUR}
  loading="lazy"
/>
```

**Yeni dosyalar:**

```
src/components/ImageGallery.tsx
src/components/ImageGalleryModal.tsx (lightbox)
```

**Güncellenecek:**

```
src/app/vendors/VendorCard.tsx
src/app/vendors/page.tsx
src/app/vendors/[slug]/page.tsx
```

---

### 5.4 Vendor Dashboard — Foto Yönetimi

> **Öncelik:** Orta | **Süre:** 4-6 saat ⚠️

**Checklist:**

- [ ] `/vendor/settings` → "Medya" tab'ına foto yükleme UI
- [ ] Drag & drop sıralama (sort_order güncelleme)
- [ ] Primary foto seçimi (radyo buton)
- [ ] Foto silme (hard delete, storage'dan da sil)
- [ ] Storage'a upload + URL kaydetme
- [ ] Max 10 foto limiti (UI'da göster)
- [ ] Loading states + error handling

---

## 🟢 Phase 6: Mobile Responsive

### 6.1 /vendors Sayfası

> **Öncelik:** Yüksek | **Süre:** 2 saat

**Kabul Kriterleri:**

- [ ] 320px genişlikte overflow/taşma yok
- [ ] Segment pills → `overflow-x-auto` + `scroll-snap-type: x mandatory`
- [ ] Active segment otomatik görünür (`scrollIntoView`)
- [ ] VendorCard minimum yükseklik: 280px (görsel + bilgi)
- [ ] Lighthouse mobile CLS < 0.1 (görsel kontrol)

**Checklist:**

- [ ] Segment pills → horizontal scroll + snap
- [ ] VendorCard → foto galerisi swipe (5.3'e bağlı)
- [ ] Filter chips sticky on mobile (bottom sheet'ten sonra)
- [ ] "Filtreleri Temizle" butonu mobile'da sticky

---

### 6.2 /vendors/[slug] Detay

> **Öncelik:** Yüksek | **Süre:** 1-2 saat

**Kabul Kriterleri:**

- [ ] CTA butonları mobile'da her zaman erişilebilir
- [ ] 320px genişlikte içerik taşmıyor
- [ ] Galeri touch-friendly

**Checklist:**

- [ ] CTA butonları (Teklif Al, Mesaj, Ara) → mobilde sticky bottom bar
- [ ] Image gallery → full-screen swipe modal
- [ ] Tab navigation responsive (scroll veya collapse)
- [ ] Vendor bilgileri accordion/collapse (mobile'da)

---

### 6.3 /account Alanı

> **Öncelik:** Orta | **Süre:** 1-2 saat

**Checklist:**

- [ ] Tab navigation → scroll-to-active (aktif tab görünür olsun)
- [ ] Active indicator animation
- [ ] Favorites card layout mobile optimization
- [ ] Empty states tüm sayfalarda (favoriler, talepler, teklifler)

---

### 6.4 /vendor/settings

> **Öncelik:** Düşük | **Süre:** 1-2 saat

**Checklist:**

- [ ] Form sections → accordion/collapse on mobile
- [ ] Tab navigation → horizontal scroll veya dropdown menu
- [ ] Input spacing tutarlılığı (gap-4)
- [ ] Long form scrollable, submit button sticky

---

### 6.5 Empty States & Loading

> **Öncelik:** Orta | **Süre:** 1 saat

**Checklist:**

- [ ] Favoriler boş → "Henüz favori eklemediniz" + CTA
- [ ] Vendor foto yok → Placeholder görsel
- [ ] Arama sonuç yok → "Sonuç bulunamadı" + filtre temizle önerisi
- [ ] Loading skeleton'lar tutarlı

---

## 🔵 Phase 7: UX İyileştirmeleri & Conversion

### 7.1 Quick Quote (Hızlı Teklif) 🔥

> **Öncelik:** Yüksek | **Değer:** Conversion artırıcı | **Süre:** 4-5 saat

**Konsept:** Vendor detayında mini form, hızlı lead oluşturma

**Mimari Karar:**

- ✅ **`event_type` = `segments.slug` referansı** (tek kaynak, ayrı enum yok!)
- ✅ Bu sayede: Search relevance, badge türetme, analytics hepsi tutarlı

**Mini Form Alanları:**

- Tarih (date picker)
- Kişi sayısı (range slider veya input)
- Etkinlik türü → **`segments` dropdown** (Kurumsal, Düğün, Doğum günü...)
- İletişim (email/telefon - login varsa otomatik)

**Checklist:**

- [ ] `QuickQuoteForm.tsx` component
- [ ] `event_type` field → `segments.slug` foreign key (ayrı tablo YOK)
- [ ] `/vendors/[slug]` sayfasına entegre (sidebar veya modal)
- [ ] `/vendors` card'larında "Hızlı Teklif" butonu
- [ ] Form submit → lead oluştur (mevcut API kullan)
- [ ] Success state → "Talebiniz iletildi, firma sizinle iletişime geçecek"

---

### 7.2 Vendor Badge Sistemi 🏷️

> **Öncelik:** Orta | **Süre:** 2-3 saat

**MVP Badge'ler (İlk Release):**
| Badge | İkon | Kaynak |
|-------|------|--------|
| Kurumsal | 👔 | segments.slug = 'kurumsal' |
| Düğün | 👰 | segments.slug = 'dugun' |
| Vegan | 🌱 | tags.slug = 'vegan' |
| Faturalı | 📄 | vendors.kurumsal_fatura = true |
| Aynı Gün | ⚡ | vendors.accepts_last_minute = true |

**Nice-to-Have (İkinci İterasyon):**
| Badge | İkon | Kaynak |
|-------|------|--------|
| Doğum Günü | 🎂 | segments.slug = 'dogum-gunu' |
| Kutlama | 🎉 | categories içinden |
| Premium | ⭐ | vendors.is_premium = true |

**Checklist:**

- [ ] Badge'ler mevcut `tags` + `segments` + `vendors` kolonlarından türetilecek
- [ ] `VendorCard` → max 3 badge göster (MVP'den)
- [ ] `VendorDetail` → tüm badge'ler
- [ ] Badge config dosyası: `src/config/badges.ts`

---

### 7.3 Yanıt Süresi Sinyali ⏱️

> **Öncelik:** Yüksek | **Değer:** Güven artırıcı | **Süre:** 3-4 saat

**Gösterilecek:**

- "⏱️ Ortalama yanıt: 2 saat"
- "🟢 Son 24 saatte aktif" / "🟡 Son 7 günde aktif" / "⚪ 7+ gün önce"

**⚠️ Guard Kuralı:**

- Yanıt süresi hesaplaması **minimum 3 mesaj/lead sonrası** aktif olsun
- Yeni vendor'lar için: "Henüz yeterli veri yok" veya badge gösterme
- Sebep: Tek mesajlık konuşma istatistiksel olarak yanıltıcı

**Checklist:**

- [ ] `vendor_stats` view veya computed field (avg response time)
- [ ] **Guard:** `WHERE message_count >= 3` koşulu
- [ ] Son mesaj/teklif tarihinden "aktiflik" hesapla
- [ ] `VendorCard` + `VendorDetail` → badge olarak göster
- [ ] Vendor dashboard → "Yanıt sürenizi iyileştirin" uyarısı (optional)

---

### 7.4 Benzer Vendorlar

> **Öncelik:** Orta | **Süre:** 2 saat

**Kriterler:**

- Aynı şehir
- Aynı segment
- Benzer kapasite (±%30)

**Checklist:**

- [ ] `/vendors/[slug]` altında "Benzer Firmalar" section
- [ ] `search_vendors` RPC reuse (exclude current vendor)
- [ ] 3-4 vendor önerisi
- [ ] Mobile: horizontal scroll cards

---

## 🟣 Phase 8: Filtre & Kategori UX

### Zihinsel Model Düzenlemesi

```
Segment  = "Ne için?"     → Üstte pills (Kurumsal, Düğün, Doğum günü)
Mutfak   = "Ne yiyorum?"  → Sidebar filtre (Türk, İtalyan, Uzakdoğu)
Özellik  = "Nasıl?"       → Sidebar filtre (Vegan, Paket, Açık büfe)
Konum    = "Nerede?"      → Sidebar filtre (Şehir, İlçe)
```

**Checklist:**

- [ ] UI'da net ayrım: Segment üstte, diğerleri sidebar'da
- [ ] "Delivery model" → "Servis Şekli" (Türkçeleştir)
- [ ] Active filter chips (seçili filtreleri üstte göster, tek tek kaldır)
- [ ] "Temizle" butonu sticky

**Yeni Filtre Önerileri (Basit):**

- [ ] Kapasite aralığı (min-max kişi) — mevcut olabilir, kontrol et
- [ ] Aynı gün hizmet (boolean)
- [ ] Kurumsal faturalı (boolean) — B2B için kritik

---

## ⚪ Phase 9: Analytics & Monitoring

**Temel Metrikler:**

- [ ] Vendor analytics dashboard
- [ ] **Lead → Quote dönüşüm oranı** ⭐
- [ ] **Quote → Kazanıldı (Won) oranı** ⭐
- [ ] Response time tracking (7.3 ile birlikte)
- [ ] Abuse monitoring dashboard

**Neden Kritik:**

- Vendor ranking için temel veri
- Premium listing kararları
- Gelecekte komisyon hesaplama
- Segment bazlı analiz ("Hangi segment daha çok lead alıyor?")

**Checklist:**

- [ ] `vendor_analytics` view veya tablo
- [ ] Lead count by segment
- [ ] Quote conversion rate
- [ ] Win rate
- [ ] Average response time
- [ ] Admin dashboard'da göster

---

## ⚫ Phase 10: Ödeme Sistemi

- [ ] Ödeme altyapısı seçimi (iyzico/stripe)
- [ ] Vendor abonelik planları
- [ ] Premium listing
- [ ] Commission tracking

---

## 🔘 Phase 11: Mobile App (İleride)

- [ ] React Native / Expo setup
- [ ] Push notifications
- [ ] Offline support
- [ ] Deep linking

---

## ❌ Bilinçli Olarak Ertelenenler

| Özellik                    | Sebep                          | Ne Zaman? |
| -------------------------- | ------------------------------ | --------- |
| Puanlama / Yorum sistemi   | Henüz yeterli transaction yok  | Phase 12+ |
| Otomatik fiyat hesaplama   | Catering fiyatları çok dinamik | Belirsiz  |
| Anlık ödeme / Escrow       | Önce lead→teklif akışı otursun | Phase 10+ |
| Favoriler → Koleksiyonlar  | Overengineering şu an          | Phase 12+ |
| Cross-tab favorites sync   | Nice-to-have, kritik değil     | İleride   |
| Badge: Doğum günü, Kutlama | Decision driver değil          | 7.2 v2    |

---

## 🐛 Bilinen Sorunlar / Technical Debt

| Sorun                              | Öncelik    | Notlar                          | Status       |
| ---------------------------------- | ---------- | ------------------------------- | ------------ |
| FavoriteButton duplicate state     | **Kritik** | useFavorites ile senkron değil  | 🔴 Açık      |
| useFavorites dependency loop riski | **Kritik** | user?.id seviyesine indirilmeli | 🔴 Açık      |
| Fiyat filtresi anlamsız            | Yüksek     | Catering fiyatları dinamik      | 🔴 Açık      |
| vendor_images.is_primary yok       | Yüksek     | Ana foto belirlenemiyor         | 🔴 Açık      |
| Vendor'ların çoğunda foto yok      | Orta       | 1/N vendor'da foto var          | 🟡 Bilgi     |
| Empty states eksik                 | Orta       | Favoriler, arama sonuçları      | 🟡 Açık      |
| Image loading optimize değil       | Orta       | sizes, placeholder eksik        | 🟡 Açık      |
| TypeScript strict mode hataları    | Düşük      | cache.ts, notifications.ts      | 🟡 Beklemede |
| Search performance                 | Düşük      | Large dataset'te test edilmeli  | 🟡 Beklemede |

---

## 📊 Database Migrations

### Uygulanmış

| Migration                                 | Tarih      | Açıklama                                 |
| ----------------------------------------- | ---------- | ---------------------------------------- |
| 20251215_vendor_lead_messages.sql         | 15.12.2025 | Mesaj tablosu, RLS, RPC                  |
| 20251215_quote_message_integration.sql    | 15.12.2025 | message_type, quote_id, triggers         |
| 20251215_read_state_and_state_machine.sql | 15.12.2025 | Per-user read state, quote state machine |
| 20251215_email_notifications.sql          | 15.12.2025 | Email logs, preferences                  |

### Bekleyen

| Migration                             | Öncelik | Açıklama                         |
| ------------------------------------- | ------- | -------------------------------- |
| 20251215_vendor_images_is_primary.sql | Yüksek  | is_primary kolonu + unique index |

---

## 📁 Supabase Durum Özeti

| Kaynak                     | Durum     | Notlar                                           |
| -------------------------- | --------- | ------------------------------------------------ |
| `vendor_images` tablo      | ✅ Var    | id, vendor_id, image_url, sort_order, created_at |
| `vendor_images` data       | ⚠️ Az     | 4 foto, 1 vendor                                 |
| `vendor_images.is_primary` | ❌ Yok    | Migration gerekli                                |
| `favorites` RLS            | ✅ Tamam  | SELECT/INSERT/DELETE policy'leri doğru           |
| `vendor-images` bucket     | ✅ Public | Storage hazır                                    |
| `vendors.logo_url`         | ✅ Var    | Fallback olarak kullanılır                       |

---

## 🎯 Sprint Sıralaması (Önerilen)

### Sprint 1: Bug Fix & Foundation (1-2 gün)

1. ✅ Favoriler bug fix (kritik)
2. ✅ Fiyat filtresi kaldır (quick win)
3. ✅ vendor_images migration (is_primary)

### Sprint 2: Foto Sistemi (2-3 gün)

4. Query güncelleme (images array)
5. ImageGallery component
6. VendorCard foto entegrasyonu

### Sprint 3: Mobile Responsive (2-3 gün)

7. /vendors mobile UX
8. /vendors/[slug] sticky CTA
9. Empty states

### Sprint 4: Conversion Features (4-5 gün)

10. Quick Quote form
11. Badge sistemi (MVP: 5 badge)
12. Yanıt süresi sinyali (3 mesaj guard ile)

### Sprint 5: Analytics Foundation (2-3 gün)

13. Lead → Quote conversion tracking
14. Quote → Won tracking
15. Vendor analytics view

---

## 📝 Mimari Kararlar Özeti

| Karar                        | Detay                                                | Sebep                             |
| ---------------------------- | ---------------------------------------------------- | --------------------------------- |
| **Favorites: Single source** | `useFavorites()` hook tek kaynak                     | Senkronizasyon                    |
| **event_type = segments**    | Ayrı enum/tablo yok                                  | Tek kaynak, analytics tutarlılığı |
| **RPC params deprecated**    | `min_price`, `max_price` kalacak ama kullanılmayacak | Backward compatibility            |
| **Yanıt süresi guard**       | Min 3 mesaj sonrası aktif                            | Yeni vendor'ları koruma           |
| **Badge MVP**                | 5 badge ilk release                                  | Scope control                     |
| **Cross-tab sync yok**       | Known limitation                                     | Complexity vs value               |

---

## 📝 Notlar

- RPC `search_vendors` parametreleri `p_min_price`, `p_max_price` **deprecated** (v3.0)
- Favorites state yönetimi: **Single source of truth** = `useFavorites()` hook
- Quick Quote `event_type` → `segments.slug` (ayrı tablo açılmayacak)
- Yanıt süresi: minimum 3 mesaj/lead sonrası hesaplanacak
- Cross-tab sync şu an yok (known limitation)
- Image optimization: next/image `sizes` prop zorunlu

---

_Bu dosya her sprint sonunda güncellenir._  
_Son güncelleyen: Claude | Tarih: 15 Aralık 2025 | Versiyon: 3.0_
