import type { Metadata } from "next";
import "./globals.css";
import "./styles/theme.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "SirvaApp",
  description: "Pide desde tu mesa. Sirve más rápido.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[var(--color-background)] text-[var(--color-text-dark)]">
        {/* ✅ Navegación principal arriba */}
        <Header />

        {/* ✅ Espacio suficiente para footer del*
