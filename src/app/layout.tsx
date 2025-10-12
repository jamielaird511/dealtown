// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "DealTown",
  description: "Today's deals and local fuel prices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
