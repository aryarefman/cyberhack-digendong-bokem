'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getDynamicZones, CATEGORIES } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  X, Check, AlertTriangle, AlertCircle, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { InventoryItem, Zone, InventoryStatus } from '@/types';

const PAGE_SIZE = 10;
const UNITS = ['kg', 'liter', 'pcs', 'box', 'karung', 'drum'];

interface FormData {
  id: string; name: string; category: string; qty: string | number;
  unit: string; location: string; dateIn: string; expiry: string;
}

function calcStatus(expiry: string): InventoryStatus {
  if (!expiry) return 'Aman';
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days <= 7) return 'Kritis';
  if (days <= 30) return 'Warning';
  return 'Aman';
}

const statusBadge: Record<string, string> = {
  Aman: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Warning: 'bg-amber-100 text-amber-700 border-amber-200',
  Kritis: 'bg-orange-100 text-orange-700 border-orange-200',
  Expired: 'bg-red-100 text-[#EA4B48] border-red-200',
};

export default function InventoryPage() {
  const { user, canEdit, canDelete } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dynamicZones, setDynamicZones] = useState<Zone[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: '', name: '', category: CATEGORIES[0], qty: '', unit: 'kg', location: '', dateIn: '', expiry: '',
  });

  useEffect(() => { setDynamicZones(getDynamicZones()); }, []);

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (zoneFilter) params.append('zone', zoneFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      const data = await api.get<{ success: boolean; items: InventoryItem[] }>(`/inventory?${params}`);
      if (data.success) setItems(data.items ?? []);
      else setError('Failed to load inventory.');
    } catch { setError('Failed to connect to database.'); }
    finally { setIsLoading(false); }
  }, [search, zoneFilter, categoryFilter, statusFilter]);

  useEffect(() => { Promise.resolve().then(fetchInventory); }, [fetchInventory]);

  useEffect(() => {
    if (!isModalOpen) return;
    api.get<{ success: boolean; slots: Array<{ id: string; occupied: boolean; itemId: string | null }> }>('/slots').then(data => {
      if (data.success) {
        setAvailableSlots((data.slots ?? []).filter(s => !s.occupied || (modalMode === 'edit' && s.itemId === formData.id)).map(s => s.id).sort());
      }
    }).catch(() => {});
  }, [isModalOpen, modalMode, formData.id]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [items, page]);

  function openAdd() {
    const maxNum = items.reduce((max, i) => Math.max(max, parseInt(i.id.replace('INV-', '')) || 0), 0);
    setModalMode('add');
    setFormData({ id: `INV-${String(maxNum + 1).padStart(3, '0')}`, name: '', category: CATEGORIES[0], qty: '', unit: 'kg', location: '', dateIn: new Date().toISOString().split('T')[0], expiry: '' });
    setIsModalOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setModalMode('edit');
    setFormData({ id: item.id, name: item.name, category: item.category, qty: item.qty, unit: item.unit, location: item.location, dateIn: item.dateIn, expiry: item.expiry });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const zone = formData.location?.split('-')[0] ?? '';
    const payload = { ...formData, qty: Number(formData.qty), zone };
    try {
      if (modalMode === 'add') await api.post('/inventory', payload);
      else await api.put('/inventory', payload);
      setToast({ msg: modalMode === 'add' ? 'Item added successfully!' : 'Item updated!', type: 'success' });
      setIsModalOpen(false);
      await fetchInventory();
    } catch { setToast({ msg: 'Failed to save item.', type: 'error' }); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/inventory?id=${id}`);
      setToast({ msg: 'Item deleted.', type: 'success' });
      setDeleteConfirm(null);
      await fetchInventory();
    } catch { setToast({ msg: 'Failed to delete item.', type: 'error' }); }
  }

  const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white";

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C742F]/10 flex items-center justify-center"><Database className="w-5 h-5 text-[#2C742F]" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Inventory Master</h1>
            <p className="text-xs text-[#79747E]">{items.length} items</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all"><RefreshCw className="w-4 h-4 text-[#79747E]" /></button>
          {canEdit() && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306] transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#F5FBF3] rounded-2xl p-4 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
          <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30" />
        </div>
        {[
          { value: zoneFilter, setter: (v: string) => { setZoneFilter(v); setPage(1); }, label: 'All Zones', options: dynamicZones.map(z => ({ value: z.id, label: `Zone ${z.id}` })) },
          { value: categoryFilter, setter: (v: string) => { setCategoryFilter(v); setPage(1); }, label: 'All Categories', options: CATEGORIES.map(c => ({ value: c, label: c })) },
          { value: statusFilter, setter: (v: string) => { setStatusFilter(v); setPage(1); }, label: 'All Status', options: ['Aman', 'Warning', 'Kritis', 'Expired'].map(s => ({ value: s, label: s })) },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.setter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
            <option value="">{f.label}</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>{['ID', 'Item', 'Category', 'Qty', 'Zone', 'Location', 'Expiry', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#79747E] whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-sm text-[#79747E]">No items found</td></tr>
                ) : paginated.map(item => (
                  <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[#79747E]">{item.id}</td>
                    <td className="px-4 py-3 font-semibold text-[#1C1B1F] whitespace-nowrap max-w-[160px] truncate">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-[#79747E]">{item.category}</td>
                    <td className="px-4 py-3 text-[#1C1B1F]">{item.qty} {item.unit}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-stone-100 text-xs font-semibold text-[#1C1B1F]">Zone {item.zone}</span></td>
                    <td className="px-4 py-3 text-xs text-[#79747E]">{item.location}</td>
                    <td className="px-4 py-3 text-xs text-[#79747E] whitespace-nowrap">{item.expiry}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge[item.status] ?? ''}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-1.5">
                      {canEdit() && (
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      )}
                      {canDelete() && (
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg bg-red-100 text-[#EA4B48] hover:bg-red-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
              <span className="text-xs text-[#79747E]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} of {items.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50"><ChevronLeft className="w-4 h-4 text-[#1C1B1F]" /></button>
                <span className="text-xs font-semibold text-[#1C1B1F] px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50"><ChevronRight className="w-4 h-4 text-[#1C1B1F]" /></button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1C1B1F]">{modalMode === 'add' ? 'Add New Item' : 'Edit Item'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-[#79747E]" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Item Name *</label>
                    <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="e.g. Tepung Terigu" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Category *</label>
                    <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Quantity *</label>
                    <input type="number" min={1} value={formData.qty} onChange={e => setFormData(f => ({ ...f, qty: e.target.value }))} required className={inputCls} placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Unit</label>
                    <select value={formData.unit} onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))} className={inputCls}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Location (Slot) *</label>
                    <select value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} required className={inputCls}>
                      <option value="">Select slot...</option>
                      {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Date In</label>
                    <input type="date" value={formData.dateIn} onChange={e => setFormData(f => ({ ...f, dateIn: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Expiry Date *</label>
                    <input type="date" value={formData.expiry} onChange={e => setFormData(f => ({ ...f, expiry: e.target.value }))} required className={inputCls} />
                    {formData.expiry && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: calcStatus(formData.expiry) === 'Aman' ? '#16a34a' : calcStatus(formData.expiry) === 'Expired' ? '#EA4B48' : '#d97706' }}>
                        Status: {calcStatus(formData.expiry)}
                      </p>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={isSaving}
                  className="w-full py-2.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Saving...</> : <><Check className="w-4 h-4" />{modalMode === 'add' ? 'Add Item' : 'Save Changes'}</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-[#EA4B48]" /></div>
              <h3 className="font-bold text-[#1C1B1F]">Delete Item?</h3>
              <p className="text-sm text-[#79747E]">This action cannot be undone. The item will be permanently removed from inventory.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-full bg-[#EA4B48] text-white text-sm font-bold hover:bg-red-600 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-[#2C742F]' : 'bg-[#EA4B48]'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
