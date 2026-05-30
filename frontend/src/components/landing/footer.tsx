"use client";

import { motion } from "framer-motion";

export function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="w-full px-6 md:px-16 py-6 text-left relative z-20 text-[10px] text-brand-sage-forest/40 font-bold uppercase tracking-widest"
    >
      <span>© 2026 AromaSys Logistics. All rights reserved.</span>
    </motion.footer>
  );
}
