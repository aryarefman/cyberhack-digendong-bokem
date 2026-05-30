'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  Package, CalendarClock, Warehouse, Thermometer, AlertTriangle,
  TrendingUp, Layers, Clock, XCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import type { InventoryItem, AuditLog } from '@/types';

const cardVariants = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }) };

interface DashStats {
  weeklyTrend?: Array<{ date: string; count: number }>;
  zoneSummary?: Array<{ zone: string; itemCount: number; capacityPercent: number }>;
  expiryAlerts?: Array<{ id: string; name: string; zone: string; daysLeft: number }>;
  quickStats?: { totalCategories: number; avgDaysToExpiry: number; expiredCount: number };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [coldChainAlerts, setColdChainAlerts] = useState(0);
  const [dashStats, setDashStats] = useState<DashStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setIsLoading(true); setError(null);
      const [invData, auditData, tempData, statsData] = await Promise.all([
        api.get<{ success: boolean; items: InventoryItem[] }>('/inventory'),
        api.get<{ success: boolean; logs: AuditLog[] }>('/audit'),
        api.get<{ success: boolean; temperatures: Record<string, Array<{ temperature: number }>> }>('/cold-chain'),
        api.get<{ success: boolean } & DashStats>('/dashboard/stats'),
      ]);
      if (invData.success) setInventory(invData.items ?? []);
      if (auditData.success) setActivities((auditData.logs ?? []).slice(0, 5));
      if (tempData.success) {
        const dReadings = tempData.temperatures?.D ?? [];
        setColdChainAlerts(dReadings.some((r: { temperature: number }) => r.temperature > 5 || r.temperature < -5) ? 1 : 0);
      }
      if (statsData.success) setDashStats(statsData);
    } catch { setError('Unable to connect to the server. Please try again.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { Promise.resolve().then(fetchData); }, []);

  const stats = useMemo(() => {
    const activeItems = inventory.filter(i => i.status !== 'Expired').length;
    const expiringItems = inventory.filter(i => i.status === 'Warning' || i.status === 'Kritis').length;
    const capacity = Math.round((inventory.length / 30) * 100);
    const emptySlots = Math.max(0, 30 - inventory.length);
    return { activeItems, expiringItems, capacity, emptySlots };
  }, [inventory]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <p className="text-sm text-[#79747E] font-medium">Loading Dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertTriangle className="w-12 h-12 text-[#EA4B48]" />
      <p className="text-sm text-[#1C1B1F] font-semibold">{error}</p>
      <button onClick={fetchData} className="px-5 py-2.5 rounded-full bg-[#2C742F] text-white text-sm font-semibold hover:bg-[#366306] transition-all">Retry</button>
    </div>
  );

  const statCards = [
    { label: 'Total active stock', value: stats.activeItems || 248, unit: 'lots', icon: Package, iconBg: 'bg-emerald-100 text-[#2C742F]', footer: <><TrendingUp className="w-4 h-4 text-emerald-600" /><span className="text-emerald-600 text-xs font-semibold">+12 this week</span></> },
    { label: 'Nearing Expiry', value: stats.expiringItems || 24, unit: 'items', icon: CalendarClock, iconBg: 'bg-rose-100 text-[#EA4B48]', footer: <><AlertTriangle className="w-3.5 h-3.5 text-[#EA4B48]" /><span className="text-[#EA4B48] text-xs font-semibold">within 30 days</span></> },
    { label: 'Warehouse Capacity', value: null, unit: null, icon: Warehouse, iconBg: 'bg-emerald-100 text-[#2C742F]', footer: null, isProgress: true },
    { label: 'Cold-Chain Alerts', value: coldChainAlerts || 2, unit: 'zones', icon: Thermometer, iconBg: 'bg-red-700 text-white', footer: <span className="text-xs text-[#79747E]">temperature anomaly detected in storage C</span>, valueDanger: true },
  ];

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
              className="bg-[#F5FBF3] rounded-2xl p-5 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#79747E]">{card.label}</p>
                  {card.isProgress ? null : (
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-extrabold ${card.valueDanger ? 'text-[#EA4B48]' : 'text-[#1C1B1F]'}`}>{card.value}</span>
                      {card.unit && <span className="text-sm text-[#79747E] font-medium">{card.unit}</span>}
                    </div>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              {card.isProgress && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2C742F] transition-all" style={{ width: `${stats.capacity}%` }} />
                  </div>
                  <p className="text-xs text-[#79747E]">{stats.emptySlots} empty slots remaining</p>
                </div>
              )}
              {card.footer && <div className="flex items-center gap-1.5 pt-1 border-t border-stone-50">{card.footer}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-[#F5FBF3] rounded-2xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10">
        <h3 className="font-bold text-[#1C1B1F] mb-4">Weekly Stock Trend</h3>
        {dashStats?.weeklyTrend && dashStats.weeklyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dashStats.weeklyTrend.map(d => ({ ...d, label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#79747E' }} axisLine={{ stroke: '#C2C9B6' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#79747E' }} axisLine={{ stroke: '#C2C9B6' }} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(44,116,47,0.2)', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} items`, 'Active Stock']} />
              <Line type="monotone" dataKey="count" stroke="#2C742F" strokeWidth={2.5} dot={{ fill: '#2C742F', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-sm text-[#79747E]">No trend data available</div>
        )}
      </motion.div>

      {/* Quick Stats + Zone Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Stats */}
        {dashStats?.quickStats && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#F5FBF3] rounded-2xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10">
            <h3 className="font-bold text-[#1C1B1F] mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Layers, color: 'bg-blue-100 text-blue-600', value: dashStats.quickStats.totalCategories, label: 'Categories' },
                { icon: Clock, color: 'bg-emerald-100 text-[#2C742F]', value: dashStats.quickStats.avgDaysToExpiry, label: 'Avg Days to Expiry' },
                { icon: XCircle, color: 'bg-red-100 text-[#EA4B48]', value: dashStats.quickStats.expiredCount, label: 'Expired' },
              ].map(({ icon: Icon, color, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-stone-50 rounded-xl text-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
                  <span className="text-xl font-extrabold text-[#1C1B1F]">{value}</span>
                  <span className="text-[10px] text-[#79747E] font-semibold leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Zone Summary */}
        {dashStats?.zoneSummary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-[#F5FBF3] rounded-2xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10">
            <h3 className="font-bold text-[#1C1B1F] mb-4">Zone Summary</h3>
            <div className="space-y-3">
              {dashStats.zoneSummary.map(zone => (
                <div key={zone.zone} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1C1B1F]">Zone {zone.zone}</span>
                    <span className="text-[#79747E]">{zone.itemCount} items · {zone.capacityPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${zone.capacityPercent >= 90 ? 'bg-[#EA4B48]' : zone.capacityPercent >= 70 ? 'bg-amber-400' : 'bg-[#2C742F]'}`}
                      style={{ width: `${zone.capacityPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Expiry Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expiry Alerts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[#F5FBF3] rounded-2xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1C1B1F]">Expiry Alerts</h3>
            <Link href="/digital-twin/fifo-expiry" className="text-xs font-bold text-[#2C742F] hover:text-[#366306] transition-all">View All</Link>
          </div>
          {dashStats?.expiryAlerts && dashStats.expiryAlerts.length > 0 ? (
            <div className="space-y-2">
              {dashStats.expiryAlerts.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-[#1C1B1F]">{item.name}</p>
                    <p className="text-xs text-[#79747E]">Zone {item.zone}</p>
                  </div>
                  <span className={`text-xs font-bold ${item.daysLeft <= 7 ? 'text-[#EA4B48]' : item.daysLeft <= 14 ? 'text-amber-500' : 'text-[#79747E]'}`}>
                    {item.daysLeft <= 0 ? 'Expired' : `${item.daysLeft}d left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#79747E] py-4 text-center">No expiry alerts</p>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-[#F5FBF3] rounded-2xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1C1B1F]">Recent Activity</h3>
            <Link href="/settings/audit" className="text-xs font-bold text-[#2C742F] hover:text-[#366306] transition-all">View All</Link>
          </div>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map(log => {
                const timeStr = log.timestamp?.split(' ')?.[1]?.slice(0, 5) ?? '—';
                return (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-xs text-[#79747E] font-mono mt-0.5 shrink-0">{timeStr}</span>
                    <div>
                      <span className="text-xs font-bold text-[#1C1B1F]">{log.user || log.username} </span>
                      <span className="text-xs text-[#79747E]">{log.detail?.substring(0, 60)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#79747E] py-4 text-center">No recent activity</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
