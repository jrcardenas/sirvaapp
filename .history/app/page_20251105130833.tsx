"use client";

import QRCode from "react-qr-code";
import Link from "next/link";

export default function HomePage() {
  const mesas = [1, 2, 3, 4, 5, 6];

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : ""; // ✅ En SSR será string vacío → no renderiza QR

  return (
    <main className="min-h-screen flex flex-col items-center pt-28 pb-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Selecciona tu mesa 🪑</h1>

      <div className="grid grid-cols-2 gap-6 w-full px-4">
        {mesas.map((id) => {
          const qrUrl = origin ? `${origin}/mesa/${id}/menu` : null;

          return (
            <Link
              key={id}
              href={`/mesa/${id}/menu`}
              className="bg-white border shadow-lg rounded-xl flex flex-col items-center p-4 hover:scale-105 transition"
            >
              <div className="bg-white p-2 rounded-lg shadow">
                {qrUrl && <QRCode value={qrUrl} size={110} />} 
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
