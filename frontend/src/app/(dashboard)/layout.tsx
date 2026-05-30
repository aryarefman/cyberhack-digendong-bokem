'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { NotificationProvider, useNotifications } from '@/lib/notifications';
import { getDynamicZones } from '@/lib/mockData';
import Sidebar from '@/components/Sidebar';
import ChatbotOverlay from '@/components/ChatbotOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Settings as SettingsIcon, ChevronDown, User, Key, Activity, LogOut,
  Search, AlertTriangle, Package, MapPin, Info, Snowflake, UploadCloud,
  ClipboardList, Monitor, Bot, Menu, X,
  LayoutDashboard, Map, Thermometer, CalendarClock, Upload, FileBarChart,
  Database, ShieldCheck,
} from 'lucide-react';
import type { ChatMessage, NotificationType } from '@/types';
import { api } from '@/lib/api';

const SEARCH_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Interactive Floor Plan', href: '/digital-twin/floor-plan', icon: Map },
  { label: 'FIFO & Expiry', href: '/digital-twin/fifo-expiry', icon: CalendarClock },
  { label: 'Cold-Chain Monitor', href: '/digital-twin/cold-chain', icon: Thermometer },
  { label: 'Data Ingestion', href: '/copilot/upload', icon: Upload },
  { label: 'Auto-Report', href: '/copilot/report', icon: FileBarChart },
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'Inventory Master', href: '/settings/inventory', icon: Database },
  { label: 'Audit Trail', href: '/settings/audit', icon: ShieldCheck },
];

