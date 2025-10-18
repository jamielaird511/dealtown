// src/app/layout.tsx
import "./globals.css";
import Footer from "@/components/Footer";
import DealTownHeader from "@/components/DealTownHeader";

export const metadata = {
  title: 'DealTown — Local deals in one place',
  description: 'All the best local deals in one place. Local deals, updated daily.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <DealTownHeader />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
