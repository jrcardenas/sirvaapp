import LayoutWrapper from "@/app/components/layouts/LayoutWrapper";
import { OrderProvider } from "./context/OrderContext";

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
