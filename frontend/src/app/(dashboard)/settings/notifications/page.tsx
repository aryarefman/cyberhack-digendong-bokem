'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Package, Thermometer, Upload, ShieldCheck, CheckCircle2, Monitor } from 'lucide-react';
import { useNotifications } from '@/lib/notifications';
import type { NotificationType } from '@/types';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  alert: { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-[#EA4B48]' },
  inventory: { icon: Package, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  coldchain: { icon: Thermometer, bg: 'bg-blue-100', text: 'text-blue-600' },
  upload: { icon: Upload, bg: 'bg-purple-100', text: 'text-purple-600' },
  audit: { icon: ShieldCheck, bg: 'bg-stone-100', text: 'text-[#79747E]' },
  system: { icon: Monitor, bg: 'bg-amber-100', text: 'text-amber-600' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'alert', label: 'Alerts' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'coldchain', label: 'Cold Chain' },
  { key: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Notifications</h1>
          <p className="text-sm text-[#79747E] mt-0.5">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all">
            <CheckCircle2 className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${filter === tab.key ? 'bg-[#2C742F] text-white border-transparent' : 'bg-white text-[#1C1B1F] border-stone-200 hover:border-[#2C742F]/30'}`}>
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-[#EA4B48] text-white text-[9px] rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#79747E] bg-white rounded-2xl border border-stone-100 shadow-sm">
            <Bell className="w-10 h-10" />
            <p className="text-sm font-semibold">No notifications</p>
          </div>
        ) : filtered.map((notif, i) => {
          const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
          const Icon = cfg.icon;
          return (
            <motion.button
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => markAsRead(notif.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${!notif.isRead ? 'bg-[#D7E5D8]/30 border-[#2C742F]/20' : 'bg-white border-stone-100 hover:bg-stone-50'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#1C1B1F]">{notif.title}</p>
                  {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#EA4B48] shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-[#79747E] mt-0.5 leading-relaxed">{notif.description}</p>
                <p className="text-xs text-[#79747E]/70 mt-1.5">{timeAgo(notif.time)}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
