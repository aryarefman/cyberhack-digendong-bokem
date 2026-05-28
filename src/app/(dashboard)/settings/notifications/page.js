'use client';
import { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Package,
  Thermometer,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNotifications } from '@/lib/notifications';

const NOTIFICATION_TYPES = {
  alert: { icon: AlertTriangle, color: '#BA1A1A', bg: '#FFDAD6' },
  inventory: { icon: Package, color: '#366306', bg: '#D1F0D8' },
  coldchain: { icon: Thermometer, color: '#2980B9', bg: '#EBF5FB' },
  upload: { icon: Upload, color: '#366306', bg: '#D1F0D8' },
  audit: { icon: ShieldCheck, color: '#42493B', bg: '#F2F7ED' },
  system: { icon: Bell, color: '#D9B829', bg: '#FEF9E7' },
};

function formatTimeAgo(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === filter);

  return (
    <div className="animate-fade" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0 0 4px 0' }}>
            Notifications
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => markAllAsRead()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'alert', label: 'Alerts' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'coldchain', label: 'Cold Chain' },
          { key: 'system', label: 'System' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(tab.key)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Bell size={32} style={{ color: 'var(--color-text-disabled)', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>No notifications to show</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
            const IconComponent = typeConfig.icon;
            return (
              <div
                key={notification.id}
                className="card"
                onClick={() => markAsRead(notification.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  borderLeft: notification.isRead ? 'none' : `3px solid ${typeConfig.color}`,
                  background: notification.isRead ? 'var(--color-bg-surface)' : 'rgba(242, 247, 237, 0.5)',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: typeConfig.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: typeConfig.color,
                }}>
                  <IconComponent size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: notification.isRead ? 400 : 600, color: 'var(--color-text-primary)' }}>
                      {notification.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} />
                      {formatTimeAgo(notification.time)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {notification.description}
                  </p>
                </div>
                {!notification.isRead && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeConfig.color, flexShrink: 0, marginTop: '6px' }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
