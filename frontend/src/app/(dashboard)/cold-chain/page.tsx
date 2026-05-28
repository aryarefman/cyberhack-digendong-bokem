"use client";

import { useState } from "react";
import { 
  Check, 
  AlertTriangle, 
  Info, 
  Droplet, 
  TrendingUp, 
  Thermometer,
  X,
  ShieldAlert,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ColdChainPage() {
  const [activeModalZone, setActiveModalZone] = useState<any>(null);

  const initialZones = [
    {
      id: "a1",
      title: "Zone A",
      subtitle: "RAW MATERIAL STORAGE",
      status: "Stable",
      statusStyle: "bg-green-100/30 text-lime-800 border-lime-800/10",
      dotBg: "bg-lime-300",
      icon: Check,
      iconBg: "bg-lime-300 text-[#2C742F]",
      temp: "-18°C",
      tempColor: "text-blue-500",
      targetRange: "-15°C to -22°C",
      humidity: "42%",
      buttonText: "Details",
      buttonBg: "bg-[#2C742F] hover:bg-[#2C742F]/90 text-white",
      sparkline: [
        { height: "h-6", active: false },
        { height: "h-7", active: false },
        { height: "h-6", active: false },
        { height: "h-8", active: false },
        { height: "h-7", active: false },
        { height: "h-8 bg-lime-800/20 border-t-2 border-lime-800", active: true }
      ],
      alertText: "Humidity: 42%",
      alertIcon: Droplet,
      alertIconColor: "text-stone-700",
      detailsDescription: "AC cooling units are operating at optimal load. Compressor cycle stable. No anomalous fluctuations recorded in the past 24 hours. Automated vent purge runs every 6 hours."
    },
    {
      id: "b1",
      title: "Zone B",
      subtitle: "DISTILLATION PER-STAGE",
      status: "Critical",
      statusStyle: "bg-rose-200 text-red-800 border-red-700/20",
      dotBg: "bg-red-700",
      icon: AlertTriangle,
      iconBg: "bg-red-700 text-white shadow-sm",
      temp: "-2°C",
      tempColor: "text-red-800",
      targetRange: "-4°C to -20°C",
      humidity: "58%",
      buttonText: "Take Action",
      buttonBg: "bg-red-700 hover:bg-red-800 text-white shadow-md",
      sparkline: [
        { height: "h-5", active: false },
        { height: "h-6", active: false },
        { height: "h-7", active: false },
        { height: "h-10 bg-amber-400/20", active: false },
        { height: "h-12 bg-red-700/20", active: false },
        { height: "h-16 bg-red-700/80 border-t-2 border-red-700", active: true }
      ],
      alertText: "Temp Rising",
      alertIcon: TrendingUp,
      alertIconColor: "text-red-700",
      detailsDescription: "CRITICAL DEVANCE DETECTED! Temperature has spiked to -2°C, which is above the target range (-4°C to -20°C). Recommendation: trigger climate purge override or expedite technicians immediately."
    },
    {
      id: "c1",
      title: "Zone C",
      subtitle: "FINAL PRODUCT VAULT",
      status: "Warning",
      statusStyle: "bg-amber-400/10 text-green-950 border-amber-400/30",
      dotBg: "bg-amber-400",
      icon: Info,
      iconBg: "bg-amber-400 text-green-950",
      temp: "-5°C",
      tempColor: "text-green-950",
      targetRange: "-8°C to -12°C",
      humidity: "38%",
      buttonText: "Details",
      buttonBg: "bg-amber-500 hover:bg-amber-600 text-white",
      sparkline: [
        { height: "h-8", active: false },
        { height: "h-8", active: false },
        { height: "h-8", active: false },
        { height: "h-10 bg-amber-400/30", active: false },
        { height: "h-12 bg-[#FF8900]/20", active: false },
        { height: "h-11 bg-amber-400/80 border-t-2 border-amber-400", active: true }
      ],
      alertText: "Humidity: 38%",
      alertIcon: Droplet,
      alertIconColor: "text-stone-700",
      detailsDescription: "Atmospheric logs show temperature approaching the boundary margin. HVAC team has been notified. Checking staged fan speeds at 20:00 to re-establish optimal microclimate stabilization."
    }
  ];

  // Double the list to make 6 cards total exactly matching mockup grid columns
  const zones = [...initialZones, ...initialZones.map(z => ({ ...z, id: z.id + "_2" }))];

  return (
    <div className="space-y-8 pb-16 text-left relative">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">Cold-Chain Monitor</h2>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone, idx) => {
          const Icon = zone.icon;
          const AlertIcon = zone.alertIcon;
          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.08 }}
              className="bg-[#F5FBF3] rounded-3xl p-6 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-[#2C742F]/10 flex flex-col justify-between items-start h-[360px] relative group hover:scale-[1.01] transition-transform duration-200"
            >
              {/* Header: Title & Info */}
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${zone.iconBg}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-neutral-800 text-lg font-bold font-sans leading-none">{zone.title}</span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${zone.statusStyle}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${zone.dotBg}`} />
                  {zone.status}
                </span>
              </div>

              {/* Subtitle */}
              <div className="text-left w-full mt-2">
                <span className="text-neutral-800 text-[10px] font-bold tracking-wider block opacity-70">
                  {zone.subtitle}
                </span>
              </div>

              {/* Temperature block */}
              <div className="flex justify-between items-end w-full mt-3">
                <span className={`${zone.tempColor} text-5xl font-extrabold font-sans leading-none shrink-0`}>
                  {zone.temp}
                </span>
                <div className="flex flex-col items-end text-right">
                  <span className="text-neutral-800 text-[10px] font-bold leading-none opacity-50">Target Range</span>
                  <span className="text-zinc-500 text-sm font-bold tracking-wide mt-1 block">{zone.targetRange}</span>
                </div>
              </div>

              {/* Sparkline Bar Graph Chart */}
              <div className="w-full flex items-end gap-1.5 h-16 mt-8 pt-2 border-b border-[#2C742F]/10">
                {zone.sparkline.map((bar, barIdx) => (
                  <div 
                    key={barIdx} 
                    className={`flex-1 ${bar.height} rounded-t-sm transition-all duration-300 ${
                      bar.active 
                        ? "" 
                        : "bg-emerald-100/60"
                    }`}
                  >
                    {/* Active bar color/stroke rendering inside wrapper */}
                    {bar.height.includes("bg-") ? null : (
                      <div className="w-full h-full bg-emerald-100 rounded-t-sm" />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Section */}
              <div className="w-full pt-4 mt-auto flex justify-between items-center border-t border-stone-200/10">
                {/* Left Alert Info */}
                <div className="flex items-center gap-1.5">
                  <AlertIcon className={`w-4.5 h-4.5 shrink-0 ${zone.alertIconColor}`} />
                  <span className={`text-xs font-semibold ${zone.alertIconColor}`}>{zone.alertText}</span>
                </div>

                {/* Details / Action Button */}
                <button 
                  onClick={() => setActiveModalZone(zone)}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all shadow-sm ${zone.buttonBg}`}
                >
                  {zone.buttonText}
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Popup Modal for Details & Take Action */}
      <AnimatePresence>
        {activeModalZone && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-stone-200/50 shadow-2xl relative text-left"
            >
              {/* Absolute Close Button */}
              <button 
                onClick={() => setActiveModalZone(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full w-8 h-8 flex items-center justify-center transition-all focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeModalZone.iconBg}`}>
                  <Thermometer className="w-6 h-6" />
                </div>
                <div className="pr-8">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">TELEMETRY ARCHIVE</span>
                  <h3 className="text-xl font-bold text-[#2C742F] font-sans mt-0.5">{activeModalZone.title} - Cold-Chain</h3>
                  <span className="text-stone-500 text-xs font-semibold block mt-0.5">{activeModalZone.subtitle}</span>
                </div>
              </div>

              {/* Telemetry Status Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-[#F5FBF3] border border-[#2C742F]/10 flex flex-col items-center text-center">
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block leading-none">CURRENT TEMP</span>
                  <span className={`text-2xl font-black ${activeModalZone.tempColor} mt-2`}>{activeModalZone.temp}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5FBF3] border border-[#2C742F]/10 flex flex-col items-center text-center">
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block leading-none">TARGET BOUNDS</span>
                  <span className="text-sm font-bold text-stone-700 mt-3">{activeModalZone.targetRange}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-5">
                {activeModalZone.status === "Critical" ? (
                  <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-600 animate-bounce" />
                    <div>
                      <span className="font-bold block">Action Override Required</span>
                      <span className="opacity-90 mt-0.5 block">Zone has broken standard bounds! Compressor purge required immediately.</span>
                    </div>
                  </div>
                ) : activeModalZone.status === "Warning" ? (
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <span className="font-bold block">Marginal Fluctuations Logged</span>
                      <span className="opacity-90 mt-0.5 block">HVAC airflow stage checklist scheduled for next system cycle.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-lime-200 bg-lime-50/50 text-xs text-lime-800 flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 text-lime-700 animate-pulse" />
                    <div>
                      <span className="font-bold block">Environmental Balance Stable</span>
                      <span className="opacity-90 mt-0.5 block">Zone temperature holds an excellent cooling lock factor.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Logs */}
              <div className="mt-5 space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">OPERATIONAL LOGS</span>
                <p className="text-stone-700 text-xs leading-relaxed font-normal bg-stone-50 border border-stone-200/40 p-3 rounded-xl">
                  {activeModalZone.detailsDescription}
                </p>
              </div>

              {/* Modal Control Actions */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex gap-3">
                <button 
                  onClick={() => setActiveModalZone(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-bold text-xs active:scale-95 transition-all focus:outline-none"
                >
                  Dismiss Panel
                </button>
                {activeModalZone.status === "Critical" ? (
                  <button 
                    onClick={() => {
                      alert("Purge HVAC Ventilation Cycle initiated successfully!");
                      setActiveModalZone(null);
                    }}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-full font-bold text-xs active:scale-95 transition-all shadow-md focus:outline-none"
                  >
                    Force Air Purge
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      alert("HVAC Telemetry assessment logged to system database.");
                      setActiveModalZone(null);
                    }}
                    className="flex-1 py-2.5 bg-[#2C742F] hover:bg-[#2C742F]/90 text-white rounded-full font-bold text-xs active:scale-95 transition-all shadow-md focus:outline-none"
                  >
                    Acknowledge
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Support FAB */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 z-40 focus:outline-none"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </button>

    </div>
  );
}
