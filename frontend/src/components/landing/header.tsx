"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHeader() {
  return (
    <header className="w-full flex items-center justify-between px-6 md:px-16 py-8 relative z-20">
      {/* Brand Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 text-brand-sage-forest"
      >
        <img src="/logo-aromasys-new.png" alt="AromaSys" className="w-5 h-5 object-contain" />
        <span className="font-extrabold text-sm md:text-base tracking-widest uppercase text-green-900">AromaSys</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <Link href="/register">
          <button className="px-6 py-2 md:px-7 md:py-2.5 rounded-full bg-brand-sage-forest hover:bg-brand-sage-forest/90 text-white font-bold text-xs tracking-wider transition-all duration-200 shadow-sm active:scale-[0.98] focus:outline-none">
            Sign up
          </button>
        </Link>
        <Link href="/login">
          <button className="px-6 py-2 md:px-7 md:py-2.5 rounded-full border-2 border-brand-sage-forest hover:bg-brand-sage-forest/5 text-brand-sage-forest font-bold text-xs tracking-wider transition-all duration-200 active:scale-[0.98] focus:outline-none">
            Sign In
          </button>
        </Link>
      </motion.div>
    </header>
  );
}
