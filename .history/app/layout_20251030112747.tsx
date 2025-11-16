import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "./context/OrderContext"; // ✅ Mantener

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SirvaApp",
  description: "Pide desde tu mesa. Sirve más rápido.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-background)] text-[var(--color-text-dark)]`}
      >
        <OrderProvider>
          {/* ✅ Wrapper para simetría en todo */}
          <div className="max-w-md mx-auto px-6 py-4 min-h-screen flex flex-col">
            {children}
          </div>
        </OrderProvider>
      </body>
    </html>
  );
}
