"use client";

import { getVendorBadges, VendorBadgeFields } from "@/config/badges";
import VendorBadge from "./VendorBadge";

interface VendorBadgesProps {
  vendor: VendorBadgeFields;
  maxBadges?: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export default function VendorBadges({
  vendor,
  maxBadges = 3,
  size = "sm",
  showLabel = true,
  className = "",
}: VendorBadgesProps) {
  const badges = getVendorBadges(vendor, maxBadges);

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <VendorBadge
          key={badge.key}
          badge={badge}
          size={size}
          showLabel={showLabel}
        />
      ))}
    </div>
  );
}
