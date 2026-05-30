'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, Map, Thermometer, Calendar,
  Database, FileSpreadsheet, Layers, ShieldCheck,
  LogOut, User, Users, Microscope,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    group: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/overview', icon: LayoutDashboard },
      { label: 'Floor Plan', href: '/floor-plan', icon: Map },
    ],
  },
  {
    group: 'WAREHOUSE',
    items: [
      { label: 'Inventory Master', href: '/inventory-master', icon: Layers },
      { label: 'FIFO & Expiry', href: '/fifo-expiry', icon: Calendar },
      { label: 'Cold-Chain Monitor', href: '/cold-chain', icon: Thermometer },
      { label: 'Data Ingestion', href: '/data-ingestion', icon: Database },
    ],
  },
  {
    group: 'PRODUCTION',
    items: [
      { label: 'Auto-Report', href: '/auto-report', icon: FileSpreadsheet },
      { label: 'Audit Trail', href: '/audit-trail', icon: ShieldCheck },
      { label: 'AI Quality Control', href: '/qc', icon: Microscope },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { label: 'Profile & Settings', href: '/settings/profile', icon: User },
      { label: 'User Management', href: '/user-management', icon: Users },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#2C742F] border-r border-[#2C742F]/10 h-full shrink-0">
      {/* Brand */}
      <div className="h-16 border-b border-white/10 flex flex-col items-center justify-center shrink-0">
        <Link href="/overview" className="flex items-center gap-2 justify-center">
          <img src="/logo-cerah.png" alt="AromaSys" className="w-6 h-6 object-contain" />
          <span className="font-semibold text-2xl text-emerald-50 leading-none">AromaSys</span>
        </Link>
        <div className="text-[#AAE970] text-[10px] font-bold uppercase tracking-widest mt-1">
          SIMA AROME
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto">
        {MENU_GROUPS.map(group => (
          <div key={group.group} className="space-y-1">
            <div className="px-4 py-1">
              <span className="text-green-200 text-xs font-bold uppercase tracking-wider opacity-70">
                {group.group}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
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
        ))}
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
