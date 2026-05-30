"use client";

import { Droplets, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import { WarehouseZone } from "../../types";

export interface ActiveStockCardProps {
  zone: WarehouseZone;
}

export function ActiveStockCard({ zone }: ActiveStockCardProps) {
  const percentUsed = Math.round((zone.capacityUsed / zone.maxCapacity) * 100);

  const getAlertStyles = (level: string) => {
    switch (level) {
      case "Critical":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "Warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-teal-500/10 border-teal-500/20 text-brand-teal-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel glass-card-hover rounded-xl p-5 relative overflow-hidden"
    >
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-[0.05] transition-colors duration-300 ${
          zone.alertLevel === "Critical"
            ? "bg-red-500"
            : zone.alertLevel === "Warning"
            ? "bg-amber-500"
            : "bg-teal-500"
        }`}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
            Storage Zone
          </span>
          <h3 className="text-sm font-bold text-white truncate max-w-[140px] md:max-w-none">{zone.name}</h3>
        </div>
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getAlertStyles(
            zone.alertLevel
          )}`}
        >
          {zone.alertLevel}
        </span>
      </div>

      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 h-8 leading-relaxed">
        {zone.description}
      </p>

      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-zinc-500">Capacity Used</span>
          <span className="text-white">
            {zone.capacityUsed} / {zone.maxCapacity} units ({percentUsed}%)
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              zone.alertLevel === "Critical"
                ? "bg-red-500"
                : zone.alertLevel === "Warning"
                ? "bg-amber-500"
                : "bg-gradient-to-r from-brand-teal-500 to-brand-emerald-500"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 text-brand-amber-400">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider leading-none">
              Temp
            </span>
            <span className="text-xs font-bold text-white mt-1 block">{zone.temperature}°C</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 text-brand-teal-400">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider leading-none">
              Humidity
            </span>
            <span className="text-xs font-bold text-white mt-1 block">{zone.humidity}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ActiveStockCard;
