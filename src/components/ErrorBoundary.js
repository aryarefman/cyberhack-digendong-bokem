'use client';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '48px', textAlign: 'center', gap: '16px' }}>
          <AlertTriangle size={48} style={{ color: '#BA1A1A' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#202224', margin: 0 }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#566050', margin: 0, maxWidth: '400px' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#366306', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
          >
            <RefreshCw size={16} /> Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
