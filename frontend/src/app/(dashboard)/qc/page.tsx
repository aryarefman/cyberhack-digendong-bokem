"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  History,
  Microscope,
  Leaf,
  FlaskConical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { callAI } from "@/lib/gemini";
import { useLanguage } from "@/lib/i18n";

type MaterialTab = "fruit-raw" | "extract-powder";

interface QCResult {
  result: "pass" | "fail";
  confidence: number;
  notes: string;
}

interface InspectionRecord {
  id: number;
  materialId: string;
  materialType: string;
  result: "pass" | "fail";
  confidence: number;
  notes: string;
  inspectedAt: string;
}

export default function QCPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MaterialTab>("fruit-raw");
  const [materialId, setMaterialId] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [qcResult, setQcResult] = useState<QCResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualResult, setManualResult] = useState<"pass" | "fail">("pass");
  const [manualConfidence, setManualConfidence] = useState(80);
  const [manualNotes, setManualNotes] = useState("");

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const materialType = activeTab === "fruit-raw" ? "fruit" : "extract";

  // Fetch inspection history
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await api.get<{ success: boolean; inspections: InspectionRecord[] }>("/qc/history");
      if (data.success) {
        setHistory(data.inspections);
      }
    } catch {
      // Silently fail for history
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan atau gunakan upload file.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setImageBase64(base64);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runInspection = async () => {
    if (!imageBase64) {
      setError("Silakan ambil gambar atau upload file terlebih dahulu.");
      return;
    }
    if (!materialId.trim()) {
      setError("Silakan masukkan Material/Batch ID.");
      return;
    }

    setIsInspecting(true);
    setError(null);
    setQcResult(null);
    setSaveSuccess(false);

    try {
      // 1. Fetch product context from database
      let productContext = "";
      let historicalQC = "";
      try {
        // Get inventory item details
        const invRes = await api.get<{ success: boolean; items: any[] }>("/inventory");
        if (invRes.success && invRes.items) {
          const product = invRes.items.find((item: any) => 
            item.id === materialId || item.name === materialId
          );
          if (product) {
            productContext = `
Product Details:
- Name: ${product.name}
- Category: ${product.category}
- Current Stock: ${product.qty} ${product.unit}
- Stored in Zone: ${product.zone}
- Date In: ${product.dateIn}
- Expiry: ${product.expiry}
- Current Status: ${product.status}
- Last QC Notes: ${product.lastQCNotes || 'None'}
`;
          }
        }

        // Get historical QC results for this material
        const qcHistRes = await api.get<{ success: boolean; inspections: any[] }>("/qc/history");
        if (qcHistRes.success && qcHistRes.inspections) {
          const pastQCs = qcHistRes.inspections
            .filter((rec: any) => rec.materialId === materialId)
            .slice(-3); // Last 3 QC records
          if (pastQCs.length > 0) {
            historicalQC = `\nPast QC Records (for reference):
${pastQCs.map((qc: any) => `- ${qc.inspectedAt}: Result=${qc.result} (Confidence: ${qc.confidence}%) - ${qc.notes}`).join('\n')}`;
          }
        }
      } catch {
        // Silently continue without product context if API fails
      }

      // 2. Get temperature data from zone if available
      let zoneContext = "";
      try {
        const tempRes = await api.get<any>("/cold-chain");
        if (tempRes.temperatures) {
          // Parse zone from product data or use default
          const zone = materialId.charAt(0).toUpperCase() || 'A';
          const zoneTemps = tempRes.temperatures[zone];
          if (zoneTemps && zoneTemps.length > 0) {
            zoneContext = `\nCurrent Storage Conditions:
- Zone Temperature: ${zoneTemps[0]?.toFixed(1) || 'N/A'}°C (Latest reading)
- Environment may affect material quality`;
          }
        }
      } catch {
        // Silently continue without temperature data
      }

      // 3. Build comprehensive quality standards based on material type
      const materialLabel = activeTab === "fruit-raw" ? "fruit/raw material" : "extract/powder";
      const categoryStandards = {
        "Kimia": "Must have uniform color, no powder separation, clean packaging",
        "Pengawet": "Check for color consistency, no discoloration, proper sealing",
        "Susu": "Creamy texture, uniform color, no lumps or separation",
        "Cokelat": "Dark brown color, smooth texture, no white bloom or cracks",
        "Tepung": "Fine texture, uniform color, no clumping or moisture",
        "Gula": "Granular texture, white/brown uniformity, no caramelization",
        "Minyak": "Clear appearance, proper viscosity, no separation",
        "Pewarna": "Vibrant color, uniform concentration, no crystallization",
        "Essence": "Clear/transparent, proper concentration, no separation",
        "Rempah": "Rich color, aromatic indicators visible, no mold"
      };

      const prompt = `You are a professional quality control inspector for an aroma/botanical warehouse.
Perform a detailed QC inspection on this ${materialLabel} material.

${productContext}${historicalQC}${zoneContext}

QUALITY STANDARDS FOR THIS MATERIAL TYPE:
${categoryStandards['Kimia'] || 'Standard food-grade quality inspection'}

INSPECTION CRITERIA (ranked by importance):
1. Color: Consistency and expected hue for material type
2. Texture: Uniformity, grain size, absence of lumps
3. Cleanliness: No visible contamination, mold, or foreign objects
4. Packaging/Condition: If visible - proper sealing, no damage
5. Freshness Indicators: Signs of degradation based on storage time

Based on the image, provide:
- Overall Result: "pass" or "fail"
- Confidence: 0-100 percentage (your certainty level)
- Detailed Assessment: Specific observations about condition, risks, and recommendations

Respond in JSON format: {
  "result": "pass" or "fail",
  "confidence": number 0-100,
  "notes": "detailed findings including specific observations, any concerns, and recommendations"
}

Return ONLY valid JSON object, no markdown.`;

      const response = await callAI(prompt, "qc", imageBase64, "image/jpeg");
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI response did not contain valid JSON");
      }
      const parsed = JSON.parse(jsonMatch[0]) as QCResult;
      if (!parsed.result || !["pass", "fail"].includes(parsed.result)) {
        throw new Error("Invalid result format from AI");
      }
      setQcResult({
        result: parsed.result,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
        notes: parsed.notes || "No additional notes.",
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
      const isAIUnavailable = errMsg.includes("All Gemini models failed") || errMsg.includes("NEXT_PUBLIC_GEMINI_API_KEY");
      setError(
        isAIUnavailable
          ? "Layanan AI sedang tidak tersedia. Silakan lakukan inspeksi manual: isi form di bawah untuk mencatat hasil QC secara manual tanpa AI."
          : `Inspeksi gagal: ${errMsg}. Silakan coba lagi atau lakukan inspeksi manual.`
      );
      // Show manual inspection fallback when AI is unavailable
      if (isAIUnavailable) {
        setShowManualForm(true);
      }
    } finally {
      setIsInspecting(false);
    }
  };

  const saveToDatabase = async () => {
    if (!qcResult) return;
    setIsSaving(true);
    try {
      await api.post("/qc/inspect", {
        imageBase64,
        materialType,
        materialId: materialId.trim(),
        result: qcResult.result,
        confidence: qcResult.confidence,
        notes: qcResult.notes,
      });
      setSaveSuccess(true);
      fetchHistory();
    } catch {
      setError("Gagal menyimpan hasil inspeksi ke database.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetInspection = () => {
    setImageBase64(null);
    setQcResult(null);
    setSaveSuccess(false);
    setError(null);
    setMaterialId("");
    setShowManualForm(false);
    setManualResult("pass");
    setManualConfidence(80);
    setManualNotes("");
  };

  const submitManualInspection = () => {
    if (!materialId.trim()) {
      setError("Silakan masukkan Material/Batch ID.");
      return;
    }
    if (!manualNotes.trim()) {
      setError("Silakan masukkan catatan inspeksi manual.");
      return;
    }
    setQcResult({
      result: manualResult,
      confidence: manualConfidence,
      notes: `[Inspeksi Manual] ${manualNotes}`,
    });
    setShowManualForm(false);
    setError(null);
  };

  return (
    <div className="space-y-8 pb-16 text-left relative">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">
          {t('qualityControl')}
        </h2>
        <p className="text-sm text-stone-500 font-semibold mt-1">
          Inspeksi kualitas material menggunakan AI vision analysis
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setActiveTab("fruit-raw"); resetInspection(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "fruit-raw"
              ? "bg-[#2C742F] text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          <Leaf className="w-4 h-4" />
          Fruit & Raw Material
        </button>
        <button
          onClick={() => { setActiveTab("extract-powder"); resetInspection(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "extract-powder"
              ? "bg-[#2C742F] text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Extract & Powder
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Camera & Capture */}
        <div className="bg-[#F5FBF3] rounded-3xl p-6 border border-[#2C742F]/10 shadow-[6px_6px_54px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#2C742F]" />
            Capture Material Image
          </h3>

          {/* Camera / Image Preview */}
          <div className="relative w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 mb-4">
            {cameraActive && !imageBase64 ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : imageBase64 ? (
              <img
                src={imageBase64}
                alt="Captured material"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                <Microscope className="w-12 h-12 opacity-40" />
                <span className="text-xs font-semibold">Belum ada gambar</span>
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-3">
            {!cameraActive && !imageBase64 && (
              <>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#2C742F]/90 text-white text-xs font-bold transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Start Camera
                </button>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-bold cursor-pointer hover:bg-stone-50 transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
            {cameraActive && !imageBase64 && (
              <>
                <button
                  onClick={captureImage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#2C742F]/90 text-white text-xs font-bold transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
                >
                  Stop Camera
                </button>
              </>
            )}
            {imageBase64 && (
              <button
                onClick={() => { setImageBase64(null); setQcResult(null); setSaveSuccess(false); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
              >
                Retake / Upload Baru
              </button>
            )}
          </div>

          {/* Material ID Input */}
          <div className="mt-5">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Material / Batch ID
            </label>
            <input
              type="text"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              placeholder="Contoh: BATCH-2024-001"
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm font-semibold text-neutral-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#2C742F]"
            />
          </div>

          {/* Inspect Button */}
          <button
            onClick={runInspection}
            disabled={isInspecting || !imageBase64 || !materialId.trim()}
            className="mt-5 w-full py-3 rounded-full bg-[#2C742F] hover:bg-[#2C742F]/90 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isInspecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Microscope className="w-4 h-4" />
                Inspect with AI
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Manual Inspection Form Fallback */}
          {showManualForm && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <Microscope className="w-4 h-4" />
                Form Inspeksi Manual
              </h4>
              <p className="text-xs text-amber-700">
                AI tidak tersedia. Gunakan form ini untuk mencatat hasil inspeksi secara manual.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Hasil Inspeksi
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setManualResult("pass")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      manualResult === "pass"
                        ? "bg-emerald-500 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    PASS
                  </button>
                  <button
                    onClick={() => setManualResult("fail")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      manualResult === "fail"
                        ? "bg-red-500 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    FAIL
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Confidence (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={manualConfidence}
                  onChange={(e) => setManualConfidence(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-sm font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Catatan Inspeksi
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Deskripsikan kondisi material, defek yang ditemukan, dll."
                  rows={3}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-neutral-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>
              <button
                onClick={submitManualInspection}
                className="w-full py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all active:scale-[0.98]"
              >
                Submit Inspeksi Manual
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Results */}
        <div className="bg-[#F5FBF3] rounded-3xl p-6 border border-[#2C742F]/10 shadow-[6px_6px_54px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-[#2C742F]" />
            Inspection Result
          </h3>

          <AnimatePresence mode="wait">
            {qcResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Pass/Fail Badge */}
                <div className="flex items-center justify-center">
                  <div
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 ${
                      qcResult.result === "pass"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-red-50 border-red-300 text-red-800"
                    }`}
                  >
                    {qcResult.result === "pass" ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                    <span className="text-3xl font-black uppercase">
                      {qcResult.result === "pass" ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="text-center">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Confidence Level
                  </span>
                  <span className="text-4xl font-black text-neutral-800 mt-1 block">
                    {qcResult.confidence}%
                  </span>
                  <div className="w-full bg-stone-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        qcResult.result === "pass" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      style={{ width: `${qcResult.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                    Quality Assessment Notes
                  </span>
                  <div className="bg-white border border-stone-200 rounded-xl p-4 text-sm text-stone-700 leading-relaxed">
                    {qcResult.notes}
                  </div>
                </div>

                {/* Save Button */}
                {!saveSuccess ? (
                  <button
                    onClick={saveToDatabase}
                    disabled={isSaving}
                    className="w-full py-3 rounded-full bg-[#2C742F] hover:bg-[#2C742F]/90 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save to Database
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-sm text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Berhasil disimpan!
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-stone-400 gap-3"
              >
                <Microscope className="w-16 h-16 opacity-30" />
                <p className="text-sm font-semibold">Belum ada hasil inspeksi</p>
                <p className="text-xs text-stone-400">
                  Ambil gambar material dan klik "Inspect with AI"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inspection History */}
      <div className="bg-[#F5FBF3] rounded-3xl p-6 border border-[#2C742F]/10 shadow-[6px_6px_54px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#2C742F]" />
          Inspection History
        </h3>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2C742F]" />
            <span className="text-sm text-stone-500 font-semibold">Memuat riwayat...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p className="text-sm font-semibold">Belum ada riwayat inspeksi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Material ID
                  </th>
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="py-3 px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-neutral-800">
                      {record.materialId}
                    </td>
                    <td className="py-3 px-3 text-stone-600 capitalize">
                      {record.materialType}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          record.result === "pass"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.result === "pass" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {record.result.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-800">
                      {record.confidence}%
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-[200px] truncate">
                      {record.notes || "-"}
                    </td>
                    <td className="py-3 px-3 text-stone-500 text-xs">
                      {new Date(record.inspectedAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
