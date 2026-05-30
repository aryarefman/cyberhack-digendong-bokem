'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, FileText, CheckCircle2, AlertCircle, AlertTriangle, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface OcrItem {
  name: string;
  category: string;
  qty: number;
  unit: string;
  expiry: string;
  confidence: number;
  lotNumber: string;
  location?: string;
  zone?: string;
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`;
const OCR_PROMPT = `You are an expert OCR and data extraction system for the AromaSys warehouse.
Extract all inventory items from this document. Return ONLY a valid JSON array, no markdown.
Each object must have: name (string), category (string, one of: 'Tepung','Gula','Minyak','Pewarna','Essence','Pengawet','Susu','Cokelat','Rempah','Kimia'), qty (number), unit (string, one of: 'kg','liter','pcs','box','karung','drum'), expiry (string YYYY-MM-DD), confidence (number 0-100), lotNumber (string).
If no items found, return [].`;

export default function UploadPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [ocrResult, setOcrResult] = useState<OcrItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processedFileNames, setProcessedFileNames] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<OcrItem>>({});

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

  async function queryGeminiOCR(base64: string, mimeType: string): Promise<OcrItem[]> {
    const res = await fetch(`${GEMINI_URL}${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: OCR_PROMPT }, { inlineData: { mimeType, data: base64 } }] }] }),
    });
    if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  const processFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setIsProcessing(true); setError(null); setSaved(false);
    const allItems: OcrItem[] = [];

    for (const file of files) {
      try {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = e => {
              const result = e.target?.result as string;
              resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const items = await queryGeminiOCR(base64, file.type);
          allItems.push(...items.map(i => ({ ...i, location: 'A-1', zone: 'A' })));
          setProcessedFileNames(prev => [...prev, file.name]);
        }
      } catch (e) {
        console.error(`OCR failed for ${file.name}:`, e);
      }
    }

    setOcrResult(prev => [...prev, ...allItems]);
    setIsProcessing(false);
  }, [apiKey]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(Array.from(e.target.files));
  }

  async function handleSave() {
    if (!ocrResult.length) return;
    setIsSaving(true);
    try {
      for (const item of ocrResult) {
        await api.post('/inventory', {
          name: item.name, category: item.category, qty: item.qty, unit: item.unit,
          location: item.location || 'A-1', zone: item.zone || 'A',
          dateIn: new Date().toISOString().split('T')[0], expiry: item.expiry,
        });
      }
      setSaved(true); setOcrResult([]);
    } catch { setError('Failed to save items to database.'); }
    finally { setIsSaving(false); }
  }

  const startEdit = (i: number) => { setEditIndex(i); setEditForm({ ...ocrResult[i] }); };
  const saveEdit = () => {
    if (editIndex === null) return;
    const updated = [...ocrResult]; updated[editIndex] = { ...updated[editIndex], ...editForm };
    setOcrResult(updated); setEditIndex(null);
  };
  const deleteItem = (i: number) => setOcrResult(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Data Ingestion</h1>
        <p className="text-sm text-[#79747E] mt-1">Upload delivery notes or invoices — AI will extract inventory data automatically.</p>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragOver ? 'border-[#2C742F] bg-[#D7E5D8]/40' : 'border-stone-300 bg-white hover:border-[#2C742F]/50 hover:bg-[#D7E5D8]/20'}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#2C742F]/10 flex items-center justify-center">
          <UploadIcon className="w-7 h-7 text-[#2C742F]" />
        </div>
        <div className="text-center">
          <p className="font-bold text-[#1C1B1F]">Drop files here or click to browse</p>
          <p className="text-sm text-[#79747E] mt-1">Supports images (JPG, PNG) and PDFs</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {isProcessing && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-blue-700">AI is extracting inventory data from your files...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-[#EA4B48]" />
          <p className="text-sm font-semibold text-[#EA4B48]">{error}</p>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-700">All items saved to inventory successfully!</p>
        </div>
      )}

      {/* Extracted Items */}
      {ocrResult.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5FBF3] rounded-2xl shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h3 className="font-bold text-[#1C1B1F]">{ocrResult.length} items extracted</h3>
            <button onClick={handleSave} disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306] transition-all disabled:opacity-50">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle2 className="w-4 h-4" />Save All to Inventory</>}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>{['Item Name', 'Category', 'Qty', 'Unit', 'Expiry', 'Confidence', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#79747E]">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {ocrResult.map((item, i) => (
                  <tr key={i} className="border-b border-stone-50 last:border-0">
                    {editIndex === i ? (
                      <>
                        <td className="px-3 py-2"><input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="border border-stone-200 rounded-lg px-2 py-1 text-sm w-full" /></td>
                        <td className="px-3 py-2"><input value={editForm.category ?? ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="border border-stone-200 rounded-lg px-2 py-1 text-sm w-full" /></td>
                        <td className="px-3 py-2"><input type="number" value={editForm.qty ?? 0} onChange={e => setEditForm(f => ({ ...f, qty: Number(e.target.value) }))} className="border border-stone-200 rounded-lg px-2 py-1 text-sm w-20" /></td>
                        <td className="px-3 py-2"><input value={editForm.unit ?? ''} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))} className="border border-stone-200 rounded-lg px-2 py-1 text-sm w-20" /></td>
                        <td className="px-3 py-2"><input type="date" value={editForm.expiry ?? ''} onChange={e => setEditForm(f => ({ ...f, expiry: e.target.value }))} className="border border-stone-200 rounded-lg px-2 py-1 text-sm" /></td>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2 flex gap-1">
                          <button onClick={saveEdit} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditIndex(null)} className="p-1.5 rounded-lg bg-stone-100 text-[#79747E] hover:bg-stone-200"><X className="w-3.5 h-3.5" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold text-[#1C1B1F]">{item.name}</td>
                        <td className="px-4 py-3 text-[#79747E]">{item.category}</td>
                        <td className="px-4 py-3 text-[#1C1B1F]">{item.qty}</td>
                        <td className="px-4 py-3 text-[#79747E]">{item.unit}</td>
                        <td className="px-4 py-3 text-xs text-[#79747E]">{item.expiry}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${item.confidence >= 80 ? 'text-emerald-600' : item.confidence >= 60 ? 'text-amber-600' : 'text-[#EA4B48]'}`}>{item.confidence}%</span>
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button onClick={() => startEdit(i)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteItem(i)} className="p-1.5 rounded-lg bg-red-100 text-[#EA4B48] hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
