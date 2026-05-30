import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import ErrorBoundary from "@/components/ErrorBoundary";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AromaSys — Warehouse Management & Intelligence Platform",
  description:
    "Platform manajemen gudang berbasis web dengan Digital Twin, LLM Production Copilot, dan Enterprise Settings untuk industri produksi aroma dan parfum.",
  keywords:
    "warehouse management, digital twin, cold chain, inventory, FIFO, audit trail, aromasys",
  authors: [{ name: "AromaSys Team" }],
  openGraph: {
    title: "AromaSys — Warehouse Management & Intelligence Platform",
    description: "Platform manajemen gudang cerdas untuk industri aroma dan parfum",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#366306",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
