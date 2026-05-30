import type { Zone, Slot, InventoryItem, TemperatureReading, AuditLog } from '@/types';

// ---------- Warehouse Zones ----------
export const ZONES: Zone[] = [
  { id: 'A', name: 'Zona A — Bahan Kering', color: '#3b82f6', type: 'dry', tempMin: 20, tempMax: 30 },
  { id: 'B', name: 'Zona B — Bahan Cair', color: '#8b5cf6', type: 'liquid', tempMin: 15, tempMax: 25 },
  { id: 'C', name: 'Zona C — Bahan Umum', color: '#10b981', type: 'general', tempMin: 18, tempMax: 28 },
  { id: 'D', name: 'Zona D — Cold Storage', color: '#06b6d4', type: 'cold', tempMin: -5, tempMax: 5 },
  { id: 'E', name: 'Zona E — Bahan Berbahaya', color: '#ef4444', type: 'hazardous', tempMin: 15, tempMax: 25 },
];

export function getDynamicZones(): Zone[] {
  if (typeof window === 'undefined') return ZONES;
  try {
    const custom = JSON.parse(localStorage.getItem('aromasys_interactive_zones') || '[]');
    const customMapped: Zone[] = custom.map((z: { id: string; name?: string; hasTempSensor?: boolean }) => ({
      id: z.id,
      name: z.name || `Zone ${z.id}`,
      color: '#4ade80',
      type: 'custom',
      tempMin: z.hasTempSensor ? 15 : null,
      tempMax: z.hasTempSensor ? 25 : null,
    }));
    return [...ZONES, ...customMapped];
  } catch {
    return ZONES;
  }
}

// ---------- Warehouse Slots ----------
export const SLOTS: Slot[] = [];
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = 6;
for (const row of ROWS) {
  for (let col = 1; col <= COLS; col++) {
    SLOTS.push({ id: `${row}-${col}`, zone: row, row, col, occupied: false, itemId: null });
  }
}

// ---------- Categories ----------
export const CATEGORIES = [
  'Tepung', 'Gula', 'Minyak', 'Pewarna', 'Essence',
  'Pengawet', 'Susu', 'Cokelat', 'Rempah', 'Kimia',
];

// ---------- Inventory Items ----------
const today = new Date();

function daysFromNow(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export const INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'Tepung Terigu Cakra', category: 'Tepung', qty: 500, unit: 'kg', location: 'A-1', zone: 'A', dateIn: daysAgo(30), expiry: daysFromNow(60), status: 'Aman' },
  { id: 'INV-002', name: 'Gula Pasir Putih', category: 'Gula', qty: 300, unit: 'kg', location: 'A-2', zone: 'A', dateIn: daysAgo(45), expiry: daysFromNow(15), status: 'Warning' },
  { id: 'INV-003', name: 'Minyak Goreng Sawit', category: 'Minyak', qty: 200, unit: 'liter', location: 'B-1', zone: 'B', dateIn: daysAgo(20), expiry: daysFromNow(90), status: 'Aman' },
  { id: 'INV-004', name: 'Pewarna Makanan Merah', category: 'Pewarna', qty: 50, unit: 'liter', location: 'B-2', zone: 'B', dateIn: daysAgo(60), expiry: daysFromNow(5), status: 'Kritis' },
  { id: 'INV-005', name: 'Vanilla Essence', category: 'Essence', qty: 25, unit: 'liter', location: 'C-1', zone: 'C', dateIn: daysAgo(10), expiry: daysFromNow(120), status: 'Aman' },
  { id: 'INV-006', name: 'Sodium Benzoat', category: 'Pengawet', qty: 100, unit: 'kg', location: 'E-1', zone: 'E', dateIn: daysAgo(15), expiry: daysFromNow(180), status: 'Aman' },
  { id: 'INV-007', name: 'Susu Bubuk Full Cream', category: 'Susu', qty: 150, unit: 'kg', location: 'D-1', zone: 'D', dateIn: daysAgo(5), expiry: daysFromNow(45), status: 'Aman' },
  { id: 'INV-008', name: 'Cokelat Bubuk Premium', category: 'Cokelat', qty: 80, unit: 'kg', location: 'D-2', zone: 'D', dateIn: daysAgo(25), expiry: daysFromNow(3), status: 'Kritis' },
  { id: 'INV-009', name: 'Kayu Manis Bubuk', category: 'Rempah', qty: 30, unit: 'kg', location: 'C-2', zone: 'C', dateIn: daysAgo(40), expiry: daysFromNow(25), status: 'Warning' },
  { id: 'INV-010', name: 'Asam Sitrat', category: 'Kimia', qty: 60, unit: 'kg', location: 'E-2', zone: 'E', dateIn: daysAgo(8), expiry: daysFromNow(200), status: 'Aman' },
  { id: 'INV-011', name: 'Tepung Maizena', category: 'Tepung', qty: 200, unit: 'kg', location: 'A-3', zone: 'A', dateIn: daysAgo(12), expiry: daysFromNow(75), status: 'Aman' },
  { id: 'INV-012', name: 'Gula Merah', category: 'Gula', qty: 100, unit: 'kg', location: 'A-4', zone: 'A', dateIn: daysAgo(50), expiry: daysFromNow(-2), status: 'Expired' },
  { id: 'INV-013', name: 'Minyak Kelapa', category: 'Minyak', qty: 120, unit: 'liter', location: 'B-3', zone: 'B', dateIn: daysAgo(35), expiry: daysFromNow(40), status: 'Aman' },
  { id: 'INV-014', name: 'Butter Unsalted', category: 'Susu', qty: 75, unit: 'kg', location: 'D-3', zone: 'D', dateIn: daysAgo(3), expiry: daysFromNow(20), status: 'Warning' },
  { id: 'INV-015', name: 'Pewarna Kuning Sunset', category: 'Pewarna', qty: 40, unit: 'liter', location: 'B-4', zone: 'B', dateIn: daysAgo(70), expiry: daysFromNow(-5), status: 'Expired' },
];

