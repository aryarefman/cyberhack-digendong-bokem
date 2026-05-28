import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AromaSys",
  description: "Next-generation digital inventory and organic aroma batch telemetry tracking platform.",
  icons: {
    icon: "/logo-sima-arome.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${plusJakartaSans.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen relative`}>
        <div className="absolute inset-0 pointer-events-none z-0 amber-glow-bg" />
        <div className="absolute inset-0 pointer-events-none z-0 teal-glow-bg" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
