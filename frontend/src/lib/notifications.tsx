'use client';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { Notification, NotificationType } from '@/types';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Partial<Notification> & Pick<Notification, 'type' | 'title' | 'description'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const STORAGE_KEY = 'aromasys_notifications';

function createDefaultNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: 1, type: 'alert', title: 'Expiry Alert', description: 'Pewarna Makanan Merah akan kedaluwarsa dalam 5 hari', time: new Date(now - 1000 * 60 * 30).toISOString(), isRead: false },
    { id: 2, type: 'coldchain', title: 'Cold-Chain Warning', description: 'Suhu Zone C melebihi batas: 8.2°C', time: new Date(now - 1000 * 60 * 60 * 2).toISOString(), isRead: false },
    { id: 3, type: 'inventory', title: 'Stock Low', description: 'Essence Vanilla tersisa 2 kg', time: new Date(now - 1000 * 60 * 60 * 5).toISOString(), isRead: false },
    { id: 4, type: 'system', title: 'System Update', description: 'Database backup berhasil dilakukan', time: new Date(now - 1000 * 60 * 60 * 24).toISOString(), isRead: true },
  ];
}

function loadFromStorage(): Notification[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveToStorage(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => createDefaultNotifications());

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) setNotifications(saved);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addNotification = useCallback((notif: Partial<Notification> & Pick<Notification, 'type' | 'title' | 'description'>) => {
    setNotifications(prev => {
      const updated = [{ ...notif, id: notif.id ?? Date.now(), time: notif.time ?? new Date().toISOString(), isRead: notif.isRead ?? false } as Notification, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
