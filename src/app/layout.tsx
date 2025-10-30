// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from "@/components/Footer";
import DealTownHeader from "@/components/DealTownHeader";
import StickyNav from "@/components/StickyNav";
import PageviewBeacon from "@/components/analytics/PageviewBeacon";

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'DealTown — Queenstown deals',
  description: 'All the best local deals in one place. Find a deal. Share a deal.',
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: 'DealTown — Queenstown deals',
    description: 'Find a deal. Share a deal.',
    type: 'website',
    siteName: 'DealTown',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealTown — Queenstown deals',
    description: 'Find a deal. Share a deal.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-slate-800 min-h-screen flex flex-col">
        <PageviewBeacon />
        <DealTownHeader />
        <StickyNav />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
