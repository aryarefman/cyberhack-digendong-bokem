'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, Map, Thermometer, CalendarClock,
  Upload, FileBarChart, Database, ShieldCheck, LogOut, Leaf, Bell, User,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAudit?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    group: 'MAIN',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'WAREHOUSE',
    items: [
      { label: 'Interactive Floor Plan', href: '/digital-twin/floor-plan', icon: Map },
      { label: 'FIFO & Expiry', href: '/digital-twin/fifo-expiry', icon: CalendarClock },
      { label: 'Cold-Chain Monitor', href: '/digital-twin/cold-chain', icon: Thermometer },
    ],
  },
  {
    group: 'PRODUCTION',
    items: [
      { label: 'Data Ingestion', href: '/copilot/upload', icon: Upload },
      { label: 'Auto-Report', href: '/copilot/report', icon: FileBarChart },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { label: 'Profile', href: '/settings/profile', icon: User },
      { label: 'Notifications', href: '/settings/notifications', icon: Bell },
      { label: 'Inventory Master', href: '/settings/inventory', icon: Database },
      { label: 'Audit Trail', href: '/settings/audit', icon: ShieldCheck, requireAudit: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, canViewAudit } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#2C742F] border-r border-[#2C742F]/10 h-full shrink-0">
      {/* Brand */}
      <div className="h-16 border-b border-white/10 flex flex-col items-center justify-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-2xl text-emerald-50 leading-none">AromaSys</span>
        </Link>
        <div className="text-[#AAE970] text-[10px] font-bold uppercase tracking-widest mt-1">
          SIMA AROME
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto">
        {MENU_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.requireAudit || canViewAudit());
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.group} className="space-y-1">
              <div className="px-4 py-1">
                <span className="text-green-200 text-xs font-bold uppercase tracking-wider opacity-70">
                  {group.group}
                </span>
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full px-4 py-2.5 flex items-center gap-3.5 transition-all text-sm font-semibold group relative ${
                        isActive
                          ? 'text-[#CBEAD2] bg-white/10 rounded-l-xl rounded-r-none border-r-4 border-[#BCF389]'
                          : 'text-green-200/80 hover:text-white hover:bg-white/5 rounded-xl'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#CBEAD2]' : 'text-green-200/70 group-hover:text-green-100'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3.5 text-sm font-semibold text-green-200/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4 text-green-200/70" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
