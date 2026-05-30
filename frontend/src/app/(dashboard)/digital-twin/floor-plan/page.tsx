'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { ZONES, CATEGORIES } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Snowflake,
  Flame, AlertTriangle, Upload, ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import ZoneDetailsModal from './ZoneDetailsModal';

interface InteractiveZone {
  id: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
  hasTempSensor: boolean;
  hasHumidSensor: boolean;
  materials: string[];
}

interface Slot {
  id: string;
  zone: string;
  row: string;
  col: number;
  occupied: boolean;
  itemId: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  location: string;
}

const ROOMS = [
  { id: 'A-1', name: 'LOADING DOCK', zone: 'A', theme: 'green', gridColumn: '1 / 13', gridRow: '1' },
  { id: 'A-2', name: 'Equipment Set Up', zone: 'A', theme: 'neutral', gridColumn: '1 / 4', gridRow: '2 / 5' },
  { id: 'B-1', name: 'Tray Setting 1', zone: 'B', theme: 'neutral', gridColumn: '4 / 7', gridRow: '2' },
  { id: 'B-2', name: 'Tray Setting 2', zone: 'B', theme: 'neutral', gridColumn: '7 / 10', gridRow: '2' },
  { id: 'D-1', name: 'Cold Storage', zone: 'D', theme: 'blue', gridColumn: '10 / 13', gridRow: '2 / 5', icon: 'snowflake' },
  { id: 'C-1', name: 'Hot Extraction', zone: 'C', theme: 'warm', gridColumn: '4 / 10', gridRow: '3 / 5', icon: 'flame' },
  { id: 'C-3', name: 'Non-Production Machinery', zone: 'C', theme: 'neutral', gridColumn: '1 / 4', gridRow: '5' },
  { id: 'C-4', name: 'Locker Room', zone: 'C', theme: 'neutral', gridColumn: '4 / 8', gridRow: '5' },
  { id: 'C-5', name: 'QC & Lab', zone: 'C', theme: 'green', gridColumn: '8 / 10', gridRow: '5' },
  { id: 'C-2', name: 'Pot Washing', zone: 'C', theme: 'neutral', gridColumn: '10 / 13', gridRow: '5 / 7' },
  { id: 'A-3', name: 'Receiving', zone: 'A', theme: 'green', gridColumn: '1 / 4', gridRow: '6' },
  { id: 'E-1', name: 'Hazard Storage', zone: 'E', theme: 'hazard', gridColumn: '4 / 10', gridRow: '6', icon: 'warning', isHazard: true },
];

const THEME_STYLES: Record<string, string> = {
  green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  neutral: 'bg-stone-50 border-stone-200 text-stone-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  warm: 'bg-orange-50 border-orange-200 text-orange-800',
  hazard: 'bg-red-50 border-red-200 text-red-800',
};

const THEME_HEADER: Record<string, string> = {
  green: 'bg-emerald-100',
  neutral: 'bg-stone-100',
  blue: 'bg-blue-100',
  warm: 'bg-orange-100',
  hazard: 'bg-red-100',
};

