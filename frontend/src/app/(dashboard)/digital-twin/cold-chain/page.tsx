'use client';
import { useState, useEffect } from 'react';
import { getDynamicZones } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, AlertTriangle, AlertCircle, CheckCircle2, X, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import type { Zone, TemperatureReading } from '@/types';

interface ZoneCardData {
  zone: Zone;
  readings: TemperatureReading[];
  maxTemp: number;
  minTemp: number;
  avgTemp: string;
  anomalies: TemperatureReading[];
  status: 'safe' | 'warning' | 'danger';
}

function SparklineBar({ readings, tempMin, tempMax }: { readings: TemperatureReading[]; tempMin: number; tempMax: number }) {
  const sample = readings.filter((_, i) => i % 3 === 0).slice(0, 8);
  if (!sample.length) return null;
  const allTemps = sample.map(r => r.temperature);
  const min = Math.min(...allTemps);
  const max = Math.max(...allTemps);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1 h-16">
      {sample.map((r, i) => {
        const heightPct = Math.max(10, ((r.temperature - min) / range) * 100);
        const isAnom = r.temperature > tempMax || r.temperature < tempMin;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div
              className={`w-full rounded-t-sm transition-all ${isAnom ? 'bg-[#EA4B48]' : 'bg-[#2C742F]/50'}`}
              style={{ height: `${heightPct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function ColdChainPage() {
  const [dynamicZones, setDynamicZones] = useState<Zone[]>([]);
  const [temperatures, setTemperatures] = useState<Record<string, TemperatureReading[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketZoneId, setTicketZoneId] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('high');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setDynamicZones(getDynamicZones()); }, []);

  async function fetchTemperatures() {
    try {
      setIsLoading(true); setError(null);
      const data = await api.get<{ success: boolean; temperatures: Record<string, TemperatureReading[]> }>('/cold-chain');
      if (data.success) setTemperatures(data.temperatures);
      else setError('Gagal memuat data sensor.');
    } catch { setError('Tidak dapat terhubung ke server sensor.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { Promise.resolve().then(fetchTemperatures); }, []);

  function buildZoneCard(zone: Zone): ZoneCardData {
    const readings = temperatures[zone.id] ?? [];
    const maxTemp = readings.length ? Math.max(...readings.map(r => r.temperature)) : 0;
    const minTemp = readings.length ? Math.min(...readings.map(r => r.temperature)) : 0;
    const avgTemp = readings.length ? (readings.reduce((s, r) => s + r.temperature, 0) / readings.length).toFixed(1) : '0.0';
    const anomalies = readings.filter(r => r.temperature > (zone.tempMax ?? 30) || r.temperature < (zone.tempMin ?? -10));
    const status: 'safe' | 'warning' | 'danger' = anomalies.length > 0 ? 'danger' : maxTemp > (zone.tempMax ?? 30) - 2 ? 'warning' : 'safe';
    return { zone, readings, maxTemp, minTemp, avgTemp, anomalies, status };
  }

  const statusConfig = {
    safe: { badge: 'bg-emerald-100/60 text-emerald-800 border-emerald-200/40', dot: 'bg-emerald-500', label: 'Normal', tempColor: 'text-blue-500', icon: CheckCircle2 },
    warning: { badge: 'bg-amber-100/60 text-amber-800 border-amber-200/40', dot: 'bg-amber-500', label: 'Warning', tempColor: 'text-amber-500', icon: AlertCircle },
    danger: { badge: 'bg-rose-200 text-red-800 border-red-200/40', dot: 'bg-[#EA4B48]', label: 'Anomaly', tempColor: 'text-red-800', icon: AlertTriangle },
  };

  const selectedCard = selectedZoneId ? buildZoneCard(dynamicZones.find(z => z.id === selectedZoneId) ?? dynamicZones[0]) : null;

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/maintenance', { zone: ticketZoneId, issue: ticketDesc || `Temperature anomaly in Zone ${ticketZoneId}`, priority: ticketPriority });
      setTicketSuccess(true);
      setTimeout(() => { setShowTicketModal(false); setTicketDesc(''); setTicketSuccess(false); }, 2000);
    } catch {}
    finally { setSubmitting(false); }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p className="text-sm text-[#79747E]">Memuat data sensor...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <AlertTriangle className="w-10 h-10 text-[#EA4B48]" />
      <p className="text-sm font-semibold text-[#1C1B1F]">{error}</p>
      <button onClick={fetchTemperatures} className="px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-semibold">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Cold-Chain Monitor</h1>
        <button onClick={() => { setTicketZoneId(dynamicZones[0]?.id ?? ''); setShowTicketModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EA4B48] text-white text-sm font-bold hover:bg-red-600 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Maintenance Ticket
        </button>
      </div>

      {/* Zone Cards — 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dynamicZones.map(zone => {
          const card = buildZoneCard(zone);
          const cfg = statusConfig[card.status];
          const StatusIcon = cfg.icon;
          const isSelected = selectedZoneId === zone.id;

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dynamicZones.indexOf(zone) * 0.07 }}
              onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
              className={`bg-[#F5FBF3] rounded-3xl border cursor-pointer transition-all h-[360px] flex flex-col p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] ${isSelected ? 'border-[#2C742F] ring-2 ring-[#2C742F]/20' : 'border-[#2C742F]/10 hover:border-[#2C742F]/30'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-[#79747E] uppercase tracking-wider">Zone {zone.id}</p>
                  <h3 className="font-bold text-[#1C1B1F] mt-0.5 text-sm leading-snug">{zone.name}</h3>
                  <p className="text-[10px] text-[#79747E] mt-0.5">{zone.tempMin}°C – {zone.tempMax}°C threshold</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {card.anomalies.length > 0 ? `${card.anomalies.length} Anomal${card.anomalies.length > 1 ? 'ies' : 'y'}` : cfg.label}
                </span>
              </div>

              {/* Temperature */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className={`text-5xl font-extrabold ${cfg.tempColor} leading-none`}>
                  {card.maxTemp.toFixed(1)}°
                </p>
                <p className="text-xs text-[#79747E] mt-2 font-semibold">Current Max Temperature</p>
                <div className="flex gap-4 mt-3 text-center">
                  {[{ label: 'Min', val: card.minTemp.toFixed(1) }, { label: 'Avg', val: card.avgTemp }].map(s => (
                    <div key={s.label}>
                      <p className="text-xs text-[#79747E]">{s.label}</p>
                      <p className="text-sm font-bold text-[#1C1B1F]">{s.val}°C</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sparkline */}
              <div className="mt-4">
                <p className="text-[10px] text-[#79747E] mb-1.5 font-semibold">24-Hour Trend</p>
                <SparklineBar readings={card.readings} tempMin={zone.tempMin ?? -Infinity} tempMax={zone.tempMax ?? Infinity} />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={e => { e.stopPropagation(); setTicketZoneId(zone.id); setShowTicketModal(true); }}
                  className="flex-1 py-2 rounded-full border border-[#EA4B48]/30 text-[#EA4B48] text-xs font-bold hover:bg-[#EA4B48]/10 transition-all"
                >
                  Create Ticket
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedZoneId(isSelected ? null : zone.id); }}
                  className="flex-1 py-2 rounded-full bg-[#2C742F]/10 text-[#2C742F] text-xs font-bold hover:bg-[#2C742F]/20 transition-all"
                >
                  {isSelected ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zone Detail Panel */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="bg-[#F5FBF3] rounded-2xl border border-[#2C742F]/10 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1C1B1F]">{selectedCard.zone.name} — Readings Detail</h3>
              <button onClick={() => setSelectedZoneId(null)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-4 h-4 text-[#79747E]" />
              </button>
            </div>
            {selectedCard.anomalies.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#EA4B48] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {selectedCard.anomalies.length} anomaly readings detected
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-stone-200">
                      <th className="text-left pb-2 text-xs font-bold text-[#79747E]">Time</th>
                      <th className="text-left pb-2 text-xs font-bold text-[#79747E]">Temperature</th>
                      <th className="text-left pb-2 text-xs font-bold text-[#79747E]">Threshold</th>
                    </tr></thead>
                    <tbody>{selectedCard.anomalies.slice(0, 8).map((r, i) => (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        <td className="py-2 font-mono text-xs text-[#1C1B1F]">{r.hour}</td>
                        <td className="py-2 font-bold text-[#EA4B48]">{r.temperature.toFixed(1)}°C</td>
                        <td className="py-2 text-xs text-[#79747E]">{selectedCard.zone.tempMin}°C – {selectedCard.zone.tempMax}°C</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> All readings within normal threshold
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTicketModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1C1B1F]">Create Maintenance Ticket</h3>
                <button onClick={() => setShowTicketModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-[#79747E]" /></button>
              </div>
              {ticketSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <p className="text-sm font-semibold text-[#1C1B1F]">Ticket created!</p>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Zone</label>
                    <select value={ticketZoneId} onChange={e => setTicketZoneId(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
                      {dynamicZones.map(z => <option key={z.id} value={z.id}>Zone {z.id} — {z.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Description *</label>
                    <textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} rows={3} required
                      placeholder="Describe the issue..."
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#79747E] block mb-1">Priority</label>
                    <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 rounded-full bg-[#EA4B48] hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Creating...</> : 'Create Ticket'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
