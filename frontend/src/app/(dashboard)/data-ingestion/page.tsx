"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  Plus,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────── Types ─────────────────────────── */
type FileCategory = "Essential Oil" | "Spices & Herbs" | "Resin & Balsam" | "Synthetic Extract";
type UploadStatus = "Validated" | "Processing" | "Failed";

interface StagedFile {
  id: string;
  file: File;
  ext: string;
  sizeLabel: string;
  progress: number;          // 0-100
  state: "uploading" | "done" | "failed";
}

interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: string;
  category: FileCategory;
  recordCount: number;
  uploadedBy: string;
  uploadedAt: string;
  status: UploadStatus;
  notes: string;
}

/* ─────────────────────────── Constants ─────────────────────────── */
const CATEGORY_OPTIONS: { value: FileCategory; label: string }[] = [
  { value: "Essential Oil", label: "Essential Oil (Cold Pressed / Distilled)" },
  { value: "Spices & Herbs", label: "Spices & Herbs (Dry Botanical Solids)" },
  { value: "Resin & Balsam", label: "Resin & Balsam (Gums & Viscous Fixatives)" },
  { value: "Synthetic Extract", label: "Synthetic Extract (Aroma Molecules)" },
];

const STATUS_OPTIONS: { value: UploadStatus; label: string }[] = [
  { value: "Validated", label: "Validated — Passed integrity check" },
  { value: "Processing", label: "Processing — Pending QC review" },
  { value: "Failed", label: "Failed — Schema / format mismatch" },
];

const MOCK_HISTORY: UploadRecord[] = [
  { id: "u-1", fileName: "batch_essential_oils_may26.csv", fileSize: "142 KB", category: "Essential Oil", recordCount: 48, uploadedBy: "Clara Amalia", uploadedAt: "May 26, 2026 — 10:31 WIB", status: "Validated", notes: "Olfactory verification passed for all 48 SKUs." },
  { id: "u-2", fileName: "herbs_restock_batch_q2.xlsx", fileSize: "88 KB", category: "Spices & Herbs", recordCount: 22, uploadedBy: "Budi Santoso", uploadedAt: "May 25, 2026 — 14:05 WIB", status: "Validated", notes: "Dry botanical solids, Zone C-4." },
  { id: "u-3", fileName: "resin_import_apr2026.csv", fileSize: "55 KB", category: "Resin & Balsam", recordCount: 13, uploadedBy: "Layla Hasan", uploadedAt: "Apr 30, 2026 — 09:15 WIB", status: "Processing", notes: "Awaiting lab assay confirmation." },
  { id: "u-4", fileName: "synthetic_molecules_v3.csv", fileSize: "201 KB", category: "Synthetic Extract", recordCount: 67, uploadedBy: "Rudi Prasetyo", uploadedAt: "Apr 22, 2026 — 16:44 WIB", status: "Failed", notes: "Column schema mismatch — re-upload required." },
  { id: "u-5", fileName: "eo_lavender_bergamot_batch.csv", fileSize: "118 KB", category: "Essential Oil", recordCount: 31, uploadedBy: "Clara Amalia", uploadedAt: "Apr 18, 2026 — 11:02 WIB", status: "Validated", notes: "Bergamot cold press, Zone A-1." },
  { id: "u-6", fileName: "herbs_q1_complete.xlsx", fileSize: "77 KB", category: "Spices & Herbs", recordCount: 19, uploadedBy: "Budi Santoso", uploadedAt: "Mar 31, 2026 — 08:55 WIB", status: "Validated", notes: "Quarterly batch closure." },
  { id: "u-7", fileName: "aroma_molecules_jan.csv", fileSize: "164 KB", category: "Synthetic Extract", recordCount: 52, uploadedBy: "Layla Hasan", uploadedAt: "Jan 14, 2026 — 13:30 WIB", status: "Validated", notes: "All synthetic checks cleared." },
  { id: "u-8", fileName: "resin_dec2025.csv", fileSize: "43 KB", category: "Resin & Balsam", recordCount: 9, uploadedBy: "Rudi Prasetyo", uploadedAt: "Dec 20, 2025 — 10:12 WIB", status: "Processing", notes: "Pending viscosity measurement." },
  { id: "u-9", fileName: "eo_patch_vetiver_nov.csv", fileSize: "99 KB", category: "Essential Oil", recordCount: 27, uploadedBy: "Clara Amalia", uploadedAt: "Nov 10, 2025 — 15:22 WIB", status: "Validated", notes: "Patchouli aged batch verified." },
  { id: "u-10", fileName: "herbs_oct_2025_batch.xlsx", fileSize: "61 KB", category: "Spices & Herbs", recordCount: 14, uploadedBy: "Budi Santoso", uploadedAt: "Oct 05, 2025 — 09:40 WIB", status: "Failed", notes: "Missing mandatory 'expiry_date' column." },
  { id: "u-11", fileName: "synthetic_sept_extra.csv", fileSize: "190 KB", category: "Synthetic Extract", recordCount: 60, uploadedBy: "Layla Hasan", uploadedAt: "Sep 28, 2025 — 14:00 WIB", status: "Validated", notes: "Supplementary Sept batch, all clear." },
];

