'use client';
import Link from 'next/link';
import { Leaf, ArrowRight, Warehouse, Thermometer, Bot, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: Warehouse, title: 'Digital Twin', desc: 'Real-time interactive floor plan with slot tracking and zone management.' },
  { icon: Thermometer, title: 'Cold-Chain Monitor', desc: 'Live temperature sensor readings with anomaly detection and alerts.' },
  { icon: Bot, title: 'AI Copilot', desc: 'Gemini-powered assistant for warehouse intelligence and PPIC automation.' },
  { icon: ShieldCheck, title: 'Audit Trail', desc: 'Complete logging of all warehouse activities for compliance and oversight.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#D7E5D8] font-sans">
      {/* Navbar */}
      <nav className="h-16 border-b border-[#2C742F]/10 bg-[#D7E5D8]/90 backdrop-blur-md sticky top-0 z-10 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2C742F] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[#1C1B1F]">AromaSys</span>
          <span className="text-[10px] font-bold text-[#2C742F] uppercase tracking-widest ml-1">SIMA AROME</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-[#1C1B1F] hover:text-[#2C742F] transition-all">Sign In</Link>
          <Link href="/register" className="px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-bold hover:bg-[#366306] transition-all shadow-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C742F]/10 border border-[#2C742F]/20 text-sm font-semibold text-[#2C742F]">
          <span className="w-2 h-2 rounded-full bg-[#2C742F] animate-pulse" />
          Warehouse Management Intelligence Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1C1B1F] tracking-tight leading-tight">
          Smart Warehouse,<br />
          <span className="text-sage-gradient">Smarter Decisions</span>
        </h1>
        <p className="text-lg text-[#79747E] max-w-2xl mx-auto font-medium leading-relaxed">
          AromaSys adalah platform manajemen gudang berbasis AI untuk industri aroma dan parfum. Digital Twin, Cold-Chain monitoring, dan Production Copilot dalam satu platform terintegrasi.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register" className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#2C742F] text-white font-bold hover:bg-[#366306] transition-all shadow-md text-sm">
            Mulai Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="px-6 py-3.5 rounded-full border border-[#2C742F]/30 bg-white/60 text-[#1C1B1F] font-bold hover:bg-white transition-all text-sm">
            Masuk ke Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2C742F]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#2C742F]" />
                </div>
                <h3 className="font-bold text-[#1C1B1F]">{f.title}</h3>
                <p className="text-sm text-[#79747E] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-16 max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-[#1C1B1F]">Siap Transformasi Gudang Anda?</h2>
        <p className="text-[#79747E] font-medium">Bergabunglah dengan platform manajemen gudang generasi berikutnya.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2C742F] text-white font-bold hover:bg-[#366306] transition-all shadow-lg text-sm">
          Daftar Gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-[#2C742F]/10 px-6 py-6 text-center text-xs text-[#79747E] font-medium">
        © 2026 AromaSys — SIMA AROME. All rights reserved.
      </footer>
    </div>
  );
}
