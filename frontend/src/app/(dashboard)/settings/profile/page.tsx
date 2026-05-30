'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, Bell, Save, Check, X, AlertCircle, Camera } from 'lucide-react';
import { api } from '@/lib/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024;

function ProfileContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pwData, setPwData] = useState({ current: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setProfileData({ name: user.name || '', email: user.email || '' }); setCurrentAvatar(user.avatar || null); }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['account', 'password', 'notifications'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    if (!ALLOWED_TYPES.includes(file.type)) { setAvatarError('Format tidak didukung. Gunakan JPG, PNG, atau GIF.'); return; }
    if (file.size > MAX_SIZE) { setAvatarError('Ukuran file melebihi 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target?.result as string;
      setAvatarPreview(b64); setAvatarBase64(b64);
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { name: profileData.name, email: profileData.email };
      if (avatarBase64) payload.avatar = avatarBase64;
      const data = await api.put<{ success: boolean; user?: { name: string; email: string; avatar?: string } }>('/profile', payload);
      if (data.success && data.user) {
        const stored = JSON.parse(localStorage.getItem('aromasys_user') || '{}');
        const updated = { ...stored, name: data.user.name, email: data.user.email, avatar: data.user.avatar ?? stored.avatar };
        localStorage.setItem('aromasys_user', JSON.stringify(updated));
        if (data.user.avatar) setCurrentAvatar(data.user.avatar);
        window.dispatchEvent(new Event('aromasys_avatar_updated'));
        setAvatarPreview(null); setAvatarBase64(null);
        setToast({ msg: 'Profile updated!', type: 'success' });
      } else setToast({ msg: 'Failed to update profile.', type: 'error' });
    } catch { setToast({ msg: 'Failed to connect to server.', type: 'error' }); }
    finally { setIsSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (pwData.newPassword.length < 8) { setPwError('Password minimal 8 karakter.'); return; }
    if (pwData.newPassword !== pwData.confirm) { setPwError('Password tidak cocok.'); return; }
    setIsSaving(true);
    try {
      const data = await api.put<{ success: boolean; error?: string }>('/profile', { currentPassword: pwData.current, newPassword: pwData.newPassword });
      if (data.success) { setPwData({ current: '', newPassword: '', confirm: '' }); setToast({ msg: 'Password changed!', type: 'success' }); }
      else setToast({ msg: data.error ?? 'Failed to change password.', type: 'error' });
    } catch { setToast({ msg: 'Failed to connect.', type: 'error' }); }
    finally { setIsSaving(false); }
  }

  const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white";
  const avatarSrc = avatarPreview ?? currentAvatar;
  const tabs = [{ key: 'account', label: 'Account', icon: User }, { key: 'password', label: 'Password', icon: Key }, { key: 'notifications', label: 'Notifications', icon: Bell }];

  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Profile Settings</h1>

      {/* Tab nav */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-[#1C1B1F] shadow-sm' : 'text-[#79747E] hover:text-[#1C1B1F]'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#2C742F] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md overflow-hidden">
                {avatarSrc ? <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2C742F] text-white flex items-center justify-center border-2 border-white hover:bg-[#366306] transition-all">
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>
            <div>
              <p className="font-bold text-[#1C1B1F]">{user?.name}</p>
              <p className="text-sm text-[#79747E]">{user?.role}</p>
              {avatarPreview && <p className="text-xs text-emerald-600 font-semibold mt-1">New avatar ready — save to apply</p>}
              {avatarError && <p className="text-xs text-[#EA4B48] font-semibold mt-1">{avatarError}</p>}
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#79747E] block mb-1">Full Name</label>
              <input value={profileData.name} onChange={e => setProfileData(d => ({ ...d, name: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#79747E] block mb-1">Email</label>
              <input type="email" value={profileData.email} onChange={e => setProfileData(d => ({ ...d, email: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#79747E] block mb-1">Role</label>
              <input value={user?.role ?? ''} disabled className={`${inputCls} bg-stone-50 text-[#79747E] cursor-not-allowed`} />
            </div>
            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all disabled:opacity-50">
              {isSaving ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </form>
        </motion.div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h2 className="font-bold text-[#1C1B1F]">Change Password</h2>
          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-[#EA4B48] font-semibold">
              <AlertCircle className="w-4 h-4" />{pwError}
            </div>
          )}
          <form onSubmit={savePassword} className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[#79747E] block mb-1">{f.label}</label>
                <input type="password" value={pwData[f.key as keyof typeof pwData]} onChange={e => setPwData(d => ({ ...d, [f.key]: e.target.value }))} required className={inputCls} placeholder="••••••••" />
              </div>
            ))}
            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all disabled:opacity-50">
              {isSaving ? 'Saving...' : <><Key className="w-4 h-4" />Change Password</>}
            </button>
          </form>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h2 className="font-bold text-[#1C1B1F]">Notification Preferences</h2>
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive important updates via email' },
            { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications in the dashboard bell' },
            { key: 'expiry', label: 'Expiry Alerts', desc: 'Alert when items are near expiry date' },
            { key: 'coldChain', label: 'Cold-Chain Alerts', desc: 'Alert when temperature anomalies detected' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div>
                <p className="text-sm font-semibold text-[#1C1B1F]">{pref.label}</p>
                <p className="text-xs text-[#79747E] mt-0.5">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2C742F]" />
              </label>
            </div>
          ))}
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all">
            <Save className="w-4 h-4" />Save Preferences
          </button>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-[#2C742F]' : 'bg-[#EA4B48]'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" style={{ width: 36, height: 36 }} /></div>}><ProfileContent /></Suspense>;
}
