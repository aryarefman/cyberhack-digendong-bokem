"use client";

import { useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  Warehouse, 
  Snowflake,
  TrendingUp,
  Droplet,
  Leaf,
  Sprout,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  // Static mockup data matching visual specs exactly
  const stats = [
    {
      title: "Total active stock",
      value: "248",
      unit: "lots",
      changeText: "+12 this week",
      changeType: "growth",
      icon: Package,
      iconBg: "bg-emerald-100 text-[#2C742F] border border-[#2C742F]/10",
    },
    {
      title: "Nearing Expiry",
      value: "24",
      unit: "items",
      changeText: "within 30 days",
      changeType: "expiry",
      icon: AlertTriangle,
      iconBg: "bg-rose-100 text-[#EA4B48] border border-[#EA4B48]/10",
    },
    {
      title: "Warehouse Capacity",
      hasProgress: true,
      progress: 72,
      changeText: "135 empty slots remaining",
      changeType: "neutral",
      icon: Warehouse,
      iconBg: "bg-emerald-100 text-[#2C742F] border border-[#2C742F]/10",
    },
    {
      title: "Cold-Chain Alerts",
      value: "2",
      unit: "zones",
      changeText: "temperature anomaly detected in storage C",
      changeType: "danger",
      icon: Snowflake,
      iconBg: "bg-red-700 text-white shadow-sm",
    }
  ];

  const tableItems = [
    { material: "Patchouli Oil",        lot: "LOT-PO-230526", daysLeft: "5 days left",   daysColor: "text-[#EA4B48] font-bold",   status: "Critical", statusStyle: "bg-rose-100 text-[#EA4B48] border-rose-200/40",    icon: Droplet, iconBg: "bg-lime-200 text-[#2C742F]" },
    { material: "Vetiver Extract",       lot: "LOT-VE-230610", daysLeft: "14 days left",  daysColor: "text-amber-500 font-medium", status: "Warning",  statusStyle: "bg-amber-100 text-amber-600 border-amber-200/40",  icon: Sprout,  iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Bergamot Essential",    lot: "LOT-BE-230701", daysLeft: "28 days left",  daysColor: "text-stone-500 font-medium", status: "Monitor",  statusStyle: "bg-stone-100 text-stone-500 border-stone-200/40",  icon: Leaf,    iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Lavender Angustifolia", lot: "LOT-LA-230815", daysLeft: "6 days left",   daysColor: "text-[#EA4B48] font-bold",   status: "Critical", statusStyle: "bg-rose-100 text-[#EA4B48] border-rose-200/40",    icon: Leaf,    iconBg: "bg-lime-200 text-[#2C742F]" },
    { material: "Eucalyptus Globulus",   lot: "LOT-EG-231002", daysLeft: "9 days left",   daysColor: "text-[#EA4B48] font-bold",   status: "Critical", statusStyle: "bg-rose-100 text-[#EA4B48] border-rose-200/40",    icon: Sprout,  iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Ylang Ylang Oil",       lot: "LOT-YY-231105", daysLeft: "13 days left",  daysColor: "text-amber-500 font-medium", status: "Warning",  statusStyle: "bg-amber-100 text-amber-600 border-amber-200/40",  icon: Droplet, iconBg: "bg-lime-200 text-[#2C742F]" },
    { material: "Clove Bud Extract",     lot: "LOT-CB-231120", daysLeft: "18 days left",  daysColor: "text-amber-500 font-medium", status: "Warning",  statusStyle: "bg-amber-100 text-amber-600 border-amber-200/40",  icon: Leaf,    iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Sandalwood Base",       lot: "LOT-SB-231201", daysLeft: "22 days left",  daysColor: "text-stone-500 font-medium", status: "Monitor",  statusStyle: "bg-stone-100 text-stone-500 border-stone-200/40",  icon: Sprout,  iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Jasmine Absolute",      lot: "LOT-JA-231215", daysLeft: "25 days left",  daysColor: "text-stone-500 font-medium", status: "Monitor",  statusStyle: "bg-stone-100 text-stone-500 border-stone-200/40",  icon: Droplet, iconBg: "bg-lime-200 text-[#2C742F]" },
    { material: "Cedarwood Virginia",    lot: "LOT-CV-231220", daysLeft: "27 days left",  daysColor: "text-stone-500 font-medium", status: "Monitor",  statusStyle: "bg-stone-100 text-stone-500 border-stone-200/40",  icon: Leaf,    iconBg: "bg-emerald-100 text-[#2C742F]" },
    { material: "Rose Otto Bulgaria",    lot: "LOT-RO-231228", daysLeft: "29 days left",  daysColor: "text-stone-500 font-medium", status: "Monitor",  statusStyle: "bg-stone-100 text-stone-500 border-stone-200/40",  icon: Droplet, iconBg: "bg-lime-200 text-[#2C742F]" },
  ];

  const activities = [
    {
      time: "09:42",
      user: "Operator Budi",
      action: "Added 200kg Patchouli Oil to Slot B-04."
    },
    {
      time: "08:15",
      user: "QC Staff Sari",
      action: "Approved Vanillin batch."
    },
    {
      time: "08:00",
      user: "Operator Budi",
      action: "Added 100kg Patchouli Oil to Slot B-03."
    },
    {
      time: "07:45",
      user: "QC Staff Sari",
      action: "Approved Vanillin batch."
    }
  ];

  return (
    <div className="space-y-8 pb-16 text-left">
      
      {/* Welcome & Page Title Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">Dashboard</h2>
      </div>

      {/* 1. Core Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.08 }}
              className="bg-[#F5FBF3] rounded-2xl p-5 flex flex-col justify-between shadow-[6px_6px_54px_rgba(0,0,0,0.04)] h-40 relative group hover:scale-[1.01] transition-transform duration-200"
            >
              {/* Card Title & Icon */}
              <div className="flex items-start justify-between w-full">
                <span className="text-[#1C1B1F]/70 text-sm font-light leading-none">{stat.title}</span>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Card Value or Progress */}
              <div className="my-auto flex items-baseline gap-1.5">
                {stat.hasProgress ? (
                  <div className="w-full pr-4 mt-2">
                    <div className="w-full h-2 bg-[#AAE970]/30 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2C742F] rounded-full" style={{ width: `${stat.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-[#1C1B1F] text-3xl font-normal tracking-tight font-sans leading-none">{stat.value}</span>
                    <span className="text-black/40 text-xl font-light leading-none">{stat.unit}</span>
                  </>
                )}
              </div>

              {/* Card Footnote */}
              <div className="w-full flex items-center gap-1.5">
                {stat.changeType === "growth" && (
                  <div className="flex items-center gap-1 text-[#00B69B] font-semibold text-sm">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stat.changeText}</span>
                  </div>
                )}
                {stat.changeType === "expiry" && (
                  <div className="flex items-center gap-1 text-[#EA4B48] font-semibold text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{stat.changeText}</span>
                  </div>
                )}
                {stat.changeType === "danger" && (
                  <span className="text-[#EA4B48] text-xs font-semibold leading-tight pr-6">
                    {stat.changeText}
                  </span>
                )}
                {stat.changeType === "neutral" && (
                  <span className="text-stone-500 text-sm font-normal leading-tight">
                    {stat.changeText}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Grid for Table & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Items Requiring Immediate Use (Table Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.32 }}
          className="bg-[#F5FBF3] rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#AAE970]/10 lg:col-span-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#AAE970]/10 flex items-center justify-between">
            <h3 className="text-[#2C742F] text-xl font-bold font-sans leading-tight">Items Requiring Immediate Use</h3>
            <button
              onClick={() => setViewAllOpen(true)}
              className="text-[#2C742F] hover:text-[#2C742F]/70 text-sm font-semibold transition-colors underline underline-offset-2"
            >
              View All
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-[#AAE970]/10 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Material</th>
                  <th className="px-6 py-3.5">Lot Number</th>
                  <th className="px-6 py-3.5">Days Left</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AAE970]/10">
                {tableItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.lot} className="hover:bg-stone-50/30 transition-colors">
                      {/* Material Name & Icon */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[#1C1B1F] text-sm font-semibold">{item.material}</span>
                      </td>
                      {/* Lot Number */}
                      <td className="px-6 py-4 text-[#2C742F] text-sm font-medium">
                        {item.lot}
                      </td>
                      {/* Days Left */}
                      <td className={`px-6 py-4 text-sm ${item.daysColor}`}>
                        {item.daysLeft}
                      </td>
                      {/* Status Badge */}
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-normal leading-4 ${item.statusStyle}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Side: Recent Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="bg-[#F5FBF3] rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-[#AAE970]/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#AAE970]/10">
            <h3 className="text-[#2C742F] text-xl font-bold font-sans leading-tight">Recent Activity</h3>
          </div>

          <div className="px-8 py-6">
            <div className="relative border-l-2 border-[#AAE970]/40 pl-6 space-y-7 pb-2 text-left">
              {activities.map((act, index) => (
                <div key={index} className="relative space-y-1">
                  
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center border-2 border-[#2C742F]">
                    <div className="w-2 h-2 rounded-full bg-[#2C742F]" />
                  </div>

                  {/* Header Row */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-stone-500">{act.time}</span>
                    <span className="text-[#2C742F] font-bold">{act.user}</span>
                  </div>

                  {/* Description */}
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {/* Add span formatting dynamically for bold text */}
                    {act.action.includes("Added") ? (
                      <>
                        <span>Added </span>
                        <span className="text-[#2C742F] font-semibold">{act.action.substring(6, act.action.indexOf("to"))}</span>
                        <span> to {act.action.substring(act.action.indexOf("to") + 3)}</span>
                      </>
                    ) : (
                      act.action
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3. Floating Assistant Bubble FAB */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 z-40 focus:outline-none"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </button>

      {/* ── View All Modal ── */}
      <AnimatePresence>
        {viewAllOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewAllOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-2xl bg-[#F5FBF3] rounded-2xl shadow-2xl border border-lime-300/40 overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-[#2C742F]/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1C1B1F]">Items Requiring Immediate Use</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{tableItems.length} items expiring within 30 days</p>
                  </div>
                  <button
                    onClick={() => setViewAllOpen(false)}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-600" />
                  </button>
                </div>

                {/* Scrollable List */}
                <div className="overflow-y-auto max-h-[420px] divide-y divide-[#2C742F]/[0.08]" style={{ scrollbarWidth: 'thin' }}>
                  {tableItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.lot}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-[#2C742F]/[0.03] transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1C1B1F]">{item.material}</p>
                          <p className="text-xs text-[#2C742F] font-medium mt-0.5">{item.lot}</p>
                        </div>
                        <div className={`text-sm ${item.daysColor} shrink-0`}>{item.daysLeft}</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-semibold shrink-0 ${item.statusStyle}`}>
                          {item.status}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t border-[#2C742F]/10 flex justify-end">
                  <button
                    onClick={() => setViewAllOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#2C742F] hover:bg-[#235a26] text-white text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
