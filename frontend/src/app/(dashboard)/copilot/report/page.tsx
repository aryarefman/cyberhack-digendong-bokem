'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Thermometer, Activity, FileBarChart, Download, CalendarClock, TrendingUp, AlertTriangle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { InventoryItem, AuditLog, TemperatureReading } from '@/types';

const REPORT_TYPES = [
  { id: 'inventory', label: 'Daily Inventory Status', icon: Package, description: 'Current stocks, low-level alerts, and pending arrivals.' },
  { id: 'expiry', label: 'FIFO & Expiry Tracker', icon: CalendarClock, description: 'Materials nearing expiration and FIFO queue status.' },
  { id: 'temperature', label: 'Cold-Chain Temperature', icon: Thermometer, description: 'Sensor logs and temperature drift across zones.' },
  { id: 'activity', label: 'Warehouse Audit Activity', icon: Activity, description: 'Administrative logs, commits, and user records.' },
];

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`;

export default function ReportPage() {
  const [reportType, setReportType] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-31');
  const [format, setFormat] = useState('pdf');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [dateError, setDateError] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [temperatures, setTemperatures] = useState<Record<string, TemperatureReading[]>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [invData, auditData, tempData] = await Promise.all([
          api.get<{ success: boolean; items: InventoryItem[] }>('/inventory'),
          api.get<{ success: boolean; logs: AuditLog[] }>('/audit'),
          api.get<{ success: boolean; temperatures: Record<string, TemperatureReading[]> }>('/cold-chain'),
        ]);
        if (invData.success) setInventory(invData.items ?? []);
        if (auditData.success) setActivities(auditData.logs ?? []);
        if (tempData.success) setTemperatures(tempData.temperatures ?? {});
      } catch { /* use empty fallback */ }
      finally { setDataLoading(false); }
    }
    Promise.resolve().then(loadData);
  }, []);

  async function handleGenerate() {
    setDateError('');
    if (new Date(dateFrom) > new Date(dateTo)) { setDateError('Start date must be before end date.'); return; }
    setGenerating(true); setGenerated(false);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
    const contextMap: Record<string, string> = {
      inventory: `Inventory data (${inventory.length} items): ${JSON.stringify(inventory.slice(0, 20))}`,
      expiry: `Expiry data: ${JSON.stringify(inventory.filter(i => i.status !== 'Aman').slice(0, 20))}`,
      temperature: `Temperature readings: ${JSON.stringify(Object.entries(temperatures).map(([z, r]) => ({ zone: z, readings: r.slice(0, 6) })))}`,
      activity: `Audit logs (${activities.length} entries): ${JSON.stringify(activities.slice(0, 20))}`,
    };

    const prompt = `You are an AromaSys warehouse reporting AI. Generate a professional ${REPORT_TYPES.find(r => r.id === reportType)?.label} for the period ${dateFrom} to ${dateTo}.

Context data:
${contextMap[reportType]}

Generate a concise, professional warehouse report in plain text with:
- Executive Summary (2-3 sentences)
- Key Metrics (bullet points)
- Notable Findings
- Recommendations

Keep it under 400 words. Use clear headings.`;

    try {
      const res = await fetch(`${GEMINI_URL}${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Report generation failed. Please try again.';
      setGeneratedContent(text);
      setGenerated(true);
    } catch { setGeneratedContent('Failed to connect to AI service. Please check your API key and try again.'); setGenerated(true); }
    finally { setGenerating(false); }
  }

  function handleDownload() {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `aromasys-${reportType}-report-${dateFrom}.txt`; a.click();
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Auto-Report Generator</h1>
        <p className="text-sm text-[#79747E] mt-1">Generate AI-powered warehouse reports from live database data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Report Type */}
          <div className="bg-[#F5FBF3] rounded-2xl p-5 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 space-y-3">
            <h3 className="font-bold text-sm text-[#1C1B1F]">Report Type</h3>
            <div className="space-y-2">
              {REPORT_TYPES.map(rt => {
                const Icon = rt.icon;
                return (
                  <button key={rt.id} onClick={() => setReportType(rt.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${reportType === rt.id ? 'border-[#2C742F] bg-[#D7E5D8]/40' : 'border-stone-100 hover:bg-stone-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${reportType === rt.id ? 'bg-[#2C742F] text-white' : 'bg-stone-100 text-[#79747E]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C1B1F]">{rt.label}</p>
                      <p className="text-xs text-[#79747E] mt-0.5">{rt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-[#F5FBF3] rounded-2xl p-5 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 space-y-3">
            <h3 className="font-bold text-sm text-[#1C1B1F]">Date Range</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-[#79747E] block mb-1">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#79747E] block mb-1">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30" />
              </div>
              {dateError && <p className="text-xs text-[#EA4B48] font-semibold">{dateError}</p>}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || dataLoading}
            className="w-full py-3.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Report</>}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-[#F5FBF3] rounded-2xl shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 h-full min-h-[400px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-bold text-[#1C1B1F]">Report Preview</h3>
              {generated && (
                <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 text-sm font-semibold text-[#1C1B1F] hover:bg-stone-50 transition-all">
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>
            <div className="flex-1 p-6">
              {!generated && !generating && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#79747E]">
                  <FileBarChart className="w-12 h-12" />
                  <p className="text-sm font-semibold">Configure your report and click Generate</p>
                </div>
              )}
              {generating && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-10 h-10 text-[#2C742F] animate-spin" />
                  <p className="text-sm text-[#79747E] font-medium">AI is generating your report...</p>
                </div>
              )}
              {generated && !generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="whitespace-pre-wrap text-sm text-[#1C1B1F] leading-relaxed font-mono">
                  {generatedContent}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
