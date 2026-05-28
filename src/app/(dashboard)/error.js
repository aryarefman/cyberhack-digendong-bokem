'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '16px', padding: '48px', textAlign: 'center' }}>
      <AlertTriangle size={48} style={{ color: '#BA1A1A' }} />
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#202224', margin: 0 }}>Page Error</h2>
      <p style={{ fontSize: '14px', color: '#566050', margin: 0, maxWidth: '400px' }}>
        {error?.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={reset}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#366306', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
      >
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  );
}
