// src/app/layout.tsx
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "DealTown",
  description: "Today's deals and local fuel prices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
