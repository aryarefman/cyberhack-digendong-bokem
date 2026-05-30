"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Users, Package, ChevronRight } from "lucide-react";
import { Leaf } from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const sidebarItems: SidebarItem[] = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Data Ingestion",
    href: "/dashboard/data-ingestion",
    icon: Database,
    badge: "New",
  },
  {
    name: "Floor Plan",
    href: "/dashboard/floor-plan",
    icon: Package,
  },
  {
    name: "User Management",
    href: "/dashboard/user-management",
    icon: Users,
  },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -280, opacity: isOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:relative left-0 top-0 h-screen w-72 bg-gradient-to-b from-brand-sage-forest/10 to-brand-sage-forest/5 border-r border-brand-sage-forest/10 z-40 flex flex-col overflow-y-auto scrollbar-hide"
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-b from-brand-sage-forest/5 to-transparent p-6 border-b border-brand-sage-forest/10 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-brand-sage-forest"
          >
            <div className="p-2 bg-brand-sage-lime/20 rounded-lg">
              <Leaf className="w-5 h-5 fill-current rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-widest uppercase">AromaSys</span>
              <span className="text-xs text-brand-sage-forest/60 font-semibold">Dashboard</span>
            </div>
          </motion.div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`relative group flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-brand-sage-forest/20 border border-brand-sage-forest/30"
                        : "hover:bg-brand-sage-forest/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          active
                            ? "text-brand-sage-forest"
                            : "text-brand-sage-forest/60 group-hover:text-brand-sage-forest"
                        }`}
                      />
                      <span
                        className={`font-semibold text-sm transition-colors ${
                          active
                            ? "text-brand-sage-forest"
                            : "text-brand-sage-forest/70 group-hover:text-brand-sage-forest"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 text-xs font-bold bg-brand-sage-lime/20 text-brand-sage-lime rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}

                    {/* Active Indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-brand-sage-lime to-brand-sage-forest rounded-l-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-0 bg-gradient-to-t from-brand-sage-forest/10 to-transparent p-4 border-t border-brand-sage-forest/10 space-y-3"
        >
          <div className="p-4 bg-brand-sage-lime/10 rounded-lg border border-brand-sage-lime/20">
            <p className="text-xs font-semibold text-brand-sage-forest mb-2">Quick Help</p>
            <p className="text-xs text-brand-sage-forest/70 leading-relaxed">
              Need assistance? Check our documentation or contact support.
            </p>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
