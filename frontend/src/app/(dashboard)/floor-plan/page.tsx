"use client";

import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});

export default function WarehousePage() {
  return (
    <div className={`${nunitoSans.className} text-left min-h-screen relative`}>
      {/* Title Header matching the screenshot exactly */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight font-sans">
          Interactive Floor Plan
        </h2>
      </div>

      {/* Floating Chatbot FAB visible in the bottom right of the screenshot */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 z-40 focus:outline-none"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </button>
    </div>
  );
}
