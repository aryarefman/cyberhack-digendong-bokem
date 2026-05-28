"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Database, Warehouse, Users } from "lucide-react";
import { cn } from "../../lib/utils";

const iconMap = {
  LayoutDashboard,
  Database,
  Warehouse,
  Users
};

export interface SidebarItemProps {
  name: string;
  href: string;
  iconName: keyof typeof iconMap;
  description: string;
}

export function SidebarItem({ name, href, iconName, description }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = iconMap[iconName];

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-colors text-sm font-semibold group",
        isActive ? "text-brand-amber-400 font-bold" : "text-zinc-400 hover:text-white"
      )}
      title={description}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-gradient-to-r from-brand-amber-500/10 to-brand-amber-500/[0.02] border-l-[3px] border-brand-amber-500 rounded-r-xl"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      
      <Icon
        className={cn(
          "w-5 h-5 transition-transform duration-200 group-hover:scale-110 z-10",
          isActive ? "text-brand-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
        )}
      />
      
      <span className="z-10">{name}</span>
    </Link>
  );
}

export default SidebarItem;
