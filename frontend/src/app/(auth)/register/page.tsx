"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!role) newErrors.role = "Role is required";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Map UI role values to backend roles
    let backendRole: UserRole = "Operator";
    if (role === "QUALITY_CONTROL") backendRole = "QC";
    else if (role === "ADMIN") backendRole = "Admin";
    else if (role === "PPIC") backendRole = "PPIC";

    try {
      const res = await register(name, email, password, backendRole);
      setIsLoading(false);
      if (res.success) {
        const savedUser = localStorage.getItem('aromasys_user');
        if (savedUser) {
          localStorage.setItem('sima_arome_user', savedUser);
        }
        router.push("/overview");
      } else {
        setErrors({ submit: res.error || "Failed to register" });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ submit: "Connection to registration server failed." });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-brand-sage-bg select-none font-sans overflow-hidden">
      
      {/* 1. Left Section - Split Image Banner */}
      <div className="hidden lg:block lg:w-[48%] relative h-screen p-0 select-none">
        <div className="relative h-full w-full rounded-tr-[120px] rounded-br-[120px] overflow-hidden shadow-2xl">
          <img
            src="/signup.jpg"
            alt="Sign Up Aromatic Bottle"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          
          {/* Bottom Left Quote */}
          <div className="absolute bottom-20 left-20 text-left pr-10">
            <h2 className="text-6xl md:text-7xl xl:text-[84px] font-black text-brand-sage-bg leading-[0.82] tracking-tighter lowercase font-sans">
              kata kata<br />hari ini
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Right Section - Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-16 lg:px-20 xl:px-24 py-10 h-screen overflow-y-auto">
        <div className="w-full max-w-[430px] space-y-7 text-left">
          
          {/* Back button - left aligned */}
          <div className="w-full">
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center gap-1.5 text-xs font-bold text-brand-sage-grey hover:text-brand-sage-charcoal transition-all focus:outline-none"
            >
              <span className="text-sm">←</span> Back
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo-aromasys-new.png" alt="AromaSys" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-brand-sage-charcoal">AromaSys</span>
            </div>
            <h1 className="text-4xl font-extrabold text-brand-sage-charcoal tracking-tight">Sign Up</h1>
            <p className="text-sm text-brand-sage-grey font-medium tracking-wide">Sign up for a new enterprise account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {errors.submit && <p className="text-xs text-brand-sage-coral font-bold text-center bg-red-100/50 py-2 rounded-lg">{errors.submit}</p>}
            {/* Input 1: Full Name */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none">
                Full Name
              </label>
              <input
                type="text"
                placeholder="john.doe@gmail.com"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold"
              />
              {errors.name && <p className="text-[10px] text-brand-sage-coral font-bold mt-1 pl-1">{errors.name}</p>}
            </div>

            {/* Input 2: Email */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none">
                Email
              </label>
              <input
                type="email"
                placeholder="john.doe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold"
              />
              {errors.email && <p className="text-[10px] text-brand-sage-coral font-bold mt-1 pl-1">{errors.email}</p>}
            </div>

            {/* Input 3: Role Dropdown */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">
                Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold"
                >
                  <option value="" disabled className="bg-brand-sage-bg text-brand-sage-grey/60">Select a role...</option>
                  <option value="WAREHOUSE_STAFF" className="bg-brand-sage-bg text-brand-sage-charcoal">Warehouse Staff (Aroma Stock)</option>
                  <option value="QUALITY_CONTROL" className="bg-brand-sage-bg text-brand-sage-charcoal">Quality Control (Lab Assessor)</option>
                  <option value="PPIC" className="bg-brand-sage-bg text-brand-sage-charcoal">Production Planner (PPIC)</option>
                  <option value="ADMIN" className="bg-brand-sage-bg text-brand-sage-charcoal">Operations Manager (Admin)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-sage-charcoal pointer-events-none" />
              </div>
              {errors.role && <p className="text-[10px] text-brand-sage-coral font-bold mt-1 pl-1">{errors.role}</p>}
            </div>

            {/* Input 4: Password */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-brand-sage-grey hover:text-brand-sage-charcoal focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-brand-sage-coral font-bold mt-1 pl-1">{errors.password}</p>}
            </div>

            {/* Input 5: Confirm Password */}
            <div className="relative w-full">
              <label className="absolute -top-2.5 left-3.5 bg-brand-sage-bg px-1.5 text-xs font-semibold text-brand-sage-grey leading-none z-10">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border border-brand-sage-grey/50 focus:border-brand-sage-green rounded-lg px-4 py-3.5 text-sm text-brand-sage-charcoal placeholder:text-brand-sage-grey/40 focus:outline-none focus:ring-1 focus:ring-brand-sage-green/20 transition-all font-semibold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-brand-sage-grey hover:text-brand-sage-charcoal focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-brand-sage-coral font-bold mt-1 pl-1">{errors.confirmPassword}</p>}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 w-full">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border border-brand-sage-grey/50 bg-transparent text-[#00a81c] focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs font-semibold text-brand-sage-grey">Remember me</span>
              </label>
              <a href="#" className="text-xs font-bold text-brand-sage-coral hover:text-brand-sage-coral/80 transition-all">
                Forgot Password
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#00a81c] hover:bg-[#00be20] text-white font-bold text-sm transition-all duration-200 shadow-md active:scale-[0.98] focus:outline-none disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="text-center text-xs pt-2">
            <span className="text-brand-sage-charcoal/80 font-medium">Already have an account? </span>
            <Link href="/login" className="font-bold text-[#00a81c] hover:text-[#00be20] transition-all">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
