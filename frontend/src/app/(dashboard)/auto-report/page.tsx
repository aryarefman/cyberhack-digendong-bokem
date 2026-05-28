"use client";

import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Calendar, 
  FileText, 
  Table, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Eye, 
  ChevronRight,
  Download,
  Share2,
  FileCheck2,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutoReportPage() {
  // 1. Selection States
  const [selectedType, setSelectedType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [startDate, setStartDate] = useState("2023-10-24");
  const [endDate, setEndDate] = useState("2023-10-25");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel">("pdf");

  // 2. Report Generation Simulation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const steps = [
    "Establishing secure connection to AromaSys database...",
    "Querying current botanical stock and sensor logs...",
    "Validating FIFO expiry timelines & degradation charts...",
    "Compiling AI Copilot summaries & recommendations...",
    "Synthesizing high-fidelity report file structure..."
  ];

  // 3. Trigger Report Generation Animation
  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationSuccess(false);
  };

  useEffect(() => {
    if (isGenerating && generationStep < steps.length) {
      const timer = setTimeout(() => {
        setGenerationStep(prev => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else if (isGenerating && generationStep === steps.length) {
      const timer = setTimeout(() => {
        setIsGenerating(false);
        setGenerationSuccess(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationStep]);

  // 4. Data Content for Preview
  const reportData = {
    daily: {
      title: "Daily Inventory Status",
      subtitle: "Current botanical stocks, low-level alerts, and pending arrivals.",
      metrics: [
        {
          label: "Total Raw Botanical",
          value: "4,250",
          unit: "kg",
          trend: "+2.4% vs yesterday",
          trendType: "up",
          icon: FileText,
          iconColor: "text-lime-800",
          iconBg: "bg-lime-100",
          borderStyle: "border-stone-200/50"
        },
        {
          label: "Pending Arrivals",
          value: "12",
          unit: "pallets",
          trend: "Expected by 14:00",
          trendType: "info",
          icon: FileSpreadsheet,
          iconColor: "text-amber-500",
          iconBg: "bg-amber-100/50",
          borderStyle: "border-stone-200/50"
        },
        {
          label: "Low Stock Alerts",
          value: "3",
          unit: "items",
          trend: "Action required today",
          trendType: "warning",
          icon: AlertTriangle,
          iconColor: "text-red-600",
          iconBg: "bg-red-100/50",
          borderStyle: "border-t-4 border-t-amber-400 border-x-stone-200/50 border-b-stone-200/50"
        }
      ],
      reservesTitle: "Top Botanical Reserves",
      reserves: [
        { name: "Lavender Oil (Grade A)", current: 850, max: 1000, color: "bg-lime-800", labelStyle: "text-green-950" },
        { name: "Peppermint Extract", current: 620, max: 800, color: "bg-[#BCF389]", labelStyle: "text-green-950" },
        { name: "Sandalwood Base", current: 120, max: 500, color: "bg-amber-400", isCrit: true, labelStyle: "text-amber-500 font-bold" },
        { name: "Eucalyptus Crude", current: 450, max: 600, color: "bg-[#4E7D22]", labelStyle: "text-green-950" }
      ],
      copilot: "Inventory levels are generally stable across primary botanical categories. However, Sandalwood Base has fallen below the 25% safety threshold. Recommend expediting PO #4892 from supplier to avoid production delays next week. Lavender reserves remain optimal following yesterday's shipment."
    },
    weekly: {
      title: "Weekly FIFO & Expiry",
      subtitle: "Material degradation risks and rotation schedules.",
      metrics: [
        {
          label: "Near Expiry Batches",
          value: "2",
          unit: "lots",
          trend: "Expires within 7 days",
          trendType: "warning",
          icon: AlertTriangle,
          iconColor: "text-red-700",
          iconBg: "bg-red-100",
          borderStyle: "border-t-4 border-t-red-600 border-x-stone-200/50 border-b-stone-200/50"
        },
        {
          label: "Rotation Rate",
          value: "92.4%",
          unit: "efficiency",
          trend: "+1.2% improvement",
          trendType: "up",
          icon: FileSpreadsheet,
          iconColor: "text-lime-800",
          iconBg: "bg-lime-100",
          borderStyle: "border-stone-200/50"
        },
        {
          label: "Quality Audits",
          value: "8",
          unit: "passed",
          trend: "100% compliance rate",
          trendType: "success",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-100/50",
          borderStyle: "border-stone-200/50"
        }
      ],
      reservesTitle: "Batch Aging Distribution",
      reserves: [
        { name: "Patchouli Oil (Aged) - LOT-PO-230526", current: 28, max: 30, color: "bg-red-600", isCrit: true, labelStyle: "text-red-600 font-bold" },
        { name: "Jasmine Absolute - LOT-JA-240218", current: 15, max: 120, color: "bg-[#BCF389]", labelStyle: "text-green-950" },
        { name: "Rosemary Extract - LOT-RE-231102", current: 42, max: 60, color: "bg-[#4E7D22]", labelStyle: "text-green-950" },
        { name: "Bergamot Cold Press - LOT-BC-240102", current: 8, max: 90, color: "bg-[#BCF389]", labelStyle: "text-green-950" }
      ],
      copilot: "Batch LOT-PO-230526 (Patchouli Oil) is nearing its absolute expiry threshold in 5 days. Urgent rotation is scheduled for production line B. Quality audit registers indicate zero temperature deviance records for all active lots this week."
    },
    monthly: {
      title: "Monthly Consumption Log",
      subtitle: "Historical usage trends and variance analysis.",
      metrics: [
        {
          label: "Total Material Ingested",
          value: "18,450",
          unit: "kg",
          trend: "-1.2% vs master plan",
          trendType: "down",
          icon: FileText,
          iconColor: "text-[#2C742F]",
          iconBg: "bg-[#D6E5D7]",
          borderStyle: "border-stone-200/50"
        },
        {
          label: "Production Efficiency",
          value: "98.2%",
          unit: "yield",
          trend: "Highest this quarter",
          trendType: "success",
          icon: CheckCircle2,
          iconColor: "text-lime-800",
          iconBg: "bg-lime-100",
          borderStyle: "border-stone-200/50"
        },
        {
          label: "Average Cycle Time",
          value: "4.2",
          unit: "hrs",
          trend: "Optimal line speed",
          trendType: "info",
          icon: FileSpreadsheet,
          iconColor: "text-blue-500",
          iconBg: "bg-blue-100/50",
          borderStyle: "border-stone-200/50"
        }
      ],
      reservesTitle: "Monthly Material Allocation Usage",
      reserves: [
        { name: "Lavender Extract Base", current: 3120, max: 3500, color: "bg-lime-800", labelStyle: "text-green-950" },
        { name: "Orange Terpenes", current: 1850, max: 2000, color: "bg-[#4E7D22]", labelStyle: "text-green-950" },
        { name: "Sandalwood Oil", current: 490, max: 600, color: "bg-lime-800", labelStyle: "text-green-950" },
        { name: "Peppermint Base", current: 2200, max: 3000, color: "bg-[#BCF389]", labelStyle: "text-green-950" }
      ],
      copilot: "Monthly ingestion volumes have aligned exceptionally with our master production schedule. Yield recovery rates spiked to 98.2%, driven by optimized staging in Zone A. Material variance remains well below the 1% target deviation window."
    }
  };

  const currentPreview = reportData[selectedType];

  return (
    <div className="space-y-8 pb-16 text-left relative">
      
      {/* 1. Header Title Row */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">Auto-Report</h2>
          <p className="text-stone-700/80 text-sm font-normal mt-1">Configure parameters and instantly preview scheduled automatic operations telemetry summaries.</p>
        </div>
      </motion.div>

      {/* 2. Main Two Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">
        
        {/* ==================== LEFT COLUMN: Report Configuration ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="w-full bg-white rounded-xl shadow-[0px_4px_12px_rgba(14,32,0,0.04)] border border-lime-400/20 p-6 flex flex-col gap-6"
        >
          
          {/* Section title header */}
          <div className="pb-4 border-b border-stone-300/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex justify-center items-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-lime-800" />
            </div>
            <div>
              <h3 className="text-green-950 text-lg font-bold font-sans">Report Configuration</h3>
              <p className="text-stone-700 text-xs font-normal">Define parameters for automated generation</p>
            </div>
          </div>

          {/* Form Body fields */}
          <div className="space-y-5">
            
            {/* 1. Report Type Section */}
            <div className="space-y-3">
              <label className="text-stone-700 text-[10px] font-bold uppercase tracking-wider block">REPORT TYPE</label>
              
              <div className="space-y-2">
                {/* Option 1: Daily */}
                <button
                  onClick={() => setSelectedType("daily")}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 outline-none ${
                    selectedType === "daily" 
                      ? "bg-green-100 border-lime-800/80 shadow-sm" 
                      : "bg-white hover:bg-stone-50 border-stone-300/40"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedType === "daily" ? "border-lime-800" : "border-stone-300"
                    }`}>
                      {selectedType === "daily" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-lime-800" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-green-950 text-sm font-bold">Daily Inventory Status</h4>
                    <p className="text-stone-700 text-xs font-normal mt-0.5 leading-relaxed">
                      Current botanical stocks, low-level alerts, and pending arrivals.
                    </p>
                  </div>
                </button>

                {/* Option 2: Weekly */}
                <button
                  onClick={() => setSelectedType("weekly")}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 outline-none ${
                    selectedType === "weekly" 
                      ? "bg-green-100 border-lime-800/80 shadow-sm" 
                      : "bg-white hover:bg-stone-50 border-stone-300/40"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedType === "weekly" ? "border-lime-800" : "border-stone-300"
                    }`}>
                      {selectedType === "weekly" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-lime-800" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-green-950 text-sm font-bold">Weekly FIFO & Expiry</h4>
                    <p className="text-stone-700 text-xs font-normal mt-0.5 leading-relaxed">
                      Material degradation risks and rotation schedules.
                    </p>
                  </div>
                </button>

                {/* Option 3: Monthly */}
                <button
                  onClick={() => setSelectedType("monthly")}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 outline-none ${
                    selectedType === "monthly" 
                      ? "bg-green-100 border-lime-800/80 shadow-sm" 
                      : "bg-white hover:bg-stone-50 border-stone-300/40"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedType === "monthly" ? "border-lime-800" : "border-stone-300"
                    }`}>
                      {selectedType === "monthly" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-lime-800" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-green-950 text-sm font-bold">Monthly Consumption Log</h4>
                    <p className="text-stone-700 text-xs font-normal mt-0.5 leading-relaxed">
                      Historical usage trends and variance analysis.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Timeframe Date Picker Fields */}
            <div className="space-y-3">
              <label className="text-stone-700 text-[10px] font-bold uppercase tracking-wider block">TIMEFRAME</label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white pl-9 pr-2.5 py-2.5 rounded-full border border-lime-400/30 text-green-950 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-lime-800 focus:border-lime-800 cursor-pointer"
                  />
                </div>

                {/* End Date */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white pl-9 pr-2.5 py-2.5 rounded-full border border-lime-400/30 text-green-950 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-lime-800 focus:border-lime-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Export Format Toggles */}
            <div className="space-y-3">
              <label className="text-stone-700 text-[10px] font-bold uppercase tracking-wider block">EXPORT FORMAT</label>
              
              <div className="flex gap-4">
                {/* PDF option */}
                <button
                  onClick={() => setSelectedFormat("pdf")}
                  className={`flex-1 py-3 rounded-full border flex items-center justify-center gap-2 transition-all font-semibold text-sm outline-none ${
                    selectedFormat === "pdf"
                      ? "bg-green-100 border-lime-800 text-lime-800 shadow-sm"
                      : "bg-white border-stone-300/40 text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  }`}
                >
                  <FileText className={`w-4 h-4 ${selectedFormat === "pdf" ? "text-lime-800" : "text-stone-400"}`} />
                  <span>PDF Report</span>
                </button>

                {/* Excel option */}
                <button
                  onClick={() => setSelectedFormat("excel")}
                  className={`flex-1 py-3 rounded-full border flex items-center justify-center gap-2 transition-all font-semibold text-sm outline-none ${
                    selectedFormat === "excel"
                      ? "bg-green-100 border-lime-800 text-lime-800 shadow-sm"
                      : "bg-white border-stone-300/40 text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  }`}
                >
                  <Table className={`w-4 h-4 ${selectedFormat === "excel" ? "text-lime-800" : "text-stone-400"}`} />
                  <span>Excel Data</span>
                </button>
              </div>
            </div>

            {/* 4. Action Button Generate Report */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-[#00B207] hover:bg-[#2C742F] text-white rounded-full flex items-center justify-center gap-2.5 font-bold shadow-[0px_4px_12px_rgba(0,178,7,0.2)] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer focus:outline-none"
              >
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <span>Generate Report</span>
              </button>
            </div>

          </div>
        </motion.div>

        {/* ==================== RIGHT COLUMN: Live Preview Panel ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full bg-white/60 backdrop-blur-md rounded-2xl shadow-[0px_25px_50px_-12px_rgba(14,32,0,0.05)] border border-white/40 p-6 md:p-8 flex flex-col gap-6"
        >
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <span className="inline-flex items-center gap-2 text-green-950 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-ping inline-block shrink-0" />
                <span>Live Preview</span>
              </span>
              <h2 className="text-green-950 text-2xl font-black mt-1 font-sans">{currentPreview.title}</h2>
              <p className="text-stone-700 text-xs font-normal mt-0.5">{currentPreview.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3.5 py-1.5 bg-white border border-stone-200/50 rounded-full text-stone-500 text-xs font-semibold flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>Render Optimal</span>
              </span>
            </div>
          </div>

          {/* 1. Telemetry Indicator Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentPreview.metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <motion.div 
                  key={`${selectedType}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-2 border ${m.borderStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-stone-700 text-xs font-semibold">{m.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${m.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-green-950 text-3xl font-normal font-sans leading-none">{m.value}</span>
                    <span className="text-stone-500 text-sm font-semibold">{m.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    {m.trendType === "up" && (
                      <TrendingUp className="w-3.5 h-3.5 text-lime-800" />
                    )}
                    {m.trendType === "down" && (
                      <TrendingDown className="w-3.5 h-3.5 text-red-700" />
                    )}
                    {m.trendType === "warning" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF8900] inline-block shrink-0" />
                    )}
                    {m.trendType === "info" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0" />
                    )}
                    {m.trendType === "success" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold tracking-wide ${
                      m.trendType === "up" ? "text-lime-800" :
                      m.trendType === "down" ? "text-red-700" :
                      m.trendType === "warning" ? "text-[#FF8900]" :
                      "text-stone-500"
                    }`}>
                      {m.trend}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 2. Top Botanical Reserves Progress bars */}
          <div className="bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-stone-200/40 p-5 md:p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-green-950 text-lg font-bold font-sans">{currentPreview.reservesTitle}</h3>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">ALLOCATION STATUS</span>
            </div>

            <div className="space-y-4">
              {currentPreview.reserves.map((res, i) => {
                const percentage = Math.round((res.current / res.max) * 100);
                
                return (
                  <div key={`${selectedType}-${i}`} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={res.labelStyle}>{res.name}</span>
                      <span className="text-stone-500">
                        {res.current.toLocaleString()} {selectedType === "weekly" ? "days" : "kg"} / {res.max.toLocaleString()} {selectedType === "weekly" ? "days" : "kg"}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden relative shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${res.color}`} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. AI Copilot Summary Card */}
          <motion.div 
            key={selectedType}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-stone-50 rounded-xl outline outline-1 outline-lime-800/10 p-5 md:p-6 flex gap-4 relative overflow-hidden shadow-sm"
          >
            {/* Ambient background glow */}
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-[#BCF389]/10 rounded-full filter blur-xl shrink-0" />
            
            {/* Interactive Sparkling floating badge */}
            <div className="w-8 h-8 rounded-full bg-lime-800 flex items-center justify-center shrink-0 border border-lime-600/20 shadow-md">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <h4 className="text-green-950 text-sm font-black tracking-wide font-sans">Copilot Summary</h4>
              <p className="text-stone-700 text-xs font-normal leading-relaxed">
                {currentPreview.copilot}
              </p>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* ==================== ASSISTANT FAB ==================== */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg z-40 focus:outline-none cursor-pointer"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </motion.button>

      {/* ==================== LOADING OVERLAY SIMULATOR MODAL ==================== */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-center border border-lime-100"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-lime-100 border-t-lime-800 animate-spin" />
                <FileSpreadsheet className="w-6 h-6 text-lime-800 animate-pulse" />
              </div>

              <div>
                <h3 className="text-green-950 text-lg font-bold">Generating Report</h3>
                <p className="text-stone-500 text-xs font-semibold mt-1">Please wait while the system aggregates automated data.</p>
              </div>

              {/* Progress Bar inside modal */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lime-800 transition-all duration-300"
                  style={{ width: `${(generationStep / steps.length) * 100}%` }}
                />
              </div>

              {/* Step Logs transition */}
              <div className="min-h-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={generationStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-lime-800 text-xs font-bold font-sans"
                  >
                    {steps[generationStep] || "Finalizing process..."}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== SUCCESS COMPLETED MODAL ==================== */}
      <AnimatePresence>
        {generationSuccess && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-lime-100 flex flex-col"
            >
              {/* Top Banner decoration */}
              <div className="bg-lime-800/10 p-6 flex flex-col items-center justify-center text-center gap-2 border-b border-lime-800/20 relative">
                <div className="absolute right-4 top-4">
                  <button 
                    onClick={() => setGenerationSuccess(false)}
                    className="text-stone-500 hover:text-stone-900 text-xl font-bold bg-white/80 w-7 h-7 rounded-full shadow-sm flex items-center justify-center focus:outline-none"
                  >
                    ×
                  </button>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-lime-800 animate-bounce" />
                </div>
                <h3 className="text-green-950 text-xl font-bold font-sans mt-2">Report Ready!</h3>
                <p className="text-stone-700 text-xs font-semibold">Your custom configured operational report has been generated successfully.</p>
              </div>

              {/* Inner Details Content */}
              <div className="p-6 md:p-8 flex flex-col gap-6 text-left">
                {/* File Preview Mock Box */}
                <div className="border border-stone-200/60 rounded-xl p-4 bg-stone-50/50 flex gap-4 items-center">
                  <div className="w-12 h-16 rounded-md bg-[#2C742F]/10 flex flex-col items-center justify-center shrink-0 border border-[#2C742F]/20 relative overflow-hidden shadow-inner">
                    <span className="absolute top-0 left-0 w-full h-1 bg-lime-800" />
                    {selectedFormat === "pdf" ? (
                      <FileCheck2 className="w-6 h-6 text-lime-800" />
                    ) : (
                      <FileSpreadsheet className="w-6 h-6 text-lime-800" />
                    )}
                    <span className="text-[7px] uppercase font-bold mt-1.5 text-lime-800 tracking-wider">
                      {selectedFormat}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-green-950 text-sm font-bold truncate max-w-[280px]">
                      {currentPreview.title.replace(/\s+/g, '_')}_{startDate.replace(/-/g, '')}_{endDate.replace(/-/g, '')}.{selectedFormat}
                    </h4>
                    <p className="text-stone-500 text-xs font-semibold mt-1">
                      Size: {selectedFormat === "pdf" ? "342 KB" : "84 KB"} • Format: {selectedFormat.toUpperCase()} Document
                    </p>
                  </div>
                </div>

                {/* Checklist options */}
                <div className="space-y-2.5">
                  <h5 className="text-stone-700 text-[10px] font-bold tracking-wider uppercase">INCLUDED SECTIONS</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-green-950">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-lime-800 rounded-full" />
                      <span>Stock Quantities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-lime-800 rounded-full" />
                      <span>Copilot AI Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-lime-800 rounded-full" />
                      <span>Telemetry History</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-lime-800 rounded-full" />
                      <span>Quality Compliances</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => {
                      alert(`Downloading file: ${currentPreview.title.replace(/\s+/g, '_')}.${selectedFormat}`);
                      setGenerationSuccess(false);
                    }}
                    className="py-3 bg-[#00B207] hover:bg-[#2C742F] text-white rounded-full flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none focus:outline-none"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Copied link to clipboard for operational sharing!`);
                    }}
                    className="py-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-full flex items-center justify-center gap-2 font-bold hover:shadow-md active:scale-95 transition-all outline-none focus:outline-none"
                  >
                    <Share2 className="w-4 h-4 text-stone-500" />
                    <span>Share Report</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
