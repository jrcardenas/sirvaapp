"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// 🧩 Cargar el QR SOLO en cliente (evita SSR del SVG)
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

export default function HomePage() {
  const mesas = [1, 2, 3, 4, 5, 6];

  // ✅ NO usamos setOrigin. Solo un flag de montaje (no da warning)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center pt-28 pb-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Selecciona tu mesa 🪑</h1>

      <div className="grid grid-cols-2 gap-6 w-full px-4">
        {mesas.map((id) => {
          // Solo calculamos la URL cuando ya está montado (cliente)
          const qrUrl = mounted ? `${window.location.origin}/mesa/${id}/menu` : "";

          return (
            <Link
              key={id}
              href={`/mesa/${id}/menu`}
              className="bg-white border shadow-xl rounded-xl flex flex-col items-center p-4 hover:scale-105 transition"
            >
              {/* 📦 Placeholder con tamaño fijo para evitar “layout shift” */}
              <div
                className="bg-white p-2 rounded-lg shadow flex items-center justify-center"
                style={{ width: 130, height: 130 }}
                suppressHydrationWarning
              >
                {/* ❗️Solo renderiza el QR en cliente cuando mounted === true */}
                {mounted ? (
                  <QRCode value={qrUrl} size={110} />
                ) : (
                  <span className="text-xs text-gray-400">Cargando QR…</span>
                )}
              </div>

              <span className="font-semibold mt-2 text-lg">Mesa {id}</span>
            </Link>
          );
        })}
      </div>

      <p className="text-xs mt-6 text-gray-500">
        Toca o escanea una mesa para empezar 📱
      </p>
    </main>
  );
}
