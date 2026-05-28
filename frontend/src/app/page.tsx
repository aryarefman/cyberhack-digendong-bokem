"use client";

import { LandingHeader, HeroSection, LandingFooter } from "@/components/landing";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-sage-bg flex flex-col justify-between relative overflow-hidden select-none font-sans">
      <LandingHeader />
      <HeroSection />
      <LandingFooter />
    </main>
  );
}