/* ─────────────────────── File Icon Component ─────────────────────── */
function FileTypeIcon({ ext }: { ext: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pdf:  { bg: "bg-red-500",    text: "text-white", label: "PDF"  },
    xlsx: { bg: "bg-[#2C742F]", text: "text-white", label: "XLSX" },
    xls:  { bg: "bg-[#2C742F]", text: "text-white", label: "XLS"  },
    csv:  { bg: "bg-emerald-600", text: "text-white", label: "CSV" },
    jpg:  { bg: "bg-purple-500", text: "text-white", label: "JPG"  },
    jpeg: { bg: "bg-purple-500", text: "text-white", label: "JPG"  },
    png:  { bg: "bg-blue-500",   text: "text-white", label: "PNG"  },
    json: { bg: "bg-amber-500",  text: "text-white", label: "JSON" },
  };
  const cfg = map[ext.toLowerCase()] ?? { bg: "bg-stone-400", text: "text-white", label: ext.toUpperCase().slice(0, 4) };
  return (
    <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-[9px] font-black ${cfg.text} tracking-tight`}>{cfg.label}</span>
    </div>
  );
}

/* ─────────────────── Circular Progress SVG ─────────────────── */
function CircularProgress({ pct }: { pct: number }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <svg width="34" height="34" className="-rotate-90">
      <circle cx="17" cy="17" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx="17" cy="17" r={r} fill="none"
        stroke="#2C742F" strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
    </svg>
  );
}

/* ══════════════════════════ Page Component ══════════════════════════ */
export default function DataIngestionPage() {
  /* History */
  const [records, setRecords] = useState<UploadRecord[]>(MOCK_HISTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* Upload panel */
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Form state */
  const [category, setCategory] = useState<FileCategory>("Essential Oil");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusVal, setStatusVal] = useState<UploadStatus>("Validated");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [uploadedBy, setUploadedBy] = useState("Clara Amalia");
  const [showToast, setShowToast] = useState(false);

  /* ── Helpers ── */
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getExt = (name: string) => name.split(".").pop() ?? "";

  const makeId = () => `sf-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  /* ── Simulate upload progress for one file ── */
  const simulateUpload = (id: string, willFail = false) => {
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.floor(Math.random() * 18) + 8;
      if (pct >= 100) {
        pct = 100;
        clearInterval(tick);
        setStagedFiles(prev =>
          prev.map(f =>
            f.id === id
              ? { ...f, progress: 100, state: willFail ? "failed" : "done" }
              : f
          )
        );
        if (!willFail) {
          // Add to history
          setStagedFiles(prev => {
            const sf = prev.find(f => f.id === id);
            if (!sf) return prev;
            const now = new Date();
            const newRec: UploadRecord = {
              id: `u-${Date.now()}`,
              fileName: sf.file.name,
              fileSize: sf.sizeLabel,
              category,
              recordCount: Math.floor(Math.random() * 80) + 10,
              uploadedBy,
              uploadedAt: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                + " — " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              status: statusVal,
              notes: "",
            };
            setRecords(r => [newRec, ...r]);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
            return prev;
          });
        }
        return;
      }
      setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, progress: pct } : f));
    }, 200);
  };

  /* ── Add files ── */
  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const newStaged: StagedFile[] = arr.map(file => ({
      id: makeId(),
      file,
      ext: getExt(file.name),
      sizeLabel: formatSize(file.size),
      progress: 0,
      state: "uploading",
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
    // Simulate upload for each — randomly fail ~20%
    newStaged.forEach(sf => {
      simulateUpload(sf.id, Math.random() < 0.2);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const removeStaged = (id: string) => setStagedFiles(prev => prev.filter(f => f.id !== id));

  const retryFile = (id: string) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 0, state: "uploading" } : f));
    simulateUpload(id, false);
  };

  /* ── Table ── */
  const filteredRecords = records.filter(r =>
    r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusConfig = {
    Validated: { bg: "bg-lime-100 text-[#2C742F] border-lime-300/60", dot: "bg-[#2C742F]" },
    Processing: { bg: "bg-amber-50 text-amber-700 border-amber-300/60", dot: "bg-amber-500" },
    Failed:     { bg: "bg-rose-50 text-rose-700 border-rose-300/60",   dot: "bg-rose-600" },
  };

  /* ────────────────────────── Render ────────────────────────── */
  return (
    <div className="space-y-8 pb-16 text-left relative font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .di-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .di-scroll::-webkit-scrollbar-track { background: transparent; }
        .di-scroll::-webkit-scrollbar-thumb { background: rgba(44,116,47,0.14); border-radius: 9999px; }
        .di-scroll::-webkit-scrollbar-thumb:hover { background: rgba(44,116,47,0.28); }
      `}} />

      {/* ── Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white border border-lime-300/70 rounded-2xl shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-[#2C742F] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#1C1B1F]">File Uploaded Successfully</p>
              <p className="text-xs text-stone-500 mt-0.5">Data has been added to the ingestion history.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight">Data Ingestion</h2>
        <p className="text-sm text-stone-500 mt-1">
          Upload aromatic raw material data files into the system. Upload history is saved automatically.
        </p>
      </motion.div>

      {/* ══════════════ Upload Card ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
        className="w-full bg-[#F5FBF3] rounded-xl border border-lime-400/20 shadow-[0px_4px_12px_rgba(143,177,87,0.05)] overflow-hidden"
      >
        {/* Card Header */}
        <div className="px-5 py-4 border-b border-[#2C742F]/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C742F]/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#2C742F]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#1C1B1F]">Upload and Attach Files</p>
              <p className="text-xs text-stone-400">(.xlsx/csv/pdf/jpg)</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadPanelOpen(!uploadPanelOpen)}
            className="w-9 h-9 rounded-lg border border-stone-300/70 bg-white flex items-center justify-center hover:bg-stone-50 transition-colors"
          >
            <ArrowRight className={`w-4 h-4 text-stone-600 transition-transform duration-300 ${uploadPanelOpen ? "rotate-90" : ""}`} />
          </motion.button>
        </div>

        {/* ── Upload Body ── */}
        <AnimatePresence initial={false}>
          {uploadPanelOpen && (
            <motion.div
              key="upload-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Left: Drop Zone ── */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-10 min-h-[200px]
                    ${dragOver ? "border-[#2C742F] bg-lime-50" : "border-stone-300/60 bg-white hover:border-[#2C742F]/50 hover:bg-lime-50/40"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.json,.pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragOver ? "bg-[#2C742F]/20" : "bg-[#2C742F]/10"}`}>
                    <UploadCloud className={`w-7 h-7 transition-colors ${dragOver ? "text-[#2C742F]" : "text-[#2C742F]/70"}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#1C1B1F]">Drop your files here</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      or{" "}
                      <span className="text-[#2C742F] font-semibold underline underline-offset-2 cursor-pointer">
                        click to upload
                      </span>
                    </p>
                  </div>
                </div>

                {/* ── Right: File List + Form ── */}
                <div className="flex flex-col gap-4">

                  {/* File list */}
                  {stagedFiles.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto di-scroll pr-1">
                      <AnimatePresence>
                        {stagedFiles.map((sf) => (
                          <motion.div
                            key={sf.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.22 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                              ${sf.state === "failed"
                                ? "bg-rose-50 border-rose-300/60"
                                : "bg-white border-stone-200/70"
                              }`}
                          >
                            <FileTypeIcon ext={sf.ext} />

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#1C1B1F] truncate leading-snug">{sf.file.name}</p>
                              {sf.state === "failed" ? (
                                <>
                                  <p className="text-[10px] text-stone-500 mt-0.5">{sf.sizeLabel} · Upload failed, please try again</p>
                                  <button
                                    onClick={() => retryFile(sf.id)}
                                    className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1 hover:underline"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                    Try again
                                  </button>
                                </>
                              ) : (
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                  {sf.sizeLabel} · {sf.state === "done" ? "100% uploaded" : `${sf.progress}% uploaded`}
                                </p>
                              )}
                            </div>

                            {/* Right indicator */}
                            <div className="flex-shrink-0">
                              {sf.state === "uploading" && (
                                <CircularProgress pct={sf.progress} />
                              )}
                              {sf.state === "done" && (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-5 h-5 text-[#2C742F]" />
                                  <button
                                    onClick={() => removeStaged(sf.id)}
                                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-rose-50 flex items-center justify-center transition-colors group"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-500 transition-colors" />
                                  </button>
                                </div>
                              )}
                              {sf.state === "failed" && (
                                <button
                                  onClick={() => removeStaged(sf.id)}
                                  className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="space-y-3">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Material Category</label>
                      <div className="relative">
                        <button
                          onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setStatusDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-stone-300/60 rounded-lg text-sm text-[#1C1B1F] hover:border-[#2C742F]/40 transition-colors"
                        >
                          <span>{category}</span>
                          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {categoryDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setCategoryDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 p-1.5 space-y-0.5"
                              >
                                {CATEGORY_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => { setCategory(opt.value); setCategoryDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${category === opt.value ? "bg-[#2C742F]/10 text-[#2C742F]" : "text-[#1C1B1F] hover:bg-stone-50"}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Validation Status</label>
                      <div className="relative">
                        <button
                          onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setCategoryDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-stone-300/60 rounded-lg text-sm text-[#1C1B1F] hover:border-[#2C742F]/40 transition-colors"
                        >
                          <span>{STATUS_OPTIONS.find(s => s.value === statusVal)?.label}</span>
                          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {statusDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 p-1.5 space-y-0.5"
                              >
                                {STATUS_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => { setStatusVal(opt.value); setStatusDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${statusVal === opt.value ? "bg-[#2C742F]/10 text-[#2C742F]" : "text-[#1C1B1F] hover:bg-stone-50"}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Uploaded By */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Uploaded By</label>
                      <input
                        type="text"
                        value={uploadedBy}
                        onChange={e => setUploadedBy(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300/60 rounded-lg text-sm text-[#1C1B1F] focus:outline-none focus:border-[#2C742F]/50 transition-colors"
                        placeholder="Officer name..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ══════════════ History Table ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.14 }}
        className="w-full bg-[#F5FBF3] rounded-xl border border-lime-400/20 shadow-[0px_4px_12px_rgba(143,177,87,0.05)] overflow-hidden flex flex-col"
      >
        {/* Table header */}
        <div className="px-5 py-4 border-b border-[#2C742F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2C742F]/10 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#2C742F]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1B1F]">Upload History</p>
              <p className="text-xs text-stone-500">{filteredRecords.length} {filteredRecords.length === 1 ? "file" : "files"} found</p>
            </div>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search files, category, officer..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300/60 rounded-lg text-sm text-[#1C1B1F] placeholder:text-stone-400 focus:outline-none focus:border-[#2C742F]/40 transition-colors"
            />
          </div>
        </div>

        {/* Table — FIFO-style vertical scroll, sticky headers */}
        <div className="w-full overflow-y-auto max-h-[500px] border-b border-[#2C742F]/10 di-scroll">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <FileSpreadsheet className="w-10 h-10 text-stone-300" />
              <p className="text-sm font-bold text-stone-500">No Files Found</p>
              <p className="text-xs text-stone-400">Try adjusting your search keywords.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2C742F]/5 border-b border-[#2C742F]/10 text-stone-700 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4 sticky top-0 bg-[#F5FBF3] z-10">File Name</th>
                  <th className="px-4 py-4 sticky top-0 bg-[#F5FBF3] z-10">Category</th>
                  <th className="px-4 py-4 sticky top-0 bg-[#F5FBF3] z-10">Records</th>
                  <th className="px-4 py-4 sticky top-0 bg-[#F5FBF3] z-10">Uploaded By</th>
                  <th className="px-4 py-4 sticky top-0 bg-[#F5FBF3] z-10">Date</th>
                  <th className="px-4 py-4 sticky top-0 bg-[#F5FBF3] z-10">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C742F]/10">
                {paginatedRecords.map((rec, idx) => {
                  const s = statusConfig[rec.status];
                  return (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: idx * 0.04 }}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2.5">
                          <FileTypeIcon ext={rec.fileName.split(".").pop() ?? ""} />
                          <div>
                            <p className="font-bold text-[#1C1B1F] leading-snug max-w-[180px] truncate">{rec.fileName}</p>
                            <p className="text-stone-400 font-medium mt-0.5 text-[10px]">{rec.fileSize}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className="px-2.5 py-1 rounded-md bg-[#2C742F]/[0.08] text-[#2C742F] text-[10px] font-bold">{rec.category}</span>
                      </td>
                      <td className="px-4 py-5 text-stone-700 font-bold">
                        {rec.recordCount} <span className="text-stone-400 font-normal">rows</span>
                      </td>
                      <td className="px-4 py-5 text-stone-600 font-semibold">{rec.uploadedBy}</td>
                      <td className="px-4 py-5 text-stone-500">{rec.uploadedAt}</td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${s.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                          {rec.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-[#2C742F]/10 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Showing{" "}
              <span className="font-semibold text-[#1C1B1F]">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRecords.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#1C1B1F]">{filteredRecords.length}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                    currentPage === page
                      ? "bg-[#2C742F] border-[#2C742F] text-white"
                      : "border-stone-300/60 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
              >
                ›
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
