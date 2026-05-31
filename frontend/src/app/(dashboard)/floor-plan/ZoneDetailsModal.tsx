'use client';
import { useState, useEffect } from 'react';
import { X, Search, Plus, AlertTriangle, Snowflake, Flame, Lock, Droplet, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { type InteractiveZone, type Material } from '@/lib/zones';

interface Props {
  zone: InteractiveZone | null;
  onSave: (zone: InteractiveZone) => void;
  onClose: () => void;
  onAddMaterial?: (material: Material) => void;
  onRemoveMaterial?: (materialId: string) => void;
  existingMaterials?: Material[];
}

export default function ZoneDetailsModal({ zone, onSave, onClose, onAddMaterial, onRemoveMaterial, existingMaterials = [] }: Props) {
  const [formData, setFormData] = useState({
    id: zone?.id ?? `Z-${Date.now().toString().slice(-4)}`,
    name: zone?.name ?? '',
    hasTempSensor: zone?.hasTempSensor ?? false,
    tempApiUrl: zone?.tempApiUrl ?? '',
    hasHumidSensor: zone?.hasHumidSensor ?? false,
    humidApiUrl: zone?.humidApiUrl ?? '',
    color: zone?.color ?? '',
    iconType: zone?.iconType ?? 'none',
  });

  const [isSearchingMaterial, setIsSearchingMaterial] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState<Material[]>([]);

  useEffect(() => {
    api.get<{ success: boolean; items: Material[] }>('/inventory')
      .then(data => { if (data.success) setInventoryItems(data.items ?? []); })
      .catch(() => {});
  }, []);

  const totalMaxCapacity = existingMaterials.reduce((s, m) => s + (m.maxCapacity ?? 500), 0);
  const totalCurrentStock = existingMaterials.reduce((s, m) => s + (m.qty ?? 0), 0);
  const capacityPct = totalMaxCapacity > 0 ? Math.min(100, Math.round((totalCurrentStock / totalMaxCapacity) * 100)) : 0;

  const searchResults = inventoryItems.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...zone!, ...formData, isSetup: true, position: zone?.position ?? { x: 40, y: 40, width: 20, height: 20 }, materials: zone?.materials ?? [] });
  }

  const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#1C1B1F] text-lg">{zone?.name ? 'Edit Zone' : 'New Zone Details'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-all">
            <X className="w-5 h-5 text-[#79747E]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zone Name */}
          <div>
            <label className="text-xs font-semibold text-[#79747E] block mb-1">Nama Zona *</label>
            <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              required placeholder="e.g. Cold Storage" className={inputCls} />
          </div>

          {/* Custom Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#79747E] block">Warna Area Gudang</label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { hex: '#3b82f6', label: 'Blue (A)' },
                { hex: '#8b5cf6', label: 'Purple (B)' },
                { hex: '#10b981', label: 'Green (C)' },
                { hex: '#06b6d4', label: 'Cyan (D)' },
                { hex: '#ef4444', label: 'Red (E)' },
                { hex: '#f97316', label: 'Orange' },
                { hex: '#78716c', label: 'Grey' },
              ].map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, color: preset.hex }))}
                  className="w-7 h-7 rounded-full border-2 transition-all relative flex items-center justify-center hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: preset.hex,
                    borderColor: formData.color === preset.hex ? '#1C1B1F' : 'transparent',
                    boxShadow: formData.color === preset.hex ? '0 0 0 2px white' : 'none'
                  }}
                  title={preset.label}
                >
                  {formData.color === preset.hex && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              <div className="h-6 w-[1px] bg-stone-200 mx-1" />
              {/* Color Picker Input */}
              <label className="relative flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-600 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-full hover:bg-stone-100 transition-colors">
                <input
                  type="color"
                  value={formData.color || '#10b981'}
                  onChange={e => setFormData(f => ({ ...f, color: e.target.value }))}
                  className="absolute inset-0 opacity-0 w-0 h-0 cursor-pointer"
                />
                <span className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: formData.color || '#10b981' }} />
                Custom Color
              </label>
            </div>
          </div>

          {/* Custom Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#79747E] block">Simbol / Icon Gudang</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { type: 'none', label: 'None', icon: null },
                { type: 'snowflake', label: 'Ice', icon: Snowflake },
                { type: 'flame', label: 'Hot', icon: Flame },
                { type: 'door', label: 'Security', icon: Lock },
                { type: 'wash', label: 'Liquid', icon: Droplet },
                { type: 'machinery', label: 'Machine', icon: ArrowRightLeft },
              ].map(opt => {
                const IconComponent = opt.icon;
                const isSelected = formData.iconType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, iconType: opt.type }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#2C742F]/10 border-[#2C742F] text-[#2C742F]'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temp Sensor */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.hasTempSensor}
                onChange={e => setFormData(f => ({ ...f, hasTempSensor: e.target.checked }))}
                className="rounded border-stone-300 text-[#2C742F] focus:ring-0 w-4 h-4" />
              <span className="text-sm font-semibold text-[#1C1B1F]">Terdapat Sensor Suhu?</span>
            </label>
            <AnimatePresence>
              {formData.hasTempSensor && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input type="url" value={formData.tempApiUrl}
                    onChange={e => setFormData(f => ({ ...f, tempApiUrl: e.target.value }))}
                    placeholder="https://api.sensor.com/temp" className={inputCls} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Humidity Sensor */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.hasHumidSensor}
                onChange={e => setFormData(f => ({ ...f, hasHumidSensor: e.target.checked }))}
                className="rounded border-stone-300 text-[#2C742F] focus:ring-0 w-4 h-4" />
              <span className="text-sm font-semibold text-[#1C1B1F]">Terdapat Sensor Humidity?</span>
            </label>
            <AnimatePresence>
              {formData.hasHumidSensor && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input type="url" value={formData.humidApiUrl}
                    onChange={e => setFormData(f => ({ ...f, humidApiUrl: e.target.value }))}
                    placeholder="https://api.sensor.com/humidity" className={inputCls} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Materials Section */}
          <div className="border-t border-stone-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#1C1B1F]">Materials in Zone</h4>
              <button type="button" onClick={() => setIsSearchingMaterial(!isSearchingMaterial)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Material
              </button>
            </div>

            {/* Capacity Bar */}
            <div className="bg-stone-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#79747E]">Capacity Utilization</span>
                <span className={`font-bold ${capacityPct > 90 ? 'text-[#EA4B48]' : 'text-[#2C742F]'}`}>
                  {capacityPct}% ({totalCurrentStock} / {totalMaxCapacity})
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${capacityPct > 90 ? 'bg-[#EA4B48]' : 'bg-[#2C742F]'}`}
                  style={{ width: `${capacityPct}%` }} />
              </div>
              {capacityPct > 90 && (
                <div className="flex items-center gap-1.5 text-xs text-[#EA4B48] font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Kapasitas hampir penuh
                </div>
              )}
            </div>

            {/* Material Search */}
            <AnimatePresence>
              {isSearchingMaterial && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-stone-50 rounded-xl p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
                    <input type="text" placeholder="Search material..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white" />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {searchResults.slice(0, 6).map(m => (
                      <div key={m.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-100 hover:border-[#2C742F]/20 transition-all">
                        <div>
                          <p className="text-sm font-semibold text-[#1C1B1F]">{m.name}</p>
                          <p className="text-[10px] text-[#79747E]">ID: {m.id} · Max: {m.maxCapacity ?? 500} {m.unit}</p>
                        </div>
                        <button type="button"
                          onClick={() => { onAddMaterial?.(m); setIsSearchingMaterial(false); setSearchQuery(''); }}
                          className="px-2.5 py-1 rounded-full bg-[#2C742F] text-white text-xs font-bold hover:bg-[#366306] transition-all">
                          Add
                        </button>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchQuery && (
                      <p className="text-xs text-[#79747E] text-center py-3">No results found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Material List */}
            <div className="space-y-1.5">
              {existingMaterials.length === 0 ? (
                <p className="text-xs text-[#79747E] italic text-center py-2">No materials assigned to this zone.</p>
              ) : existingMaterials.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-[#1C1B1F]">{m.name}</p>
                    <p className="text-[10px] text-[#79747E]">ID: {m.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#1C1B1F]">{m.qty} / {m.maxCapacity ?? 500} {m.unit}</span>
                    <button type="button" onClick={() => onRemoveMaterial?.(m.id)}
                      className="p-1 rounded-lg hover:bg-red-100 text-[#79747E] hover:text-[#EA4B48] transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={() => onSave({ ...zone!, ...formData, isSetup: false, position: zone?.position ?? { x: 40, y: 40, width: 20, height: 20 }, materials: zone?.materials ?? [] })}
              className="px-4 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#79747E] hover:bg-stone-50 transition-all">
              Edit Layout
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white text-sm font-bold transition-all">
              Save Zone
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