function getNotifIcon(type: NotificationType) {
  switch (type) {
    case 'alert': return <AlertTriangle className="w-4 h-4" />;
    case 'coldchain': return <Snowflake className="w-4 h-4" />;
    case 'inventory': return <Package className="w-4 h-4" />;
    case 'upload': return <UploadCloud className="w-4 h-4" />;
    case 'audit': return <ClipboardList className="w-4 h-4" />;
    case 'system': return <Monitor className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
}

function formatBadge(count: number): string | null {
  if (count <= 0) return null;
  if (count > 99) return '99+';
  return String(count);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </NotificationProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [inventoryResults, setInventoryResults] = useState<Array<{ id: string; name: string; category: string; location: string }>>([]);
  const [auditResults, setAuditResults] = useState<Array<{ id: number; user?: string; username?: string; action: string; detail?: string }>>([]);
  const [zoneResults, setZoneResults] = useState<Array<{ id: string; name: string; color: string; type: string; tempMin: number | null; tempMax: number | null }>>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: Date.now(),
    sender: 'ai',
    text: `Hey there! I'm Aro, your AromaSys AI Copilot, connected live to the warehouse database. Ask me anything about your warehouse operations!`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }]);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const loadAvatar = () => {
      try {
        const saved = localStorage.getItem('aromasys_user');
        if (saved) setUserAvatar(JSON.parse(saved).avatar || null);
      } catch {}
    };
    loadAvatar();
    const handleStorage = (e: StorageEvent) => { if (!e.key || e.key === 'aromasys_user') loadAvatar(); };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('aromasys_avatar_updated', loadAvatar);
    return () => { window.removeEventListener('storage', handleStorage); window.removeEventListener('aromasys_avatar_updated', loadAvatar); };
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      setShowProfileMenu(false);
      setShowNotifications(false);
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setInventoryResults([]); setAuditResults([]); setZoneResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setZoneResults(getDynamicZones().filter(z => z.name.toLowerCase().includes(q) || z.id.toLowerCase().includes(q) || z.type.toLowerCase().includes(q)).slice(0, 5));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setInventoryLoading(true);
      try {
        const invData = await api.get<{ success: boolean; items: Array<{ id: string; name: string; category: string; location: string }> }>(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
        setInventoryResults(invData.success ? (invData.items ?? []).slice(0, 5) : []);

        const auditData = await api.get<{ success: boolean; logs: Array<{ id: number; user?: string; username?: string; action: string; detail?: string }> }>(`/audit?user=${encodeURIComponent(searchQuery.trim())}`);
        if (auditData.success && auditData.logs?.length > 0) {
          setAuditResults(auditData.logs.slice(0, 3));
        } else {
          const all = await api.get<{ success: boolean; logs: Array<{ id: number; user?: string; username?: string; action: string; detail?: string }> }>('/audit');
          if (all.success) {
            setAuditResults((all.logs ?? []).filter(l => l.user?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q)).slice(0, 3));
          } else setAuditResults([]);
        }
      } catch { setInventoryResults([]); setAuditResults([]); }
      finally { setInventoryLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const filteredPages = searchQuery.trim()
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const goTo = (href: string) => {
    router.push(href);
    setSearchQuery(''); setShowSearchDropdown(false);
    setInventoryResults([]); setAuditResults([]); setZoneResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D7E5D8]">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="spinner mx-auto" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <h2 className="text-lg font-bold text-[#1C1B1F]">AromaSys</h2>
          <p className="text-sm text-[#79747E]">Memuat data sistem...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const menuGroups = [
    { title: 'MAIN', items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
    { title: 'WAREHOUSE', items: [{ name: 'Floor Plan', href: '/digital-twin/floor-plan', icon: Map }, { name: 'FIFO & Expiry', href: '/digital-twin/fifo-expiry', icon: CalendarClock }, { name: 'Cold-Chain', href: '/digital-twin/cold-chain', icon: Thermometer }] },
    { title: 'PRODUCTION', items: [{ name: 'Data Ingestion', href: '/copilot/upload', icon: Upload }, { name: 'Auto-Report', href: '/copilot/report', icon: FileBarChart }] },
    { title: 'SETTINGS', items: [{ name: 'Profile', href: '/settings/profile', icon: User }, { name: 'Inventory Master', href: '/settings/inventory', icon: Database }, { name: 'Audit Trail', href: '/settings/audit', icon: ShieldCheck }] },
  ];

  return (
    <div className="h-screen w-full flex bg-[#D7E5D8] select-none font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#2C742F] p-5 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-semibold text-2xl text-emerald-50">AromaSys</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-green-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-6 space-y-5 overflow-y-auto">
                {menuGroups.map(group => (
                  <div key={group.title} className="space-y-1">
                    <span className="px-4 text-green-200 text-xs font-bold uppercase tracking-wider opacity-70 block">{group.title}</span>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <button key={item.href} onClick={() => { router.push(item.href); setIsMobileOpen(false); }}
                          className={`w-full px-4 py-2.5 flex items-center gap-3.5 text-sm font-semibold rounded-xl transition-all ${isActive ? 'text-[#CBEAD2] bg-white/10' : 'text-green-200/80 hover:text-white hover:bg-white/5'}`}>
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
              <div className="border-t border-white/10 pt-4">
                <button onClick={logout} className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3.5 text-sm font-semibold text-green-200/80 hover:text-white hover:bg-white/5 transition-all">
                  <LogOut className="w-4 h-4" /><span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 bg-[#D7E5D8]/95 border-b border-[#2C742F]/10 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(true)} className="p-1.5 rounded-lg border border-[#2C742F]/20 bg-white/10 hover:bg-white/20 lg:hidden text-[#2C742F]">
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div ref={searchWrapperRef} className="relative hidden md:block w-72" onClick={e => e.stopPropagation()}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
              <input
                type="text"
                placeholder="Search pages, inventory, zones..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearchDropdown(e.target.value.trim().length > 0); }}
                onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
                className="w-full bg-[#f3f6f3] rounded-full border border-stone-300 py-1.5 pl-10 pr-4 text-xs font-semibold text-[#1C1B1F] placeholder:text-[#79747E]/60 focus:outline-none focus:ring-1 focus:ring-[#2C742F]/20"
              />

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 w-80 bg-white/95 backdrop-blur-md border border-stone-200/60 rounded-2xl shadow-xl z-50 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    {(filteredPages.length > 0 || inventoryResults.length > 0 || auditResults.length > 0 || zoneResults.length > 0) ? (
                      <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                        {filteredPages.length > 0 && (
                          <>
                            <p className="px-3 py-1 text-[10px] font-bold text-[#79747E] uppercase tracking-wider">Pages</p>
                            {filteredPages.map(item => {
                              const Icon = item.icon;
                              return (
                                <button key={item.href} onClick={() => goTo(item.href)}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#D7E5D8]/60 transition-all text-left">
                                  <div className="w-7 h-7 rounded-lg bg-[#2C742F]/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-[#2C742F]" />
                                  </div>
                                  <span className="text-sm font-semibold text-[#1C1B1F]">{item.label}</span>
                                </button>
                              );
                            })}
                          </>
                        )}
                        {inventoryResults.length > 0 && (
                          <>
                            <p className="px-3 py-1 text-[10px] font-bold text-[#79747E] uppercase tracking-wider">Inventory</p>
                            {inventoryResults.map(item => (
                              <button key={item.id} onClick={() => goTo('/settings/inventory')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#D7E5D8]/60 transition-all text-left">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                  <Package className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#1C1B1F] truncate">{item.name}</p>
                                  <p className="text-[10px] text-[#79747E]">{item.category} · {item.location}</p>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                        {zoneResults.length > 0 && (
                          <>
                            <p className="px-3 py-1 text-[10px] font-bold text-[#79747E] uppercase tracking-wider">Zones</p>
                            {zoneResults.map(zone => (
                              <button key={zone.id} onClick={() => goTo('/digital-twin/floor-plan')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#D7E5D8]/60 transition-all text-left">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: zone.color + '20' }}>
                                  <MapPin className="w-3.5 h-3.5" style={{ color: zone.color }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#1C1B1F] truncate">{zone.name}</p>
                                  <p className="text-[10px] text-[#79747E]">{zone.type}</p>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                        {auditResults.length > 0 && (
                          <>
                            <p className="px-3 py-1 text-[10px] font-bold text-[#79747E] uppercase tracking-wider">Audit Logs</p>
                            {auditResults.map(log => (
                              <button key={log.id} onClick={() => goTo('/settings/audit')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#D7E5D8]/60 transition-all text-left">
                                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                  <Activity className="w-3.5 h-3.5 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#1C1B1F] truncate">{log.user || log.username} — {log.action}</p>
                                  <p className="text-[10px] text-[#79747E] truncate">{log.detail?.substring(0, 50)}</p>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                        {inventoryLoading && filteredPages.length === 0 && inventoryResults.length === 0 && (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-[#79747E]">
                            <div className="spinner" style={{ width: 16, height: 16 }} />
                            <span>Searching...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6 text-[#79747E]">
                        {inventoryLoading ? (
                          <><div className="spinner" /><span className="text-sm">Searching...</span></>
                        ) : (
                          <><Search className="w-5 h-5" /><span className="text-sm">No results found</span></>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: notifications, chatbot, settings, profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className="relative p-2 rounded-full border border-[#2C742F]/10 bg-white/40 hover:bg-white/70 text-[#1C1B1F] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {formatBadge(unreadCount) && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#EA4B48] text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {formatBadge(unreadCount)}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-stone-200/60 rounded-2xl shadow-xl z-50 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                      <h4 className="font-bold text-sm text-[#1C1B1F]">Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#2C742F] hover:text-[#366306]">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-[#79747E] text-center py-6">No notifications</p>
                      ) : notifications.slice(0, 5).map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#D7E5D8]/40 transition-all text-left border-b border-stone-100/60 last:border-0 ${!notif.isRead ? 'bg-[#D7E5D8]/20' : ''}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${notif.type === 'alert' ? 'bg-red-100 text-red-500' : 'bg-[#2C742F]/10 text-[#2C742F]'}`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#1C1B1F]">{notif.title}</p>
                            <p className="text-xs text-[#79747E] mt-0.5 leading-relaxed">{notif.description}</p>
                          </div>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#EA4B48] shrink-0 mt-2" />}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { router.push('/settings/notifications'); setShowNotifications(false); }}
                      className="w-full py-3 text-xs font-bold text-[#2C742F] hover:bg-[#D7E5D8]/30 transition-all border-t border-stone-100"
                    >
                      See all notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chatbot */}
            <button
              onClick={e => { e.stopPropagation(); setIsChatOpen(true); }}
              className="p-2 rounded-full border border-[#2C742F]/10 bg-white/40 hover:bg-white/70 text-[#1C1B1F] transition-colors"
              title="Production Copilot"
            >
              <Bot className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => router.push('/settings/profile')}
              className="p-2 rounded-full border border-[#2C742F]/10 bg-white/40 hover:bg-white/70 text-[#1C1B1F] transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[#2C742F]/15 mx-1" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-white/40 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#2C742F] flex items-center justify-center text-white text-sm font-bold border-2 border-white/30 overflow-hidden shrink-0">
                  {userAvatar
                    ? <img src={userAvatar} alt={user.name} className="w-full h-full object-cover" />
                    : user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-sm font-bold text-[#1C1B1F] leading-tight">{user.name}</span>
                  <span className="text-[10px] text-[#79747E] font-semibold">{user.role}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#79747E] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-1 space-y-0.5">
                        <button onClick={() => { router.push('/settings/profile'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-[#D7E5D8]/60 rounded-xl transition-all font-semibold text-sm text-left">
                          <User className="w-4 h-4 text-blue-500 shrink-0" /><span>Manage Account</span>
                        </button>
                        <button onClick={() => { router.push('/settings/profile?tab=password'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-[#D7E5D8]/60 rounded-xl transition-all font-semibold text-sm text-left">
                          <Key className="w-4 h-4 text-purple-500 shrink-0" /><span>Change Password</span>
                        </button>
                        <button onClick={() => { router.push('/settings/audit'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-[#D7E5D8]/60 rounded-xl transition-all font-semibold text-sm text-left">
                          <Activity className="w-4 h-4 text-orange-500 shrink-0" /><span>Activity Log</span>
                        </button>
                        <div className="h-px bg-stone-200/60 my-1 mx-2" />
                        <button onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[#EA4B48] hover:bg-red-50 rounded-xl transition-all font-semibold text-sm text-left">
                          <LogOut className="w-4 h-4 shrink-0" /><span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 relative overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <ChatbotOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        setMessages={setChatMessages}
      />
    </div>
  );
}
