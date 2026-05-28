"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  User as UserIcon,
  ShieldAlert,
  Server,
  Monitor,
  Search,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditLogItem {
  id: string;
  date: string;
  time: string;
  actorName: string;
  actorRole: "PPIC" | "QC" | "SYSTEM" | "ADMIN" | "WAREHOUSE_STAFF";
  actorAvatar?: string;
  statementPrefix: string;
  statementContent: string;
  statementType: "stock" | "status" | "login_fail" | "config" | "system";
  ipAddress: string;
  deviceId: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Dropdown states
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const SEED_AUDIT_LOGS: AuditLogItem[] = [
    {
      id: "log-1",
      date: "May 27, 2026",
      time: "09:42 WIB",
      actorName: "Sarah Chen",
      actorRole: "PPIC",
      actorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Authorized stock addition:",
      statementContent: " 200kg Patchouli Oil (Batch #PA-2605-A) to Warehouse Zone B.",
      statementType: "stock",
      ipAddress: "192.168.1.45",
      deviceId: "DEV-8921..."
    },
    {
      id: "log-2",
      date: "May 27, 2026",
      time: "08:15 WIB",
      actorName: "Marcus D.",
      actorRole: "QC",
      actorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Status update:",
      statementContent: " Flagged Batch #LV-2604-C for manual viscosity review.",
      statementType: "status",
      ipAddress: "10.0.4.22",
      deviceId: "TAB-QC-04"
    },
    {
      id: "log-3",
      date: "May 26, 2026",
      time: "23:59 WIB",
      actorName: "System Auto",
      actorRole: "SYSTEM",
      statementPrefix: "Failed Login Attempt:",
      statementContent: " Multiple incorrect credentials supplied for user 'Admin'.",
      statementType: "login_fail",
      ipAddress: "203.0.113.45",
      deviceId: "UNKNOWN"
    },
    {
      id: "log-4",
      date: "May 26, 2026",
      time: "14:20 WIB",
      actorName: "John Doe",
      actorRole: "ADMIN",
      actorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Configuration Changed:",
      statementContent: " Updated threshold for Temperature Sensor TS-104 from 85°C to 88°C.",
      statementType: "config",
      ipAddress: "192.168.1.10",
      deviceId: "WS-ADM-01"
    },
    {
      id: "log-5",
      date: "May 26, 2026",
      time: "10:30 WIB",
      actorName: "Clara Amalia",
      actorRole: "QC",
      actorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Authorized quality release:",
      statementContent: " Approved Batch #VTV-Java-01 for bottling distillation.",
      statementType: "status",
      ipAddress: "10.0.4.15",
      deviceId: "TAB-QC-02"
    },
    {
      id: "log-6",
      date: "May 25, 2026",
      time: "16:45 WIB",
      actorName: "Budi Santoso",
      actorRole: "WAREHOUSE_STAFF",
      actorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Stock addition:",
      statementContent: " Relocated 120kg Cinnamon Bark from Zone B to Zone A dry vault.",
      statementType: "stock",
      ipAddress: "192.168.1.28",
      deviceId: "WSH-TAB-02"
    },
    {
      id: "log-7",
      date: "May 25, 2026",
      time: "09:15 WIB",
      actorName: "Sarah Chen",
      actorRole: "PPIC",
      actorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      statementPrefix: "Authorized stock addition:",
      statementContent: " 50L Vetiver Oil (Batch #VT-2605-B) to Warehouse Zone A.",
      statementType: "stock",
      ipAddress: "192.168.1.45",
      deviceId: "DEV-8921..."
    },
    {
      id: "log-8",
      date: "May 24, 2026",
      time: "21:00 WIB",
      actorName: "System Auto",
      actorRole: "SYSTEM",
      statementPrefix: "Scheduled Backup:",
      statementContent: " Completed daily server state and database backup successfully.",
      statementType: "system",
      ipAddress: "127.0.0.1",
      deviceId: "SYSTEM-CRON"
    }
  ];

  useEffect(() => {
    setLogs(SEED_AUDIT_LOGS);
  }, []);

  const handleResetFilters = () => {
    setSelectedRole("All Roles");
    setSelectedAction("All Actions");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filter logs logic
  const filteredLogs = logs.filter(log => {
    // Role filter
    const matchesRole = selectedRole === "All Roles" || log.actorRole === selectedRole;
    
    // Action Type filter
    let matchesAction = true;
    if (selectedAction !== "All Actions") {
      if (selectedAction === "Stock Addition") {
        matchesAction = log.statementType === "stock";
      } else if (selectedAction === "Status Update") {
        matchesAction = log.statementType === "status";
      } else if (selectedAction === "Login Attempt") {
        matchesAction = log.statementType === "login_fail";
      } else if (selectedAction === "Configuration Change") {
        matchesAction = log.statementType === "config";
      } else if (selectedAction === "System Task") {
        matchesAction = log.statementType === "system";
      }
    }

    // Date range filter
    let matchesDate = true;
    if (startDate) {
      const logDateTime = new Date(log.date).getTime();
      const startDateTime = new Date(startDate).getTime();
      if (!isNaN(logDateTime) && !isNaN(startDateTime)) {
        matchesDate = matchesDate && logDateTime >= startDateTime;
      }
    }
    if (endDate) {
      const logDateTime = new Date(log.date).getTime();
      const endDateTime = new Date(endDate).getTime();
      if (!isNaN(logDateTime) && !isNaN(endDateTime)) {
        matchesDate = matchesDate && logDateTime <= endDateTime;
      }
    }

    return matchesRole && matchesAction && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredLogs.length, totalPages, currentPage]);

  const rolesList = ["All Roles", "PPIC", "QC", "SYSTEM", "ADMIN", "WAREHOUSE_STAFF"];
  const actionsList = ["All Actions", "Stock Addition", "Status Update", "Login Attempt", "Configuration Change", "System Task"];

  return (
    <div className="space-y-6 pb-16 text-left relative font-sans">
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
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-neutral-800 text-3xl font-bold font-sans"
      >
        Audit Trail
      </motion.div>

      {/* Filters Card Panel with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        className="w-full p-4 bg-[#D6E5D7]/40 rounded-xl shadow-[0px_4px_12px_rgba(143,177,87,0.04)] outline outline-1 outline-offset-[-1px] outline-lime-400/20 flex flex-col md:flex-row justify-between items-end gap-4"
      >
        
        {/* User Role Filter */}
        <div className="w-full md:w-52 min-w-[192px] flex flex-col justify-start items-start gap-1">
          <label className="text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            User Role
          </label>
          <div className="relative w-full">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setActionDropdownOpen(false);
              }}
              className="w-full pl-3 pr-8 py-2 relative bg-stone-100/80 rounded-lg outline outline-1 outline-offset-[-1px] outline-lime-400/20 flex justify-between items-center text-green-950 text-sm font-normal font-sans leading-5 focus:outline-none"
            >
              <span className="truncate">{selectedRole}</span>
              <ChevronDown className="w-4 h-4 text-stone-700 shrink-0 absolute right-3" />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-1.5 w-full bg-white border border-stone-200 rounded-lg shadow-lg z-20 p-2 space-y-1 max-h-48 overflow-y-auto"
                  >
                    {rolesList.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                          selectedRole === role 
                            ? "bg-[#2C742F]/10 text-[#2C742F]" 
                            : "text-[#1C1B1F] hover:bg-stone-50"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Type Filter */}
        <div className="w-full md:w-52 min-w-[192px] flex flex-col justify-start items-start gap-1">
          <label className="text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            Action Type
          </label>
          <div className="relative w-full">
            <button
              onClick={() => {
                setActionDropdownOpen(!actionDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="w-full pl-3 pr-8 py-2 relative bg-stone-100/80 rounded-lg outline outline-1 outline-offset-[-1px] outline-lime-400/20 flex justify-between items-center text-green-950 text-sm font-normal font-sans leading-5 focus:outline-none"
            >
              <span className="truncate">{selectedAction}</span>
              <ChevronDown className="w-4 h-4 text-stone-700 shrink-0 absolute right-3" />
            </button>

            <AnimatePresence>
              {actionDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActionDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-1.5 w-full bg-white border border-stone-200 rounded-lg shadow-lg z-20 p-2 space-y-1 max-h-48 overflow-y-auto"
                  >
                    {actionsList.map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setSelectedAction(action);
                          setActionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                          selectedAction === action 
                            ? "bg-[#2C742F]/10 text-[#2C742F]" 
                            : "text-[#1C1B1F] hover:bg-stone-50"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="w-full md:w-64 min-w-[256px] flex flex-col justify-start items-start gap-1">
          <label className="text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            Date Range
          </label>
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-3 pr-2 py-1.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-lime-400/20 text-green-950 text-xs font-normal font-sans focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
            <span className="text-stone-400 text-xs font-normal">to</span>
            <div className="flex-1 relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-3 pr-2 py-1.5 bg-stone-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-lime-400/20 text-green-950 text-xs font-normal font-sans focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start items-start gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-lime-400/40 text-lime-800 text-xs font-semibold font-sans leading-4 tracking-wide hover:bg-stone-50 active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset
          </button>
          
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 bg-green-800 hover:bg-green-900 rounded-lg flex justify-start items-center gap-2 text-white text-xs font-semibold font-sans leading-4 tracking-wide active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Apply Filters</span>
          </button>
        </div>
      </motion.div>

      {/* Audit Log Card Table - styled with #F5FBF3, entrance animation, and border shadow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full bg-[#F5FBF3] rounded-xl shadow-[0px_4px_12px_rgba(143,177,87,0.05)] border border-lime-400/20 overflow-hidden flex flex-col justify-start items-start"
      >
        
        {/* Table Header - sticky top-0 and opaque */}
        <div className="w-full px-6 py-4 bg-[#2C742F]/5 border-b border-lime-400/20 inline-flex justify-start items-center gap-4 sticky top-0 bg-[#F5FBF3] z-10">
          <div className="w-48 text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            TIMESTAMP
          </div>
          <div className="w-48 text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            ACTOR
          </div>
          <div className="flex-1 min-w-[288px] text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            ACTION STATEMENT
          </div>
          <div className="w-48 text-right text-stone-700 text-xs font-semibold font-sans leading-4 tracking-wide">
            METADATA
          </div>
        </div>

        {/* Table Rows with scroll wrapper - max height set to 500px to accommodate 10 items beautifully */}
        <div className="w-full flex flex-col justify-start items-start overflow-y-auto max-h-[500px] divide-y divide-lime-400/10 custom-scrollbar">
          {paginatedLogs.map((log, idx) => {
            
            // Actor badge style
            let badgeStyle = "bg-lime-700/10 text-lime-800";
            if (log.actorRole === "QC") {
              badgeStyle = "bg-amber-400/10 text-amber-500";
            } else if (log.actorRole === "SYSTEM") {
              badgeStyle = "bg-green-200 text-stone-700";
            } else if (log.actorRole === "ADMIN") {
              badgeStyle = "bg-lime-800/10 text-lime-800";
            }

            // Statement Prefix Style
            let statementPrefixStyle = "text-lime-800";
            if (log.statementType === "login_fail") {
              statementPrefixStyle = "text-red-700";
            }

            // Row Container special bg
            let rowBg = "hover:bg-white/40 transition-colors";
            if (log.statementType === "login_fail") {
              rowBg = "bg-red-700/[0.03] hover:bg-red-700/[0.05] border-red-700/10";
            }

            // Metadata IP style
            let ipStyle = "text-stone-700";
            if (log.statementType === "login_fail") {
              ipStyle = "text-red-700";
            }

            return (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: idx * 0.04 }}
                className={`w-full px-6 py-4 inline-flex justify-start items-center gap-4 ${rowBg}`}
              >
                {/* TIMESTAMP Column */}
                <div className="w-48 inline-flex flex-col justify-start items-start shrink-0">
                  <span className="text-green-950 text-sm font-normal font-sans leading-5">
                    {log.date}
                  </span>
                  <span className="text-stone-700 text-sm font-normal font-sans leading-5 mt-0.5">
                    {log.time}
                  </span>
                </div>

                {/* ACTOR Column */}
                <div className="w-48 flex justify-start items-center gap-3 shrink-0">
                  {log.actorAvatar ? (
                    <div className="w-8 h-8 rounded-full border border-lime-400/30 overflow-hidden flex items-center justify-center shrink-0">
                      <img className="w-full h-full object-cover" src={log.actorAvatar} alt={log.actorName} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-neutral-800 rounded-full border border-lime-400/30 flex justify-center items-center shrink-0">
                      <Server className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  
                  <div className="inline-flex flex-col justify-start items-start gap-0.5">
                    <span className="text-green-950 text-sm font-semibold font-sans leading-5 truncate max-w-[128px]">
                      {log.actorName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full inline-flex justify-start items-center text-[10px] font-normal font-sans uppercase ${badgeStyle}`}>
                      {log.actorRole}
                    </span>
                  </div>
                </div>

                {/* ACTION STATEMENT Column */}
                <div className="flex-1 min-w-[288px] text-left">
                  <span className={`text-sm font-semibold font-sans leading-5 ${statementPrefixStyle}`}>
                    {log.statementPrefix}
                  </span>
                  <span className="text-green-950 text-sm font-semibold font-sans leading-5 whitespace-pre-line">
                    {log.statementContent}
                  </span>
                </div>

                {/* METADATA Column */}
                <div className="w-48 inline-flex flex-col justify-start items-end shrink-0 text-right">
                  <span className={`text-xs font-normal font-sans leading-5 ${ipStyle}`}>
                    IP: {log.ipAddress}
                  </span>
                  <span className="text-stone-500 text-xs font-normal font-sans leading-5 mt-0.5">
                    {log.deviceId}
                  </span>
                </div>

              </motion.div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="w-full text-center py-12 text-stone-500 font-semibold text-sm">
              No audit logs found matching the filter criteria.
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="w-full px-5 py-3.5 border-t border-[#2C742F]/10 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Showing{" "}
            <span className="font-semibold text-[#1C1B1F]">
              {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </span>{" "}
            of <span className="font-semibold text-[#1C1B1F]">{filteredLogs.length}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
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
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </motion.div>

      {/* Floating Orange Chat FAB */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg z-40 focus:outline-none cursor-pointer"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </motion.button>

    </div>
  );
}
