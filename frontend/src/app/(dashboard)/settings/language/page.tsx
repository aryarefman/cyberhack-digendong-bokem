"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";
import { useState } from "react";

export default function LanguageSettingsPage() {
  const { lang, setLanguage } = useLanguage();
  const [toast, setToast] = useState<string | null>(null);

  const handleSelectLanguage = (newLang: "en" | "id") => {
    setLanguage(newLang);
    setToast(
      newLang === "id"
        ? "Bahasa berhasil diubah ke Bahasa Indonesia"
        : "Language successfully changed to English"
    );
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16 text-left relative font-sans max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">
          {lang === "id" ? "Pengaturan Bahasa" : "Language Settings"}
        </h1>
        <p className="text-sm text-stone-500 mt-1 font-medium">
          {lang === "id"
            ? "Pilih bahasa tampilan untuk aplikasi AromaSys."
            : "Choose the display language for AromaSys."}
        </p>
      </div>

      {/* Language Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bahasa Indonesia Option */}
        <div
          onClick={() => handleSelectLanguage("id")}
          className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all shadow-sm ${
            lang === "id"
              ? "border-[#2C742F] bg-[#F5FBF3]"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                lang === "id"
                  ? "bg-[#2C742F]/10 border-[#2C742F]/20 text-[#2C742F]"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">Bahasa Indonesia</p>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Indonesian</p>
            </div>
          </div>
          {lang === "id" && (
            <div className="w-6 h-6 rounded-full bg-[#2C742F] flex items-center justify-center text-white">
              <Check size={14} />
            </div>
          )}
        </div>

        {/* English Option */}
        <div
          onClick={() => handleSelectLanguage("en")}
          className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all shadow-sm ${
            lang === "en"
              ? "border-[#2C742F] bg-[#F5FBF3]"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                lang === "en"
                  ? "bg-[#2C742F]/10 border-[#2C742F]/20 text-[#2C742F]"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">English</p>
              <p className="text-xs text-stone-400 font-medium mt-0.5">English</p>
            </div>
          </div>
          {lang === "en" && (
            <div className="w-6 h-6 rounded-full bg-[#2C742F] flex items-center justify-center text-white">
              <Check size={14} />
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-2.5 px-4 py-3 bg-[#2C742F] text-white rounded-xl shadow-lg border border-emerald-500/20 text-xs font-bold animate-fadeIn">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
