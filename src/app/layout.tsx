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
  title: "DealTown | Queenstown Deals & Specials",
  description: "Your local guide to happy hours, lunch specials, daily deals, and fuel prices in Queenstown.",
  metadataBase: new URL("https://dealtown.co.nz"),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "DealTown",
    type: "website",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
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
