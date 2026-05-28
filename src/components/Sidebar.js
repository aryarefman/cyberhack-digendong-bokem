'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Map,
  Thermometer,
  CalendarClock,
  MessageSquare,
  Upload,
  FileBarChart,
  Database,
  ShieldCheck,
  LogOut,
  User,
  Leaf,
  Bell
} from 'lucide-react';
import './Sidebar.css';

const MENU_GROUPS = [
  {
    group: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
    ]
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
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* Logo / Brand Header (Figma: 254x88) */}
        <div className="sidebar-logo">
          <Link href="/dashboard" className="sidebar-logo-link">
            <div className="sidebar-logo-icon">
              <Leaf size={22} color="#FFFFFF" />
            </div>
            <div className="sidebar-logo-text">
              <h1 className="sidebar-logo-title">AromaSys</h1>
              <span className="sidebar-brand-sub">SIMA AROME</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links (Figma: 254x823) */}
        <nav className="sidebar-nav">
          {MENU_GROUPS.map((group) => {
            // Filter out items that the user cannot access
            const visibleItems = group.items.filter(item => !item.requireAudit || canViewAudit());
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="sidebar-group">
                <div className="sidebar-group-title">{group.group}</div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={20} className="sidebar-item-icon" />
                      <span className="sidebar-item-label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer: Logout Link (Figma: 254x65) */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-link" onClick={logout} title="Logout" aria-label="Logout">
            <LogOut size={18} className="sidebar-logout-icon" />
            <span className="sidebar-logout-label">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
