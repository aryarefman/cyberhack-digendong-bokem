"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  Package,
  Thermometer,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
  ArrowUpRight
} from "lucide-react";
import { useNotifications } from "@/lib/notifications";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const NOTIFICATION_TYPES = {
  alert: { icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50 border-red-200/50" },
  inventory: { icon: Package, color: "text-lime-800", bg: "bg-emerald-50/50 border-[#AAE970]/10" },
  coldchain: { icon: Thermometer, color: "text-blue-600", bg: "bg-blue-50/40 border-blue-200/30" },
  upload: { icon: UploadCloud, color: "text-lime-800", bg: "bg-emerald-50/50 border-[#AAE970]/10" },
  audit: { icon: ShieldCheck, color: "text-stone-700", bg: "bg-stone-50 border-stone-200/50" },
  system: { icon: Bell, color: "text-amber-600", bg: "bg-amber-50/40 border-amber-200/30" }
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  function formatTimeAgo(isoString: string) {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifJustNow');
    if (diffMins < 60) return t('notifMinAgo').replace('{n}', String(diffMins));
    if (diffHours < 24) return t('notifHourAgo').replace('{n}', String(diffHours));
    return t('notifDayAgo').replace('{n}', String(diffDays));
  }

  const filteredNotifications = filter === "all"
    ? notifications
    : filter === "unread"
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === filter);

  return (
    <div className="space-y-6 pb-16 text-left relative font-sans max-w-3xl">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">{t('notificationsTitle')}</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium">
            {unreadCount > 0 
              ? t('notifUnreadCount').replace('{count}', String(unreadCount))
              : t('notifAllRead')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-[#AAE970]/30 hover:border-[#AAE970]/50 rounded-full bg-white text-xs font-bold text-[#2C742F] transition-all hover:bg-emerald-50/20"
          >
            <CheckCircle2 size={14} /> {t('notifMarkAllRead')}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[
          { key: "all", label: t('notifFilterAll') },
          { key: "unread", label: t('notifFilterUnread') },
          { key: "alert", label: t('notifFilterAlerts') },
          { key: "inventory", label: t('notifFilterInventory') },
          { key: "coldchain", label: t('notifFilterColdChain') },
          { key: "system", label: t('notifFilterSystem') }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              filter === tab.key 
                ? "bg-[#2C742F] text-white" 
                : "bg-white border border-[#AAE970]/20 text-stone-600 hover:bg-emerald-50/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#F5FBF3] rounded-2xl border border-[#AAE970]/10 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[6px_6px_54px_rgba(0,0,0,0.04)]"
            >
              <Bell className="w-10 h-10 text-stone-300" />
              <p className="text-sm font-bold text-stone-500">{t('notifNone')}</p>
              <p className="text-xs text-stone-400">{t('notifNoneDesc')}</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif, idx) => {
              const typeConfig = NOTIFICATION_TYPES[notif.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.system;
              const IconComponent = typeConfig.icon;
              
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`bg-[#F5FBF3] border rounded-2xl p-4 flex gap-4 items-start cursor-pointer hover:scale-[1.005] hover:shadow-md transition-all relative ${
                    !notif.isRead 
                      ? "border-[#AAE970]/40 shadow-[6px_6px_54px_rgba(44,116,47,0.05)] bg-[#F5FBF3]" 
                      : "border-[#AAE970]/10 bg-white/40 shadow-sm"
                  }`}
                >
                  {/* Left Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeConfig.color} ${typeConfig.bg}`}>
                    <IconComponent size={18} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-sm ${!notif.isRead ? "font-bold text-green-950" : "text-stone-700 font-semibold"}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1 shrink-0">
                        <Clock size={11} className="text-stone-400" />
                        {formatTimeAgo(notif.time)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium leading-relaxed">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {notif.href && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); router.push(notif.href!); }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#2C742F] hover:underline"
                        >
                          <ArrowUpRight size={11} className="shrink-0" /> {t('viewDetail')}
                        </button>
                      )}
                      {!notif.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="text-[10px] font-bold text-[#79747E] hover:text-[#1C1B1F] hover:underline"
                        >
                          {t('markRead')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread Indicator dot */}
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EA4B48] shrink-0 self-center animate-pulse" />
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
