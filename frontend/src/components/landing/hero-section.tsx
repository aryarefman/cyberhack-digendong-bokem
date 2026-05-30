"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 md:px-16 py-10 relative z-10">
      <div className="max-w-4xl space-y-6 text-left">
        {/* Animated Hero Typography */}
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-8xl font-bold font-['Poppins'] leading-[99px] bg-gradient-to-r from-[#2C742F] to-[#BCF389] bg-clip-text text-transparent"
          >
            AromaSys
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-8xl font-bold font-['Poppins'] leading-[99px] bg-gradient-to-r from-[#2C742F] to-[#BCF389] bg-clip-text text-transparent"
          >
            Dashboard
          </motion.h1>
        </div>

        {/* Descriptive Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-zinc-500 text-xl font-medium font-['Poppins'] leading-7 tracking-wide max-w-xl"
        >
          <p>
            Next-generation sensory telemetry and active lot<br />
            tracking for Sima Arome. Monitor essential oil purity<br />
            and cold-chain metrics in one intelligent console.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
