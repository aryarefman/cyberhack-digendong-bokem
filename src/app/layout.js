import './globals.css';
import { AuthProvider } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'AromaSys — Warehouse Management & Intelligence Platform',
  description: 'Platform manajemen gudang berbasis web dengan Digital Twin, LLM Production Copilot, dan Enterprise Settings untuk industri produksi aroma dan parfum.',
  keywords: 'warehouse management, digital twin, cold chain, inventory, FIFO, audit trail, aromasys',
  authors: [{ name: 'AromaSys Team' }],
  openGraph: {
    title: 'AromaSys — Warehouse Management & Intelligence Platform',
    description: 'Platform manajemen gudang cerdas untuk industri aroma dan parfum',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#366306',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
