'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session') === 'expired' && user) {
      logout();
      setError('Your session has expired. Please sign in again.');
      router.replace('/login');
      return;
    }
    if (user && searchParams.get('session') !== 'expired') {
      router.push('/dashboard');
    }
  }, [user, router, searchParams, logout]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email dan password harus diisi'); return; }
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) setError(result.error ?? 'Login gagal');
  }

  if (user && searchParams.get('session') !== 'expired') return null;

  return (
    <div className="min-h-screen w-full flex bg-brand-sage-bg select-none font-sans overflow-hidden">

      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-16 lg:px-20 xl:px-24 py-10 h-screen overflow-y-auto">
        <div className="w-full max-w-[430px] space-y-7 text-left">

          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-sage-grey hover:text-brand-sage-charcoal transition-all">
            <span className="text-sm">←</span> Back
          </button>

          <div className="space-y-1.5">
            <h1 className="text-4xl font-extrabold text-brand-sage-charcoal tracking-tight">Sign In</h1>
            <p className="text-sm text-brand-sage-grey font-medium">Sign In to your AromaSys account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">
                Email
              </label>
              <input
                type="email"
                placeholder="john.doe@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold"
              />
            </div>

            {/* Password */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-brand-sage-grey hover:text-brand-sage-charcoal focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border border-brand-sage-grey/50 bg-transparent text-[#2C742F] focus:ring-0 cursor-pointer w-4 h-4" />
                <span className="text-xs font-semibold text-brand-sage-grey">Remember me</span>
              </label>
              <a href="#" className="text-xs font-bold text-brand-sage-coral hover:text-brand-sage-coralLight transition-all">
                Forgot Password
              </a>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#2C742F] hover:bg-[#366306] text-white font-bold text-sm transition-all duration-200 shadow-md active:scale-[0.98] focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs pt-2">
            <span className="text-brand-sage-charcoal/80 font-medium">Don&apos;t have an account? </span>
            <Link href="/register" className="font-bold text-[#2C742F] hover:text-[#366306] transition-all">Sign Up</Link>
          </div>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:block lg:w-[48%] relative h-screen p-0 select-none">
        <div className="relative h-full w-full rounded-tl-[120px] rounded-bl-[120px] overflow-hidden shadow-2xl">
          <img
            src="/signin.jpg"
            alt="Sign In — AromaSys"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2C742F]/30" />
          <div className="absolute inset-0 flex items-end p-12">
            <div className="text-white space-y-2">
              <h2 className="text-3xl font-extrabold leading-tight drop-shadow">Smart Warehouse,<br />Smarter Decisions</h2>
              <p className="text-white/80 text-sm font-medium drop-shadow">AromaSys — Platform manajemen gudang cerdas untuk industri aroma dan parfum.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#D7E5D8]">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
