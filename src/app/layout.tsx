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
    apple: "/icons/apple-touch-icon.png",
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
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Open Graph / Twitter for clean shares */}
        <meta property="og:site_name" content="DealTown" />
        <meta property="og:title" content="DealTown — Queenstown deals" />
        <meta property="og:description" content="All the best local deals in one place. Find a deal. Share a deal." />
        <meta property="og:url" content="https://dealtown.co.nz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dealtown.co.nz/icons/og-1200x630.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Organization + WebSite markup for Google logo/brand features */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://dealtown.co.nz/#org',
                  name: 'DealTown',
                  url: 'https://dealtown.co.nz/',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://dealtown.co.nz/icons/apple-touch-icon.png',
                    width: 180,
                    height: 180
                  },
                  sameAs: [
                    // add if/when you create them:
                    // 'https://www.facebook.com/DealTownNZ',
                    // 'https://www.instagram.com/dealtown_nz'
                  ]
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://dealtown.co.nz/#website',
                  url: 'https://dealtown.co.nz/',
                  name: 'DealTown',
                  publisher: { '@id': 'https://dealtown.co.nz/#org' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://dealtown.co.nz/?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                  }
                }
              ]
            })
          }}
        />
      </head>
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
