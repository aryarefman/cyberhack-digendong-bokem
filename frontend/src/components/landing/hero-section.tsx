"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useLanguage();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCard(activeCard === index ? null : index);
  };

  return (
    <div className="flex-1 flex items-center px-4 sm:px-8 md:px-12 lg:px-16 py-8 relative z-10 overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-center">

        {/* Left Side: Brand + Text */}
        <div className="space-y-4 sm:space-y-6 text-left z-10 min-w-0">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
          >
            <img src="/logo-cerah.png" alt="AromaSys Logo" className="w-full h-full object-contain" />
          </motion.div>

          {/* Title */}
          <div className="space-y-0.5">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold font-['Poppins'] leading-none text-white"
            >
              {t("landingTitle1")}
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold font-['Poppins'] leading-none text-[#BCF389] mt-1"
            >
              {t("landingTitle2a")}
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold font-['Poppins'] leading-none text-[#BCF389]"
            >
              {t("landingTitle2b")}
            </motion.h1>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-zinc-300 text-sm sm:text-base md:text-lg font-medium font-['Poppins'] leading-relaxed tracking-wide max-w-lg"
          >
            <p>{t("landingSub")}</p>
          </motion.div>
        </div>

        {/* Right Side: Stacked Preview Cards */}
        <div
          onClick={() => setActiveCard(null)}
          className="relative flex justify-center items-center w-full select-none"
          style={{ height: "clamp(300px, 45vw, 560px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="w-full h-full flex items-center justify-center relative"
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              whileHover={activeCard === null ? "spread" : undefined}
              initial="initial"
            >
              {/* Shared card styles via a helper — cards use % width so they scale with container */}
              {[
                {
                  id: 1, src: "/ld.png", alt: "Overview", zIndex: 10,
                  initial: { rotate: -15, x: "-38%", y: "15%", scale: 0.95 },
                  spread: { rotate: -20, x: "-52%", y: "22%", scale: 0.98 },
                },
                {
                  id: 2, src: "/ld (2).png", alt: "Floor Plan", zIndex: 20,
                  initial: { rotate: 10, x: "32%", y: "-15%", scale: 0.95 },
                  spread: { rotate: 15, x: "48%", y: "-24%", scale: 0.98 },
                },
                {
                  id: 3, src: "/ld (3).png", alt: "FIFO & Expiry", zIndex: 30,
                  initial: { rotate: -8, x: "-18%", y: "24%", scale: 0.95 },
                  spread: { rotate: -12, x: "-28%", y: "40%", scale: 0.98 },
                },
                {
                  id: 4, src: "/ld (4).png", alt: "Cold Chain", zIndex: 40,
                  initial: { rotate: 5, x: "18%", y: "9%", scale: 0.95 },
                  spread: { rotate: 8, x: "28%", y: "20%", scale: 0.98 },
                },
                {
                  id: 5, src: "/ld (5).png", alt: "AI Copilot", zIndex: 45,
                  initial: { rotate: 0, x: "0%", y: "0%", scale: 0.95 },
                  spread: { rotate: 4, x: "7%", y: "-11%", scale: 1.02 },
                },
              ].map((card) => (
                <motion.div
                  key={card.id}
                  variants={{
                    initial: card.initial as any,
                    spread: card.spread as any,
                    active: { rotate: 0, x: "0%", y: "0%", scale: 1.3 },
                  }}
                  animate={activeCard === card.id ? "active" : undefined}
                  onClick={(e) => handleCardClick(card.id, e)}
                  transition={{ type: "spring", stiffness: 100, damping: 16 }}
                  className="absolute w-[75%] sm:w-[70%] aspect-[1.6] bg-zinc-950 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl cursor-pointer"
                  style={{ zIndex: activeCard === card.id ? 100 : card.zIndex }}
                >
                  <div className="h-5 sm:h-6 bg-zinc-900/90 flex items-center gap-1.5 px-3 border-b border-zinc-800/60">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500/60" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500/60" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/60" />
                  </div>
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-full h-[calc(100%-20px)] sm:h-[calc(100%-24px)] object-contain bg-zinc-950"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
