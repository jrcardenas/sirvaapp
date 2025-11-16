import type { Metadata } from "next";
import "./globals.css";
import "./styles/theme.css";
import { OrderProvider } from "@/context/OrderContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "SirvaApp",
  description: "Pide desde tu mesa. Sirve más rápido.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[var(--color-background)] text-[var(--color-text-dark)]">
        <OrderProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </OrderProvider>
      </body>
    </html>
  );
}
