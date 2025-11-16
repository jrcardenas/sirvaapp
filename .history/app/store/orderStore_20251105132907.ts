"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";

// ✅ Import dinámico del QR solo en cliente
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

export default function HomePage() {
  const mesas = [1, 2, 3, 4, 5, 6];

  // ✅ El cálculo del origin solo se hace en cliente, no hay HTML diferente entre server y client
  const origin = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center pt-28 pb-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Selecciona tu mesa 🪑</h1>

      <div className="grid grid-cols-2 gap-6 w-full px-4">
        {mesas.map((id) => {
          const qrUrl = `${origin}/mesa/${id}/menu`;

          return (
            <Link
              key={id}
              href={`/mesa/${id}/menu`}
              className="bg-white border shadow-xl rounded-xl flex flex-col items-center p-4 hover:scale-105 transition"
            >
              <div className="bg-white p-2 rounded-lg shadow">
                {origin && <QRCode value={qrUrl} size={110} />}
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
