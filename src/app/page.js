'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="landing-loading">
        <div className="landing-loading-card">
          <div className="landing-loading-spinner-wrapper">
            <svg className="landing-loading-spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="var(--color-border-default)" strokeWidth="3" fill="none" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-brand-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="landing-loading-title">AromaSys</h2>
          <p className="landing-loading-text">Memuat platform manajemen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Background overlay for readability */}
      <div className="landing-bg-overlay" aria-hidden="true" />

      {/* Logo only header */}
      <header className="landing-navbar">
        <div className="landing-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="AromaSys leaf icon">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2a7 7 0 0 1-9 8.8zm0 0v-8" />
          </svg>
          <span className="landing-logo-text">AromaSys</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-hero-heading">
            AromaSys — Warehouse Management untuk Pabrik Aroma &amp; Parfum
          </h1>
          <p className="landing-hero-subtitle">
            Kelola gudang Anda dengan manajemen inventori, cold-chain monitoring, FIFO &amp; expiry tracking, digital twin denah gudang, dan copilot AI dalam satu platform.
          </p>
          <div className="landing-hero-actions">
            <Link href="/login">
              <button className="landing-btn-signin-hero" type="button">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="landing-btn-signup-hero" type="button">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
