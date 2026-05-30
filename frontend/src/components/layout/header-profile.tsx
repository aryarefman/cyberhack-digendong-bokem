"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_USERS } from "../../lib/constants";
import { User } from "../../types";

export function HeaderProfile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sima_arome_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        setCurrentUser(MOCK_USERS[0]);
      }
    } else {
      setCurrentUser(MOCK_USERS[0]);
      localStorage.setItem("sima_arome_user", JSON.stringify(MOCK_USERS[0]));
    }
  }, []);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("sima_arome_user", JSON.stringify(user));
    setIsOpen(false);
    // Reload page to reflect user updates across layout components immediately
    window.location.reload();
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:outline-none focus:ring-1 focus:ring-brand-amber-500/30"
      >
        <img
          src={currentUser.avatar || undefined}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover border border-brand-amber-500/30"
        />
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{currentUser.role.replace("_", " ")}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2.5 w-64 glass-panel border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Simulator Control</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Switch profiles to test page rendering.</p>
              </div>

              <div className="p-1.5 space-y-1">
                {MOCK_USERS.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                        isSelected
                          ? "bg-brand-amber-500/10 text-white border border-brand-amber-500/20"
                          : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                      }`}
                    >
                      <img src={user.avatar || undefined} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate leading-none">{user.name}</p>
                        <span className="text-[9px] text-zinc-500 font-bold tracking-wide uppercase">{user.role.replace("_", " ")}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-amber-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/5 p-1.5">
                <a
                  href="/login"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeaderProfile;