export default function FloorPlanPage() {
  const { user, canEdit, canDelete } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [interactiveZones, setInteractiveZones] = useState<InteractiveZone[]>([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<InteractiveZone | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSlotId, setAssignSlotId] = useState<string | null>(null);
  const [assignItemId, setAssignItemId] = useState('');
  const [customFloorPlan, setCustomFloorPlan] = useState<string | null>(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aromasys_interactive_zones');
    if (saved) try { setInteractiveZones(JSON.parse(saved)); } catch {}
    const savedPlan = localStorage.getItem('aromasys_floor_plan_image');
    if (savedPlan) setCustomFloorPlan(savedPlan);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [slotsData, invData] = await Promise.all([
          api.get<{ success: boolean; slots: Slot[] }>('/slots'),
          api.get<{ success: boolean; items: InventoryItem[] }>('/inventory'),
        ]);
        if (slotsData.success) setSlots(slotsData.slots ?? []);
        if (invData.success) setInventoryItems(invData.items ?? []);
      } catch {}
      finally { setIsLoading(false); }
    }
    Promise.resolve().then(load);
  }, []);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  function addCustomZone() {
    if (interactiveZones.length >= 30) { setToast('Max 30 zones reached.'); return; }
    const newZone: InteractiveZone = {
      id: `Z-${Date.now().toString().slice(-4)}`,
      name: `Custom Zone ${interactiveZones.length + 1}`,
      position: { x: 10, y: 10, width: 20, height: 15 },
      hasTempSensor: false, hasHumidSensor: false, materials: [],
    };
    const updated = [...interactiveZones, newZone];
    setInteractiveZones(updated);
    localStorage.setItem('aromasys_interactive_zones', JSON.stringify(updated));
    setToast('Zone added!');
  }

  function deleteZone(id: string) {
    const updated = interactiveZones.filter(z => z.id !== id);
    setInteractiveZones(updated);
    localStorage.setItem('aromasys_interactive_zones', JSON.stringify(updated));
    setToast('Zone deleted.');
  }

  function saveZone(zone: InteractiveZone) {
    const updated = interactiveZones.map(z => z.id === zone.id ? zone : z);
    setInteractiveZones(updated);
    localStorage.setItem('aromasys_interactive_zones', JSON.stringify(updated));
    setShowZoneModal(false);
    setToast('Zone saved!');
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignSlotId || !assignItemId) return;
    try {
      await api.put('/slots', { slotId: assignSlotId, itemId: assignItemId });
      const [slotsData] = await Promise.all([api.get<{ success: boolean; slots: Slot[] }>('/slots')]);
      if (slotsData.success) setSlots(slotsData.slots ?? []);
      setShowAssignModal(false); setAssignItemId('');
      setToast('Item assigned to slot!');
    } catch { setToast('Failed to assign item.'); }
  }

  function handleFloorPlanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setToast('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setCustomFloorPlan(b64);
      localStorage.setItem('aromasys_floor_plan_image', b64);
      setShowUploadPanel(false);
      setToast('Floor plan uploaded!');
    };
    reader.readAsDataURL(file);
  }

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId);
  const roomSlots = selectedRoomId ? slots.filter(s => s.id.startsWith(selectedRoomId.split('-')[0] + '-')) : [];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Interactive Floor Plan</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadPanel(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all shadow-sm">
            <Upload className="w-4 h-4" /> Upload Plan
          </button>
          {canEdit() && (
            <button onClick={addCustomZone}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306] transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Zone
            </button>
          )}
        </div>
      </div>

      {customFloorPlan ? (
        /* Custom floor plan view */
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-semibold text-[#1C1B1F]">Custom Floor Plan</p>
            <button onClick={() => { setCustomFloorPlan(null); localStorage.removeItem('aromasys_floor_plan_image'); }}
              className="text-xs font-bold text-[#EA4B48] hover:text-red-700">Remove</button>
          </div>
          <img src={customFloorPlan} alt="Floor Plan" className="w-full object-contain max-h-[500px]" />
        </div>
      ) : (
        /* Default grid layout */
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px] gap-3 flex-col">
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <p className="text-sm text-[#79747E]">Loading floor plan...</p>
            </div>
          ) : (
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(6, 60px)' }}>
              {ROOMS.map(room => {
                const zoneSlots = slots.filter(s => s.id.startsWith(room.zone + '-'));
                const occupiedCount = zoneSlots.filter(s => s.occupied).length;
                const themeStyle = THEME_STYLES[room.theme] ?? THEME_STYLES.neutral;
                const headerStyle = THEME_HEADER[room.theme] ?? THEME_HEADER.neutral;
                const Icon = room.icon === 'snowflake' ? Snowflake : room.icon === 'flame' ? Flame : room.icon === 'warning' ? AlertTriangle : null;

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id === selectedRoomId ? null : room.id)}
                    style={{ gridColumn: room.gridColumn, gridRow: room.gridRow }}
                    className={`border rounded-xl p-1.5 flex flex-col justify-between transition-all text-left ${themeStyle} ${selectedRoomId === room.id ? 'ring-2 ring-[#2C742F] ring-offset-1' : 'hover:ring-1 hover:ring-[#2C742F]/40'}`}
                  >
                    <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${headerStyle} w-fit`}>{room.zone}</div>
                    <div className="flex items-end justify-between px-0.5">
                      <span className="text-[9px] font-semibold leading-tight line-clamp-2">{room.name}</span>
                      {Icon && <Icon className="w-3 h-3 opacity-60 shrink-0" />}
                    </div>
                    {occupiedCount > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(occupiedCount, 4) }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        ))}
                        {occupiedCount > 4 && <span className="text-[8px] opacity-60">+{occupiedCount - 4}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Zone Legend */}
      <div className="flex flex-wrap gap-2">
        {ZONES.map(z => (
          <div key={z.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-100 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
            <span className="text-xs font-semibold text-[#1C1B1F]">Zone {z.id}</span>
            <span className="text-xs text-[#79747E]">{z.tempMin}–{z.tempMax}°C</span>
          </div>
        ))}
      </div>

      {/* Custom Zones */}
      {interactiveZones.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-sm text-[#1C1B1F]">Custom Zones ({interactiveZones.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {interactiveZones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50">
                <div>
                  <p className="text-sm font-semibold text-[#1C1B1F]">{zone.name}</p>
                  <p className="text-xs text-[#79747E]">{zone.materials?.length ?? 0} materials</p>
                </div>
                <div className="flex gap-1">
                  {canEdit() && (
                    <button onClick={() => { setEditingZone(zone); setShowZoneModal(true); }}
                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"><Pencil className="w-3.5 h-3.5" /></button>
                  )}
                  {canDelete() && (
                    <button onClick={() => deleteZone(zone.id)}
                      className="p-1.5 rounded-lg bg-red-100 text-[#EA4B48] hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slot Details Panel */}
      <AnimatePresence>
        {selectedRoomId && selectedRoom && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1C1B1F]">{selectedRoom.name} — Zone {selectedRoom.zone}</h3>
              <button onClick={() => setSelectedRoomId(null)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-4 h-4 text-[#79747E]" /></button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.filter(s => s.zone === selectedRoom.zone).map(slot => {
                const item = inventoryItems.find(i => i.id === slot.itemId);
                return (
                  <button key={slot.id} onClick={() => { if (canEdit()) { setAssignSlotId(slot.id); setShowAssignModal(true); } }}
                    className={`p-2 rounded-xl border text-center transition-all ${slot.occupied ? 'bg-[#2C742F]/10 border-[#2C742F]/20 text-[#2C742F]' : 'bg-stone-50 border-stone-200 text-[#79747E] hover:bg-[#D7E5D8]/30'}`}>
                    <p className="text-xs font-bold">{slot.id}</p>
                    {slot.occupied && item && <p className="text-[9px] font-medium mt-0.5 truncate">{item.name.split(' ').slice(0, 2).join(' ')}</p>}
                    {!slot.occupied && <p className="text-[9px] text-[#79747E]/60 mt-0.5">Empty</p>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Item Modal */}
      <AnimatePresence>
        {showAssignModal && assignSlotId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1C1B1F]">Assign Item to {assignSlotId}</h3>
                <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-[#79747E]" /></button>
              </div>
              <form onSubmit={handleAssign} className="space-y-3">
                <select value={assignItemId} onChange={e => setAssignItemId(e.target.value)} required
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
                  <option value="">Select inventory item...</option>
                  {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306]">Assign</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zone Details Modal */}
      <AnimatePresence>
        {showZoneModal && editingZone && (
          <ZoneDetailsModal
            zone={editingZone}
            onClose={() => setShowZoneModal(false)}
            onSave={saved => {
              saveZone({ ...editingZone, name: saved.name, hasTempSensor: saved.hasTempSensor ?? false, hasHumidSensor: saved.hasHumidSensor ?? false });
            }}
            existingMaterials={[]}
          />
        )}
      </AnimatePresence>

      {/* Upload Panel */}
      <AnimatePresence>
        {showUploadPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUploadPanel(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1C1B1F]">Upload Floor Plan</h3>
                <button onClick={() => setShowUploadPanel(false)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-[#79747E]" /></button>
              </div>
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { const input = document.createElement('input'); input.files = e.dataTransfer.files; } }}
                className={`flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragOver ? 'border-[#2C742F] bg-[#D7E5D8]/40' : 'border-stone-200 hover:border-[#2C742F]/50'}`}
              >
                <ImageIcon className="w-10 h-10 text-[#79747E]" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#1C1B1F]">Drop image here or click to browse</p>
                  <p className="text-xs text-[#79747E] mt-1">JPG, PNG supported</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFloorPlanUpload} />
              </label>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#2C742F] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
