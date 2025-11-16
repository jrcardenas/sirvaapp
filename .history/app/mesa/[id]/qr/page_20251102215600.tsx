"use client";

import QRCode from "react-qr-code";
import Link from "next/link";

export default function HomePage() {
  const localIP = "192.168.0.17"; // ✅ Cambia si tu IP local cambia

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const isDev =
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("0.") ||
    hostname.startsWith("192.") ||
    hostname.startsWith("10.");

  const baseUrl = isDev
    ? `http://${localIP}:3000`
    : `https://${hostname}`;

  const mesas = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex flex-col items-center pt-20 pb-10">
      <h1 className="text-3xl font-bold text-[var(--color-text-dark)] mb-6">
        Selecciona tu mesa 🪑
      </h1>

      <div className="grid grid-cols-2 gap-6 max-w-md w-full px-4">
        {mesas.map((mesa) => {
          const url = `${baseUrl}/mesa/${mesa.id}/menu`;

          return (
            <Link
              key={mesa.id}
              href={`/mesa/${mesa.id}/menu`}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md 
                         rounded-xl flex flex-col items-center p-4 hover:scale-105 transition"
            >
              <div className="bg-white p-2 rounded-lg shadow">
                <QRCode value={url} size={100} />
              </div>

              <span className="text-[var(--color-text-dark)] font-semibold mt-2">
                Mesa {mesa.id}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mt-6">
        Escanea o toca la mesa para continuar 📱
      </p>
    </main>
  );
}
