'use client';
import { useState, useEffect, useMemo } from 'react';
import { getDynamicZones, CATEGORIES } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { Download, Search, AlertCircle, SlidersHorizontal, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { InventoryItem, Zone } from '@/types';

const PAGE_SIZE = 10;

function getDaysLeft(expiry: string): number {
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function FifoExpiryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dynamicZones, setDynamicZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setDynamicZones(getDynamicZones()); }, []);

  async function fetchInventory() {
    try {
      setIsLoading(true); setError(null);
      const data = await api.get<{ success: boolean; items: InventoryItem[] }>('/inventory');
      if (data.success) setItems(data.items ?? []);
      else setError('Failed to load inventory data.');
    } catch { setError('Could not retrieve inventory data.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { Promise.resolve().then(fetchInventory); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, zoneFilter, categoryFilter]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (zoneFilter) result = result.filter(i => i.zone === zoneFilter);
    if (categoryFilter) result = result.filter(i => i.category === categoryFilter);
    if (searchTerm) result = result.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return result.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
  }, [items, zoneFilter, categoryFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statusBadge = (status: string) => {
    const m: Record<string, string> = {
      'Expired': 'bg-red-100 text-[#EA4B48] border-red-200',
      'Kritis': 'bg-orange-100 text-orange-700 border-orange-200',
      'Warning': 'bg-amber-100 text-amber-700 border-amber-200',
      'Aman': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return m[status] ?? 'bg-stone-100 text-stone-600 border-stone-200';
  };

  const daysColor = (days: number) => {
    if (days < 0) return 'text-[#EA4B48] font-bold';
    if (days <= 7) return 'text-[#EA4B48] font-bold';
    if (days <= 30) return 'text-amber-600 font-semibold';
    return 'text-[#79747E]';
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">FIFO & Expiry Tracker</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-[#1C1B1F] text-sm font-semibold hover:bg-stone-50 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Expired', count: items.filter(i => i.status === 'Expired').length, color: 'bg-red-100 text-[#EA4B48]' },
          { label: 'Kritis (≤7d)', count: items.filter(i => i.status === 'Kritis').length, color: 'bg-orange-100 text-orange-700' },
          { label: 'Warning (≤30d)', count: items.filter(i => i.status === 'Warning').length, color: 'bg-amber-100 text-amber-700' },
          { label: 'Aman', count: items.filter(i => i.status === 'Aman').length, color: 'bg-emerald-100 text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.count}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#F5FBF3] rounded-2xl p-4 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
          <input type="text" placeholder="Search item name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30" />
        </div>
        <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
          <option value="">All Zones</option>
          {dynamicZones.map(z => <option key={z.id} value={z.id}>Zone {z.id}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(searchTerm || zoneFilter || categoryFilter) && (
          <button onClick={() => { setSearchTerm(''); setZoneFilter(''); setCategoryFilter(''); }}
            className="text-xs font-bold text-[#EA4B48] hover:text-red-700 transition-all">Clear</button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p className="text-sm text-[#79747E]">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <AlertCircle className="w-10 h-10 text-[#EA4B48]" />
          <p className="text-sm font-semibold text-[#1C1B1F]">{error}</p>
          <button onClick={fetchInventory} className="px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-semibold">Retry</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5FBF3] rounded-2xl shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#79747E]">
              <PackageSearch className="w-10 h-10" />
              <p className="text-sm font-semibold">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#2C742F]/5 border-b border-stone-100 sticky top-0 z-10">
                  <tr>
                    {['#', 'Item Name', 'Category', 'Zone', 'Qty', 'Date In', 'Expiry', 'Days Left', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#79747E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, idx) => {
                    const days = getDaysLeft(item.expiry);
                    return (
                      <motion.tr key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                        className="border-b border-stone-50 last:border-0 hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-[#79747E]">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-[#1C1B1F] whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-3 text-[#79747E]">{item.category}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-stone-100 text-xs font-semibold text-[#1C1B1F]">Zone {item.zone}</span></td>
                        <td className="px-4 py-3 text-[#1C1B1F]">{item.qty} {item.unit}</td>
                        <td className="px-4 py-3 text-xs text-[#79747E] whitespace-nowrap">{item.dateIn}</td>
                        <td className="px-4 py-3 text-xs text-[#79747E] whitespace-nowrap">{item.expiry}</td>
                        <td className={`px-4 py-3 text-xs whitespace-nowrap ${daysColor(days)}`}>
                          {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(item.status)}`}>{item.status}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
              <span className="text-xs text-[#79747E]">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition-all">
                  <ChevronLeft className="w-4 h-4 text-[#1C1B1F]" />
                </button>
                <span className="text-xs font-semibold text-[#1C1B1F] px-2">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition-all">
                  <ChevronRight className="w-4 h-4 text-[#1C1B1F]" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
