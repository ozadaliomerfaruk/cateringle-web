"use client";

import { BadgeConfig } from "@/config/badges";

interface VendorBadgeProps {
  badge: BadgeConfig;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function VendorBadge({
  badge,
  size = "sm",
  showLabel = true,
}: VendorBadgeProps) {
  const Icon = badge.icon;

  const sizeClasses = {
    sm: {
      wrapper: "px-2 py-0.5 text-xs gap-1",
      icon: 12,
    },
    md: {
      wrapper: "px-2.5 py-1 text-sm gap-1.5",
      icon: 14,
    },
  };

  const classes = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${badge.color} ${badge.textColor} ${classes.wrapper}`}
      title={badge.description}
    >
      <Icon size={classes.icon} weight="fill" />
      {showLabel && <span>{badge.label}</span>}
    </span>
  );
}
