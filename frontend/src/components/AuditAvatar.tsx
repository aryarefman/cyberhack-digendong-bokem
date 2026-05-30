"use client";

import { getInitials } from "@/lib/utils";

interface AuditAvatarProps {
  avatar: string | null | undefined;
  name: string;
}

/**
 * Displays a user avatar for audit trail entries.
 * Shows the profile photo if available, otherwise falls back to initials.
 */
export function AuditAvatar({ avatar, name }: AuditAvatarProps) {
  if (avatar) {
    return (
      <div className="w-8 h-8 rounded-full border border-[#AAE970]/30 overflow-hidden flex items-center justify-center shrink-0">
        <img
          className="w-full h-full object-cover"
          src={avatar}
          alt={name}
        />
      </div>
    );
  }

  const initials = getInitials(name || "");

  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 border border-[#AAE970]/30 flex items-center justify-center shrink-0 text-xs font-medium text-gray-700">
      {initials || "?"}
    </div>
  );
}