// Assign items to slots
INVENTORY.forEach(item => {
  const slot = SLOTS.find(s => s.id === item.location);
  if (slot) { slot.occupied = true; slot.itemId = item.id; }
});

// ---------- Temperature Readings ----------
function generateTempData(zoneId: string, baseTemp: number, variance: number, points = 24): TemperatureReading[] {
  const data: TemperatureReading[] = [];
  for (let i = 0; i < points; i++) {
    const anomaly = zoneId === 'D' && i >= 18 && i <= 21;
    const temp = anomaly
      ? baseTemp + variance * 3
      : baseTemp + (Math.random() * variance * 2 - variance);
    data.push({
      zone: zoneId,
      hour: `${i.toString().padStart(2, '0')}:00`,
      temperature: parseFloat(temp.toFixed(1)),
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), i).toISOString(),
    });
  }
  return data;
}

export const TEMPERATURE_DATA: Record<string, TemperatureReading[]> = {
  A: generateTempData('A', 25, 2),
  B: generateTempData('B', 20, 2),
  C: generateTempData('C', 23, 2),
  D: generateTempData('D', 0, 2),
  E: generateTempData('E', 20, 2),
};

// ---------- Audit Trail ----------
export const AUDIT_LOGS: AuditLog[] = [
  { id: 1, timestamp: daysAgo(0) + ' 09:15', user: 'Budi Santoso', role: 'Operator', action: 'Tambah Stok', detail: 'Menambahkan Tepung Terigu Cakra 500kg di Slot A-1', module: 'Digital Twin' },
  { id: 2, timestamp: daysAgo(0) + ' 10:30', user: 'Siti Rahayu', role: 'QC', action: 'Edit Data', detail: 'Mengubah jumlah Gula Pasir Putih dari 350kg menjadi 300kg', module: 'Settings' },
  { id: 3, timestamp: daysAgo(1) + ' 08:00', user: 'Ahmad Fauzi', role: 'PPIC', action: 'Generate Report', detail: 'Generate laporan inventori periode Mei 2025', module: 'Copilot' },
  { id: 4, timestamp: daysAgo(1) + ' 14:20', user: 'Diana Putri', role: 'Admin', action: 'Hapus Data', detail: 'Menghapus data Pewarna Biru (expired 3 bulan)', module: 'Settings' },
  { id: 5, timestamp: daysAgo(2) + ' 11:45', user: 'Budi Santoso', role: 'Operator', action: 'Upload Dokumen', detail: 'Upload nota pengiriman #NT-2025-0234', module: 'Copilot' },
];

