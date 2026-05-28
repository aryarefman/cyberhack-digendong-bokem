"use client";

import { useState } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Droplet, 
  Sprout, 
  Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FifoExpiryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSort, setSelectedSort] = useState("urgency-asc");
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    { value: "urgency-asc", label: "Urgency (High-Low)" },
    { value: "urgency-desc", label: "Urgency (Low-High)" },
    { value: "intake-desc", label: "Intake Date (Newest)" },
    { value: "intake-asc", label: "Intake Date (Oldest)" },
    { value: "name-asc", label: "Alphabetical (A-Z)" }
  ];

  const initialItems = [
    {
      id: "1",
      material: "Patchouli Oil (Aged)",
      lot: "LOT-PO-230526",
      intakeDate: "Oct 12, 2023",
      location: "Zone A-03",
      status: "Critical",
      daysLeft: 5,
      daysText: "5 Days Left",
      actionText: "Action Required",
      progress: 90,
      progressColor: "bg-[#BA1A1A]",
      daysColor: "text-red-700",
      badgeStyle: "bg-rose-200/50 text-red-800 border-red-700/20",
      dotBg: "bg-red-700",
      icon: Droplet,
      iconBg: "bg-rose-200 text-red-800"
    },
    {
      id: "2",
      material: "Lavender Extract Base",
      lot: "LOT-LE-230810",
      intakeDate: "Nov 05, 2023",
      location: "Zone B-12",
      status: "Monitor",
      daysLeft: 14,
      daysText: "14 Days Left",
      actionText: "Scheduled Use",
      progress: 80,
      progressColor: "bg-black",
      daysColor: "text-zinc-950",
      badgeStyle: "bg-stone-100 text-stone-500 border-stone-500/30",
      dotBg: "bg-neutral-950",
      icon: Sprout,
      iconBg: "bg-green-200 text-lime-800"
    },
    {
      id: "3",
      material: "Bergamot Rind (Cold Press)",
      lot: "LOT-BR-240102",
      intakeDate: "Jan 15, 2024",
      location: "Zone C-05",
      status: "Optimal",
      daysLeft: 60,
      daysText: "60+ Days Left",
      actionText: "Stable",
      progress: 30,
      progressColor: "bg-[#BCF389]",
      daysColor: "text-lime-800",
      badgeStyle: "bg-green-100/20 text-lime-800 border-lime-800/20",
      dotBg: "bg-lime-500",
      icon: Leaf,
      iconBg: "bg-green-100 text-lime-800"
    },
    {
      id: "4",
      material: "Jasmine Absolute",
      lot: "LOT-JA-240218",
      intakeDate: "Feb 18, 2024",
      location: "Zone D-02",
      status: "Optimal",
      daysLeft: 120,
      daysText: "120+ Days Left",
      actionText: "Stable",
      progress: 10,
      progressColor: "bg-[#BCF389]",
      daysColor: "text-lime-800",
      badgeStyle: "bg-green-100/20 text-lime-800 border-lime-800/20",
      dotBg: "bg-lime-500",
      icon: Sprout,
      iconBg: "bg-green-100 text-lime-800"
    },
    {
      id: "5",
      material: "Sumatran Vetiver Oil",
      lot: "LOT-VO-230915",
      intakeDate: "Sep 15, 2023",
      location: "Zone A-11",
      status: "Critical",
      daysLeft: 8,
      daysText: "8 Days Left",
      actionText: "Action Required",
      progress: 85,
      progressColor: "bg-[#BA1A1A]",
      daysColor: "text-red-700",
      badgeStyle: "bg-rose-200/50 text-red-800 border-red-700/20",
      dotBg: "bg-red-700",
      icon: Droplet,
      iconBg: "bg-rose-200 text-red-800"
    },
    {
      id: "6",
      material: "Ylang Ylang Premium",
      lot: "LOT-YY-231120",
      intakeDate: "Nov 20, 2023",
      location: "Zone B-04",
      status: "Monitor",
      daysLeft: 25,
      daysText: "25 Days Left",
      actionText: "Scheduled Use",
      progress: 65,
      progressColor: "bg-black",
      daysColor: "text-zinc-950",
      badgeStyle: "bg-stone-100 text-stone-500 border-stone-500/30",
      dotBg: "bg-neutral-950",
      icon: Leaf,
      iconBg: "bg-green-200 text-lime-800"
    },
    {
      id: "7",
      material: "Sulawesi Clove Bud",
      lot: "LOT-CB-240110",
      intakeDate: "Jan 10, 2024",
      location: "Zone A-15",
      status: "Optimal",
      daysLeft: 75,
      daysText: "75+ Days Left",
      actionText: "Stable",
      progress: 25,
      progressColor: "bg-[#BCF389]",
      daysColor: "text-lime-800",
      badgeStyle: "bg-green-100/20 text-lime-800 border-lime-800/20",
      dotBg: "bg-lime-500",
      icon: Sprout,
      iconBg: "bg-green-100 text-lime-800"
    },
    {
      id: "8",
      material: "Eucalyptus Globulus",
      lot: "LOT-EG-240201",
      intakeDate: "Feb 01, 2024",
      location: "Zone C-02",
      status: "Optimal",
      daysLeft: 90,
      daysText: "90+ Days Left",
      actionText: "Stable",
      progress: 20,
      progressColor: "bg-[#BCF389]",
      daysColor: "text-lime-800",
      badgeStyle: "bg-green-100/20 text-lime-800 border-lime-800/20",
      dotBg: "bg-lime-500",
      icon: Leaf,
      iconBg: "bg-green-100 text-lime-800"
    },
    {
      id: "9",
      material: "Organic Vanilla Extract",
      lot: "LOT-VE-231205",
      intakeDate: "Dec 05, 2023",
      location: "Zone C-08",
      status: "Monitor",
      daysLeft: 30,
      daysText: "30 Days Left",
      actionText: "Scheduled Use",
      progress: 55,
      progressColor: "bg-black",
      daysColor: "text-zinc-950",
      badgeStyle: "bg-stone-100 text-stone-500 border-stone-500/30",
      dotBg: "bg-neutral-950",
      icon: Droplet,
      iconBg: "bg-green-200 text-lime-800"
    },
    {
      id: "10",
      material: "Sweet Orange Peel",
      lot: "LOT-OP-240301",
      intakeDate: "Mar 01, 2024",
      location: "Zone B-08",
      status: "Optimal",
      daysLeft: 150,
      daysText: "150+ Days Left",
      actionText: "Stable",
      progress: 5,
      progressColor: "bg-[#BCF389]",
      daysColor: "text-lime-800",
      badgeStyle: "bg-green-100/20 text-lime-800 border-lime-800/20",
      dotBg: "bg-lime-500",
      icon: Sprout,
      iconBg: "bg-green-100 text-lime-800"
    }
  ];

  const filteredItems = initialItems.filter(item => {
    const matchesSearch = item.material.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.lot.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (selectedSort === "urgency-asc") {
      return a.daysLeft - b.daysLeft;
    }
    if (selectedSort === "urgency-desc") {
      return b.daysLeft - a.daysLeft;
    }
    if (selectedSort === "intake-desc") {
      return new Date(b.intakeDate).getTime() - new Date(a.intakeDate).getTime();
    }
    if (selectedSort === "intake-asc") {
      return new Date(a.intakeDate).getTime() - new Date(b.intakeDate).getTime();
    }
    if (selectedSort === "name-asc") {
      return a.material.localeCompare(b.material);
    }
    return 0;
  });

  return (
    <div className="space-y-8 pb-16 text-left relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(44, 116, 47, 0.12);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(44, 116, 47, 0.25);
        }
      `}} />
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">FIFO &amp; Expiry</h2>
      </div>

      {/* Main Container Card - styled with #F5FBF3 and dynamic entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full bg-[#F5FBF3] rounded-xl shadow-[0px_4px_12px_rgba(143,177,87,0.05)] border border-lime-400/20 overflow-hidden flex flex-col justify-start items-start"
      >
        
        {/* Controls Header Row */}
        <div className="w-full px-5 py-4 border-b border-[#2C742F]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Left Controls: Search & Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search inputs */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search lots, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-stone-300/60 focus:border-brand-sage-green focus:outline-none text-sm text-[#1C1B1F] placeholder:text-stone-500/70"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="px-3.5 py-2 rounded-lg border border-stone-300/60 bg-white flex items-center gap-2 text-stone-700 hover:bg-stone-50 active:scale-95 transition-all text-sm font-semibold focus:outline-none"
              >
                <SlidersHorizontal className="w-4 h-4 text-stone-700" />
                <span>Filter</span>
              </button>

              <AnimatePresence>
                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-20 p-2 space-y-1"
                    >
                      {["All", "Critical", "Monitor", "Optimal"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                            selectedStatus === status 
                              ? "bg-[#2C742F]/10 text-[#2C742F]" 
                              : "text-[#1C1B1F] hover:bg-stone-50"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Controls: Sort Indicator & Dropdown */}
          <div className="flex items-center gap-2 relative">
            <span className="text-stone-700 text-sm font-semibold">Sort by:</span>
            <button 
              onClick={() => setSortOpen(!sortOpen)}
              className="px-3 py-1.5 bg-[#2C742F]/10 hover:bg-[#2C742F]/15 rounded-md flex items-center gap-1.5 text-[#2C742F] text-xs font-bold cursor-pointer transition-all active:scale-95 outline-none focus:outline-none"
            >
              <span>{sortOptions.find(opt => opt.value === selectedSort)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2C742F]" />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-20 p-2 space-y-1 text-left"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedSort(opt.value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                          selectedSort === opt.value 
                            ? "bg-[#2C742F]/10 text-[#2C742F]" 
                            : "text-[#1C1B1F] hover:bg-stone-50"
                        }`}
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

        {/* Data Table Wrapper with scroll - max height set to 500px to accommodate 10 items beautifully */}
        <div className="w-full overflow-y-auto max-h-[500px] border-b border-[#2C742F]/10 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#2C742F]/5 border-b border-[#2C742F]/10 text-stone-700 text-sm font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-60 sticky top-0 bg-[#F5FBF3] z-10">Material &amp; Lot</th>
                <th className="px-6 py-4 w-40 sticky top-0 bg-[#F5FBF3] z-10">Intake Date</th>
                <th className="px-6 py-4 w-40 sticky top-0 bg-[#F5FBF3] z-10">Location Slot</th>
                <th className="px-6 py-4 w-40 sticky top-0 bg-[#F5FBF3] z-10">Status</th>
                <th className="px-6 py-4 w-64 sticky top-0 bg-[#F5FBF3] z-10">Expiry Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C742F]/10">
              {sortedItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: idx * 0.05 }}
                    className="hover:bg-white/40 transition-colors"
                  >
                    {/* Material & Lot with spacious vertical py-6 padding */}
                    <td className="px-6 py-6 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[#2C742F]/10 ${item.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-green-950 text-sm font-bold">{item.material}</span>
                        <span className="text-stone-500 text-[11px] font-semibold tracking-wide">{item.lot}</span>
                      </div>
                    </td>

                    {/* Intake Date with spacious py-6 */}
                    <td className="px-6 py-6 text-stone-700 text-sm font-semibold">
                      {item.intakeDate}
                    </td>

                    {/* Location Slot with spacious py-6 */}
                    <td className="px-6 py-6">
                      <span className="px-2.5 py-1 bg-emerald-100/30 rounded border border-lime-400/20 text-stone-700 text-xs font-semibold">
                        {item.location}
                      </span>
                    </td>

                    {/* Status Badge with spacious py-6 */}
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${item.badgeStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dotBg}`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Expiry Timeline progress with spacious py-6 */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-center text-[10px] font-semibold">
                          <span className={`${item.daysColor}`}>{item.daysText}</span>
                          <span className="text-stone-500">{item.actionText}</span>
                        </div>
                        <div className="w-full h-2 bg-[#AAE970]/20 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.progressColor}`} style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}

              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-stone-500 font-semibold text-sm">
                    No matching lots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Row - styled to integrate beautifully with F5FBF3 bg */}
        <div className="w-full px-5 py-4 border-t border-[#2C742F]/10 flex justify-between items-center text-left">
          <div className="text-stone-700 text-xs font-semibold">
            Showing 1 to {sortedItems.length} of {initialItems.length} entries
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Prev button */}
            <button className="w-8 h-8 rounded border border-stone-200/60 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Pages */}
            <button className="w-8 h-8 rounded bg-[#2C742F] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 rounded bg-white border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 text-xs font-semibold transition-all">
              2
            </button>
            <button className="w-8 h-8 rounded bg-white border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 text-xs font-semibold transition-all">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-stone-700 text-xs font-semibold">
              ...
            </span>
            {/* Next button */}
            <button className="w-8 h-8 rounded border border-stone-200/60 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-all active:scale-95">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </motion.div>

      {/* Floating Assistant FAB */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 z-40 focus:outline-none"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </button>

    </div>
  );
}
