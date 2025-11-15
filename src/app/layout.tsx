// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import DealTownHeader from "@/components/DealTownHeader";
import StickyNav from "@/components/StickyNav";
import PageviewBeacon from "@/components/analytics/PageviewBeacon";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DealTown | Queenstown Deals & Specials",
  description:
    "Your local guide to happy hours, lunch specials, daily deals, and fuel prices in Queenstown.",
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://dealtown.co.nz/#org",
                  name: "DealTown",
                  url: "https://dealtown.co.nz/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://dealtown.co.nz/favicon.ico",
                    width: 64,
                    height: 64,
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://dealtown.co.nz/#website",
                  url: "https://dealtown.co.nz/",
                  name: "DealTown",
                  publisher: { "@id": "https://dealtown.co.nz/#org" },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased text-slate-800 min-h-screen flex flex-col">
        <PageviewBeacon />
        <DealTownHeader />
        <StickyNav />
        <main className="flex-grow">{children}</main>
        <Footer />
        {(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
            }&libraries=places`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
