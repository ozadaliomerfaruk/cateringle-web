// src/config/badges.ts
import {
  Lightning,
  Clock,
  Truck,
  Cookie,
  Medal,
  Snowflake,
  MapTrifold,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

export interface BadgeConfig {
  key: string;
  label: string;
  icon: Icon;
  color: string; // Tailwind bg color
  textColor: string; // Tailwind text color
  description: string;
  vendorField: keyof VendorBadgeFields;
}

// Vendor'dan badge için gerekli alanlar
export interface VendorBadgeFields {
  accepts_last_minute?: boolean | null;
  available_24_7?: boolean | null;
  free_delivery?: boolean | null;
  free_tasting?: boolean | null;
  halal_certified?: boolean | null;
  has_refrigerated_vehicle?: boolean | null;
  serves_outside_city?: boolean | null;
}

// Badge tanımları - sıralama önceliğe göre
export const BADGE_CONFIG: BadgeConfig[] = [
  {
    key: "last_minute",
    label: "Aynı Gün",
    icon: Lightning,
    color: "bg-amber-100",
    textColor: "text-amber-700",
    description: "Son dakika siparişleri kabul eder",
    vendorField: "accepts_last_minute",
  },
  {
    key: "24_7",
    label: "7/24",
    icon: Clock,
    color: "bg-blue-100",
    textColor: "text-blue-700",
    description: "7 gün 24 saat hizmet verir",
    vendorField: "available_24_7",
  },
  {
    key: "free_delivery",
    label: "Ücretsiz Teslimat",
    icon: Truck,
    color: "bg-green-100",
    textColor: "text-green-700",
    description: "Teslimat ücreti almaz",
    vendorField: "free_delivery",
  },
  {
    key: "free_tasting",
    label: "Ücretsiz Tadım",
    icon: Cookie,
    color: "bg-orange-100",
    textColor: "text-orange-700",
    description: "Önceden tadım imkanı sunar",
    vendorField: "free_tasting",
  },
  {
    key: "halal",
    label: "Helal",
    icon: Medal,
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
    description: "Helal sertifikalı",
    vendorField: "halal_certified",
  },
  {
    key: "refrigerated",
    label: "Soğuk Zincir",
    icon: Snowflake,
    color: "bg-cyan-100",
    textColor: "text-cyan-700",
    description: "Frigorifik araç ile teslimat",
    vendorField: "has_refrigerated_vehicle",
  },
  {
    key: "outside_city",
    label: "Şehir Dışı",
    icon: MapTrifold,
    color: "bg-purple-100",
    textColor: "text-purple-700",
    description: "Şehir dışına teslimat yapar",
    vendorField: "serves_outside_city",
  },
];

// Vendor'dan aktif badge'leri hesapla
export function getVendorBadges(
  vendor: VendorBadgeFields,
  maxBadges?: number
): BadgeConfig[] {
  const activeBadges = BADGE_CONFIG.filter(
    (badge) => vendor[badge.vendorField] === true
  );

  if (maxBadges && maxBadges > 0) {
    return activeBadges.slice(0, maxBadges);
  }

  return activeBadges;
}

// Tek bir badge'in aktif olup olmadığını kontrol et
export function hasBadge(vendor: VendorBadgeFields, badgeKey: string): boolean {
  const badge = BADGE_CONFIG.find((b) => b.key === badgeKey);
  if (!badge) return false;
  return vendor[badge.vendorField] === true;
}
