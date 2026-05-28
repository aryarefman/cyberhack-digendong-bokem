"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  User as UserIcon, 
  Search, 
  Settings2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { Dropdown } from "../../../components/ui/dropdown";
import { Button } from "../../../components/ui/button";
import { MOCK_USERS } from "../../../lib/constants";
import { User, UserRole } from "../../../types";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("WAREHOUSE_STAFF");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Read from localStorage or pre-seeds
    const localUsers = localStorage.getItem("sima_arome_users_list");
    if (localUsers) {
      try {
        setUsers(JSON.parse(localUsers));
      } catch (e) {
        setUsers(MOCK_USERS);
      }
    } else {
      setUsers(MOCK_USERS);
      localStorage.setItem("sima_arome_users_list", JSON.stringify(MOCK_USERS));
    }
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName) errors.formName = "Name is required";
    if (!formEmail) errors.formEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errors.formEmail = "Invalid email formatting";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    setTimeout(() => {
      // Create random abstract avatar based on name
      const randomSeed = Math.floor(Math.random() * 1000);
      const newStaff: User = {
        id: `u-${Date.now()}`,
        name: formName,
        email: formEmail,
        role: formRole,
        avatar: `https://images.unsplash.com/photo-${randomSeed === 0 ? "1534528741775-53994a69daeb" : "1535713875002-d1d0cf377fde"}?auto=format&fit=crop&q=80&w=200`
      };

      const updated = [...users, newStaff];
      setUsers(updated);
      localStorage.setItem("sima_arome_users_list", JSON.stringify(updated));

      // Reset
      setFormName("");
      setFormEmail("");
      setIsSaving(false);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem("sima_arome_users_list", JSON.stringify(updated));
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleOptions = [
    { value: "WAREHOUSE_STAFF", label: "Warehouse Staff (Aroma Stock)" },
    { value: "QUALITY_CONTROL", label: "Quality Control (Lab Assessor)" },
    { value: "ADMIN", label: "Operations Manager (Admin)" }
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-brand-amber-500/10 border-brand-amber-500/20 text-brand-amber-400";
      case "QUALITY_CONTROL":
        return "bg-brand-teal-500/10 border-brand-teal-500/20 text-brand-teal-300";
      default:
        return "bg-white/5 border-white/10 text-zinc-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-xl shadow-2xl"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Staff Terminal Active</p>
              <p className="opacity-80">Security credentials generated and stored successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Staff & Roles Administration</h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Verify employee security clearances and issue new operational terminal keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Form add staff */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-amber-500 to-brand-teal-500 opacity-40" />
            
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <UserPlus className="w-4 h-4 text-brand-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Issue Security Key</h3>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                type="text"
                label="Employee Full Name"
                placeholder="e.g. Ahmad Hidayat"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={formErrors.formName}
                icon={<UserIcon className="w-4 h-4 text-zinc-500" />}
              />

              <Input
                type="email"
                label="Corporate Email Address"
                placeholder="e.g. ahmad@simaarome.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                error={formErrors.formEmail}
                icon={<Mail className="w-4 h-4 text-zinc-500" />}
              />

              <Dropdown
                label="Operations Role & Clearance"
                options={roleOptions}
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                isLoading={isSaving}
              >
                Register Staff Clearance
              </Button>
            </form>
          </div>
        </div>

        {/* Staff registry listing */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-4 flex flex-col min-h-[480px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-brand-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Authorized Employees</h3>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  className="pl-9 pr-3 py-1.5 w-full sm:w-48 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-amber-500/40 focus:ring-1 focus:ring-brand-amber-500/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-20">No matching employee records logged.</p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-bold text-white leading-tight truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded border font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                        {user.role.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 bg-white/[0.01] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all focus:outline-none"
                        title="Revoke Access Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


