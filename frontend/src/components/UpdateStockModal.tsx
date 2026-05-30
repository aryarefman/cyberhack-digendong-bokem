'use client';
import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InventoryItem } from '@/types';
import Portal from '@/components/Portal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSave: (item: InventoryItem, formData: { addQty: string; location: string; dateIn: string; expiry: string }) => void;
}

export default function UpdateStockModal({ isOpen, onClose, items, onSave }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    addQty: '',
    location: '',
    dateIn: new Date().toISOString().split('T')[0],
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const results = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white";

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1C1B1F]">Update Stock</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-[#79747E]" /></button>
          </div>

          {!selectedItem ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
                <input type="text" placeholder="Search material by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${inputCls} pl-9`} />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-stone-100">
                {results.slice(0, 5).map(item => (
                  <button key={item.id} onClick={() => { setSelectedItem(item); setFormData(f => ({ ...f, location: item.location })); setSearchQuery(''); }}
                    className="w-full text-left p-3 hover:bg-stone-50 transition-all border-b border-stone-50 last:border-0">
                    <p className="text-sm font-semibold text-[#1C1B1F]">{item.name}</p>
                    <p className="text-xs text-[#79747E]">{item.id} · {item.qty} {item.unit} · {item.location}</p>
                  </button>
                ))}
                {results.length === 0 && <p className="text-sm text-[#79747E] text-center py-4">No results</p>}
              </div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (selectedItem) onSave(selectedItem, formData); }} className="space-y-3">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-sm font-bold text-[#1C1B1F]">{selectedItem.name}</p>
                <p className="text-xs text-[#79747E]">Current stock: {selectedItem.qty} {selectedItem.unit}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#79747E] block mb-1">Add Quantity</label>
                <input type="number" min={1} value={formData.addQty} onChange={e => setFormData(f => ({ ...f, addQty: e.target.value }))} required className={inputCls} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#79747E] block mb-1">Location (Slot)</label>
                <input value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} className={inputCls} placeholder="e.g. A-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#79747E] block mb-1">Date In</label>
                  <input type="date" value={formData.dateIn} onChange={e => setFormData(f => ({ ...f, dateIn: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#79747E] block mb-1">Expiry</label>
                  <input type="date" value={formData.expiry} onChange={e => setFormData(f => ({ ...f, expiry: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50">Back</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306] flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Update Stock
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </Portal>
  );
}