// ---------- Chat Presets ----------
export const CHAT_PRESETS = [
  'Bahan apa yang expired minggu ini?',
  'Slot mana yang masih kosong di Zona B?',
  'Berapa stok tepung terigu sekarang?',
  'Zona mana yang suhunya paling tinggi hari ini?',
  'Berapa total bahan yang perlu segera digunakan?',
];

export function generateAIResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('expired') || q.includes('kadaluarsa')) {
    const expiring = INVENTORY.filter(i => i.status === 'Expired' || i.status === 'Kritis');
    if (expiring.length === 0) return 'Tidak ada bahan yang expired atau mendekati expired minggu ini.';
    let res = `Ditemukan **${expiring.length} bahan** yang expired atau mendekati expired:\n\n`;
    expiring.forEach(item => {
      res += `${item.status === 'Expired' ? '[Expired]' : '[Kritis]'} **${item.name}** — Lokasi: ${item.location}, Expired: ${item.expiry}\n`;
    });
    return res;
  }

  if (q.includes('kosong') || q.includes('empty')) {
    const zoneMatch = q.match(/zona\s+([a-e])/i);
    const targetZone = zoneMatch ? zoneMatch[1].toUpperCase() : null;
    const empty = SLOTS.filter(s => !s.occupied && (!targetZone || s.zone === targetZone));
    if (empty.length === 0) return targetZone ? `Semua slot di Zona ${targetZone} sudah terisi.` : 'Semua slot sudah terisi.';
    let res = `Ditemukan **${empty.length} slot kosong**${targetZone ? ` di Zona ${targetZone}` : ''}:\n\n`;
    empty.forEach(s => { res += `- Slot **${s.id}**\n`; });
    return res;
  }

  if (q.includes('stok') || q.includes('stock') || q.includes('berapa')) {
    const item = INVENTORY.find(i => q.includes(i.name.toLowerCase().split(' ').slice(0, 2).join(' ')));
    if (item) return `**${item.name}**\n- Stok: **${item.qty} ${item.unit}**\n- Lokasi: ${item.location}\n- Expired: ${item.expiry}`;
    return `Total bahan di gudang: **${INVENTORY.length} item**\nAktif: **${INVENTORY.filter(i => i.status !== 'Expired').length} item**`;
  }

  if (q.includes('suhu') || q.includes('temperatur')) {
    const hotZone = Object.entries(TEMPERATURE_DATA).sort((a, b) => {
      return Math.max(...b[1].map(d => d.temperature)) - Math.max(...a[1].map(d => d.temperature));
    })[0];
    const maxTemp = Math.max(...hotZone[1].map(d => d.temperature));
    return `Zona suhu tertinggi: **Zona ${hotZone[0]}** (${maxTemp.toFixed(1)}°C)`;
  }

  return `Ringkasan gudang:\n- Total: **${INVENTORY.length}**\n- Expired: **${INVENTORY.filter(i => i.status === 'Expired').length}**\n- Warning/Kritis: **${INVENTORY.filter(i => i.status === 'Warning' || i.status === 'Kritis').length}**\n- Aman: **${INVENTORY.filter(i => i.status === 'Aman').length}**`;
}

export function getDashboardStats() {
  const totalSlots = SLOTS.length;
  const occupiedSlots = SLOTS.filter(s => s.occupied).length;
  const expired = INVENTORY.filter(i => i.status === 'Expired').length;
  const critical = INVENTORY.filter(i => i.status === 'Kritis').length;
  const warning = INVENTORY.filter(i => i.status === 'Warning').length;
  const safe = INVENTORY.filter(i => i.status === 'Aman').length;

  const coldChainAlerts: Array<{ zone: string; zoneName: string; count: number; maxTemp: number; threshold: number }> = [];
  Object.entries(TEMPERATURE_DATA).forEach(([zoneId, readings]) => {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone || zone.tempMax === null) return;
    const anomalies = readings.filter(r => r.temperature > zone.tempMax! || r.temperature < (zone.tempMin ?? -Infinity));
    if (anomalies.length > 0) {
      coldChainAlerts.push({ zone: zoneId, zoneName: zone.name, count: anomalies.length, maxTemp: Math.max(...anomalies.map(a => a.temperature)), threshold: zone.tempMax! });
    }
  });

  return { capacity: Math.round((occupiedSlots / totalSlots) * 100), totalSlots, occupiedSlots, emptySlots: totalSlots - occupiedSlots, expired, critical, warning, safe, totalItems: INVENTORY.length, coldChainAlerts };
}
