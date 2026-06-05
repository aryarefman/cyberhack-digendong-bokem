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
    theme: zone?.theme ?? 'green',
  });

  const [isColorManuallyEdited, setIsColorManuallyEdited] = useState(!!zone?.name);
  const [isIconManuallyEdited, setIsIconManuallyEdited] = useState(!!zone?.name);
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
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !existingMaterials.some(em => em.id === m.id)
  );

  function detectContext(name: string): { color: string; theme: string; iconType: string } | null {
    const val = name.toLowerCase();
    if (!val) return null;

    // 1. Cold Storage (Cyan / Snowflake)
    if (val.includes('cold') || val.includes('dingin') || val.includes('freeze') || val.includes('es') || val.includes('cool') || val.includes('chiller') || val.includes('refrigerat') || val.includes('beku')) {
      return { color: '#06b6d4', theme: 'cyan', iconType: 'snowflake' };
    }
    // 2. Hot Storage / Hot Process (Orange / Flame)
    if (val.includes('hot') || val.includes('panas') || val.includes('extraction') || val.includes('oven') || val.includes('heat') || val.includes('warm') || val.includes('bake') || val.includes('ekstraksi') || val.includes('rebus') || val.includes('bakar')) {
      return { color: '#f97316', theme: 'warm', iconType: 'flame' };
    }
    // 3. Security / Restricted / Door (Red / Door/Lock)
    if (val.includes('security') || val.includes('guard') || val.includes('lock') || val.includes('restrict') || val.includes('door') || val.includes('pintu') || val.includes('gerbang') || val.includes('masuk') || val.includes('keluar') || val.includes('gate') || val.includes('entrance') || val.includes('exit') || val.includes('aman') || val.includes('kunci')) {
      return { color: '#ef4444', theme: 'hazard', iconType: 'door' };
    }
    // 4. Wet / Liquid / Wash (Purple / Wash/Droplet)
    if (val.includes('wash') || val.includes('liquid') || val.includes('cair') || val.includes('clean') || val.includes('water') || val.includes('air') || val.includes('wet') || val.includes('cuci') || val.includes('wastafel') || val.includes('sanitasi') || val.includes('cleanup')) {
      return { color: '#8b5cf6', theme: 'purple', iconType: 'wash' };
    }
    // 5. Machinery / Generator / Machine (Blue / Machinery)
    if (val.includes('machine') || val.includes('mesin') || val.includes('generator') || val.includes('power') || val.includes('server') || val.includes('engine') || val.includes('conveyer') || val.includes('tool') || val.includes('alat') || val.includes('equipment') || val.includes('listrik')) {
      return { color: '#3b82f6', theme: 'blue', iconType: 'machinery' };
    }
    // 6. Hazard / Chemical (Red / None)
    if (val.includes('hazard') || val.includes('chemical') || val.includes('toxic') || val.includes('dangerous') || val.includes('poison') || val.includes('flammable') || val.includes('biohazard') || val.includes('racun') || val.includes('bahaya') || val.includes('kimia') || val.includes('nuklir')) {
      return { color: '#ef4444', theme: 'hazard', iconType: 'none' };
    }
    // 7. Loading / Logistics / Dock (Blue / None)
    if (val.includes('loading') || val.includes('receiving') || val.includes('shipping') || val.includes('dock') || val.includes('logistics') || val.includes('transit') || val.includes('delivery') || val.includes('kirim') || val.includes('terima') || val.includes('gudang') || val.includes('bongkar') || val.includes('muat') || val.includes('ekspedisi')) {
      return { color: '#3b82f6', theme: 'blue', iconType: 'none' };
    }

    return { color: '#10b981', theme: 'green', iconType: 'none' };
  }

  const handleNameChange = (newName: string) => {
    if (!newName) {
      setIsColorManuallyEdited(false);
      setIsIconManuallyEdited(false);
      setFormData(f => ({ ...f, name: newName, color: '', theme: 'green', iconType: 'none' }));
      return;
    }

    setFormData(f => {
      const updated = { ...f, name: newName };
      const detected = detectContext(newName);
      if (detected) {
        if (!isColorManuallyEdited) {
          updated.color = detected.color;
          updated.theme = detected.theme;
        }
        if (!isIconManuallyEdited) {
          updated.iconType = detected.iconType;
        }
      }
      return updated;
    });
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...zone!, ...formData, isSetup: true, position: zone?.position ?? { x: 40, y: 40, width: 20, height: 20 }, materials: existingMaterials });
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
        style={{ borderTop: `6px solid ${formData.color || '#10b981'}` }}
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
            <input type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)}
              required placeholder="e.g. Cold Storage" className={inputCls} />
          </div>

          {/* Custom Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#79747E] block">Warna Area Gudang</label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { hex: '#3b82f6', label: 'Blue (A)', theme: 'blue' },
                { hex: '#8b5cf6', label: 'Purple (B)', theme: 'purple' },
                { hex: '#10b981', label: 'Green (C)', theme: 'green' },
                { hex: '#06b6d4', label: 'Cyan (D)', theme: 'cyan' },
                { hex: '#ef4444', label: 'Red (E)', theme: 'hazard' },
                { hex: '#f97316', label: 'Orange', theme: 'warm' },
                { hex: '#78716c', label: 'Grey', theme: 'neutral' },
              ].map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    setFormData(f => ({ ...f, color: preset.hex, theme: preset.theme }));
                    setIsColorManuallyEdited(true);
                  }}
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
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(f => ({ ...f, color: val, theme: 'neutral' }));
                    setIsColorManuallyEdited(true);
                  }}
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
                    onClick={() => {
                      setFormData(f => ({ ...f, iconType: opt.type }));
                      setIsIconManuallyEdited(true);
                    }}
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
                <span className="font-bold" style={{ color: capacityPct > 90 ? '#EA4B48' : (formData.color || '#10b981') }}>
                  {capacityPct}% ({totalCurrentStock} / {totalMaxCapacity})
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${capacityPct}%`, 
                    backgroundColor: capacityPct > 90 ? '#EA4B48' : (formData.color || '#10b981') 
                  }} />
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
                          className="px-2.5 py-1 rounded-full text-white text-xs font-bold transition-all hover:brightness-95"
                          style={{ backgroundColor: formData.color || '#10b981' }}>
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
            <button type="button" onClick={() => onSave({ ...zone!, ...formData, isSetup: false, position: zone?.position ?? { x: 40, y: 40, width: 20, height: 20 }, materials: existingMaterials })}
              className="px-4 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#79747E] hover:bg-stone-50 transition-all">
              Edit Layout
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:brightness-95"
              style={{ backgroundColor: formData.color || '#2C742F' }}>
              Save Zone
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
