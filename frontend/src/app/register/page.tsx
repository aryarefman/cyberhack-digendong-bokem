'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Operator');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, register } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) router.push('/dashboard'); }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name) { setError('Nama lengkap harus diisi'); return; }
    if (!email) { setError('Email harus diisi'); return; }
    if (password.length < 8) { setError('Password minimal 8 karakter'); return; }
    if (password !== confirmPassword) { setError('Password konfirmasi tidak cocok'); return; }
    setIsLoading(true);
    const result = await register(name, email, password, role);
    setIsLoading(false);
    if (!result.success) setError(result.error ?? 'Gagal mendaftar');
  }

  if (user) return null;

  const fieldClass = "w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold";

  return (
    <div className="min-h-screen w-full flex bg-brand-sage-bg select-none font-sans overflow-hidden">

      {/* Left: Image */}
      <div className="hidden lg:block lg:w-[48%] relative h-screen p-0 select-none">
        <div className="relative h-full w-full rounded-tr-[120px] rounded-br-[120px] overflow-hidden shadow-2xl">
          <img
            src="/signup.jpg"
            alt="Sign Up — AromaSys"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#366306]/30" />
          <div className="absolute inset-0 flex items-end p-12">
            <div className="text-white space-y-2">
              <h2 className="text-3xl font-extrabold leading-tight drop-shadow">Join AromaSys<br />Enterprise</h2>
              <p className="text-white/80 text-sm font-medium drop-shadow">Buat akun dan mulai kelola gudang dengan lebih cerdas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-16 lg:px-20 xl:px-24 py-10 h-screen overflow-y-auto">
        <div className="w-full max-w-[430px] space-y-6 text-left">

          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-sage-grey hover:text-brand-sage-charcoal transition-all">
            <span className="text-sm">←</span> Back
          </button>

          <div className="space-y-1.5">
            <h1 className="text-4xl font-extrabold text-brand-sage-charcoal tracking-tight">Sign Up</h1>
            <p className="text-sm text-brand-sage-grey font-medium">Buat akun AromaSys enterprise baru</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className={fieldClass} />
            </div>

            {/* Email */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">Email</label>
              <input type="email" placeholder="john.doe@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required className={fieldClass} />
            </div>

            {/* Password */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">Password</label>
              <div className="relative flex items-center">
                <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 karakter" value={password} onChange={e => setPassword(e.target.value)} required className={`${fieldClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-brand-sage-grey hover:text-brand-sage-charcoal focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">Confirm Password</label>
              <div className="relative flex items-center">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Ulangi password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={`${fieldClass} pr-12`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-brand-sage-grey hover:text-brand-sage-charcoal focus:outline-none">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={`${fieldClass} appearance-none pr-10 cursor-pointer`}>
                <option value="Operator">Operator</option>
                <option value="QC">QC (Quality Control)</option>
                <option value="PPIC">PPIC (Production Planning)</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-brand-sage-charcoal" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all duration-200 shadow-md active:scale-[0.98] focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Sign Up'}
            </button>
          </form>

          <div className="text-center text-xs pt-2">
            <span className="text-brand-sage-charcoal/80 font-medium">Already have an account? </span>
            <Link href="/login" className="font-bold text-[#2C742F] hover:text-[#366306] transition-all">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
