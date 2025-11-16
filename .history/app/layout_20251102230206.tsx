import type { Metadata } from "next";
import "./globals.css";
import "./styles/theme.css";
import Header from "@/components/layout/Header";
import CallWaiterToast from "@/components/ui/CallWaiterToast"; // ✅ IMPORTANTE

export const metadata: Metadata = {
  title: "SirvaApp",
  description: "Pide desde tu mesa. Sirve más rápido.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[var(--color-background)] text-[var(--color-text-dark)]">
        <Header />

        {/* ✅ Montamos el Toast en la app */}
        <CallWaiterToast />

        <main className="pt-16 pb-32 max-w-md mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
