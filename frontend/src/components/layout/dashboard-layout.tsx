"use client";

import { useState } from "react";
import { AppSidebar } from "./sidebar";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-sage-bg overflow-hidden">
      {/* Sidebar - Desktop and Mobile */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-4 border-b border-brand-sage-forest/10 bg-white/50 backdrop-blur-sm">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-brand-sage-forest/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-brand-sage-forest" />
            ) : (
              <Menu className="w-5 h-5 text-brand-sage-forest" />
            )}
          </motion.button>
          <span className="font-bold text-brand-sage-forest">AromaSys Dashboard</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
