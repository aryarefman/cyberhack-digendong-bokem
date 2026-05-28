"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Leaf,
  Bell,
  Search,
  LayoutDashboard,
  Warehouse,
  Calendar,
  Thermometer,
  Database,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  LogOut,
  ChevronDown,
  User
} from "lucide-react";
import { MOCK_USERS } from "../../lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem("sima_arome_user");
    router.push("/login");
  };

  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", href: "/overview", icon: LayoutDashboard }
      ]
    },
    {
      title: "WAREHOUSE",
      items: [
        { name: "Interactive Floor Plan", href: "/floor-plan", icon: Warehouse },
        { name: "FIFO & Expiry", href: "/fifo-expiry", icon: Calendar },
        { name: "Cold-Chain Monitor", href: "/cold-chain", icon: Thermometer }
      ]
    },
    {
      title: "PRODUCTION",
      items: [
        { name: "Data Ingestion", href: "/data-ingestion", icon: Database },
        { name: "Auto-Report", href: "/auto-report", icon: FileSpreadsheet }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { name: "Inventory Master", href: "/inventory-master", icon: Layers },
        { name: "Audit Trail", href: "/audit-trail", icon: ShieldCheck }
      ]
    }
  ];

  const getDisplayRole = (role: string) => {
    if (role === "ADMIN") return "Operations Manager";
    if (role === "QUALITY_CONTROL") return "Quality Control";
    return "Operator";
  };

  return (
    <div className="h-screen w-full flex bg-[#D7E5D8] select-none font-sans overflow-hidden">

      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2C742F] border-r border-[#2C742F]/10 h-full shrink-0 text-left">
        {/* Brand Logo */}
        <div className="h-16 border-b border-white/10 flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-2 justify-center">
            <img src="/logo-sima-arome.png" alt="Sima Arome Logo" className="w-6 h-6 object-contain" />
            <span className="font-semibold text-2xl text-emerald-50 leading-none">AromaSys</span>
          </div>
          <div className="text-[#AAE970] text-[10px] font-bold uppercase tracking-widest mt-1 text-center">
            SIMA AROME
          </div>
        </div>

        {/* Sidebar Nav Categories */}
        <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-4 py-1">
                <span className="text-green-200 text-xs font-bold uppercase tracking-wider block opacity-70">
                  {group.title}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`w-full px-4 py-2.5 flex items-center gap-3.5 transition-all text-sm font-semibold group relative ${isActive
                          ? "text-[#CBEAD2] bg-white/10 rounded-l-xl rounded-r-none border-r-4 border-[#BCF389]"
                          : "text-green-200/80 hover:text-white hover:bg-white/5 rounded-xl"
                        }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#CBEAD2]" : "text-green-200/70 group-hover:text-green-100"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3.5 text-sm font-semibold text-green-200/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4.5 h-4.5 text-green-200/70" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/75 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#2C742F] p-5 z-50 lg:hidden flex flex-col text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 justify-center flex-1">
                  <img src="/logo-sima-arome.png" alt="Sima Arome Logo" className="w-6 h-6 object-contain" />
                  <span className="font-semibold text-2xl text-emerald-50 leading-none">AromaSys</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-green-200 hover:text-white shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-[#AAE970] text-[10px] font-bold uppercase tracking-widest mt-1.5 text-center">
                SIMA AROME
              </div>

              <nav className="flex-1 py-6 space-y-5 overflow-y-auto">
                {menuGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-4 py-1">
                      <span className="text-green-200 text-xs font-bold uppercase tracking-wider block opacity-70">
                        {group.title}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`w-full px-4 py-2.5 flex items-center gap-3.5 transition-all text-sm font-semibold group relative ${isActive
                                ? "text-[#CBEAD2] bg-white/10 rounded-l-xl rounded-r-none border-r-4 border-[#BCF389]"
                                : "text-green-200/80 hover:text-white hover:bg-white/5 rounded-xl"
                              }`}
                          >
                            <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#CBEAD2]" : "text-green-200/70 group-hover:text-green-100"}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3.5 text-sm font-semibold text-green-200/80 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogOut className="w-4.5 h-4.5 text-green-200/70" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Page Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Header Bar */}
        <header className="h-16 sticky top-0 z-30 bg-[#D7E5D8]/95 border-b border-[#2C742F]/10 backdrop-blur-md px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg border border-[#2C742F]/20 bg-white/10 hover:bg-white/20 lg:hidden text-[#2C742F]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Pill */}
            <div className="relative hidden md:block w-72">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#f3f6f3] rounded-full border border-stone-300 py-1.5 pl-10 pr-4 text-xs font-semibold text-[#1C1B1F] placeholder:text-[#79747E]/60 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E]" />
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-full border border-[#2C742F]/10 bg-white/40 hover:bg-white/70 text-[#1C1B1F] transition-colors focus:outline-none">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EA4B48]" />
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/40 transition-all focus:outline-none"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#2C742F]/20"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-bold text-[#1C1B1F] leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-[#79747E] font-semibold leading-none">{getDisplayRole(currentUser.role)}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-stone-300 bg-white/40 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5 text-[#79747E]" />
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-52 bg-[#F2F7ED]/95 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-xl z-50 overflow-hidden text-left"
                      >
                        <div className="p-1 space-y-0.5">
                          {/* Manage Account */}
                          <button
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-white/60 rounded-xl transition-all font-semibold text-sm text-left"
                          >
                            <User className="w-4.5 h-4.5 text-[#5A94E2] shrink-0" />
                            <span>Manage Account</span>
                          </button>

                          {/* Divider */}
                          <div className="h-[1px] bg-stone-200/60 my-1 mx-2" />

                          {/* Log out */}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-white/60 rounded-xl transition-all font-semibold text-sm text-left"
                          >
                            <LogOut className="w-4.5 h-4.5 text-[#EA4B48] shrink-0" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 md:p-8 relative overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
