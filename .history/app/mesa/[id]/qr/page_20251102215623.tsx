"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";

export default function QRMesaPage() {
  const { id } = useParams() as { id: string };

  // ✅ Tu IP real en la red actual
  const localIP = "192.168.0.17"; // 👈 CAMBIA SOLO ESTO CUANDO CAMBIE LA IP

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const isDev =
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("0.") || // ✅ evita el problema del 0.0.0.0
    hostname.startsWith("192.") ||
    hostname.startsWith("10.");

  const baseUrl = isDev
    ? `http://${localIP}:3000` // ✅ usar IP local siempre en modo dev
    : `https://${hostname}`; // ✅ producción (cuando despliegues)

  const url = `${baseUrl}/mesa/${id}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">QR Mesa {id}</h1>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <QRCode value={url} size={220} />
      </div>

      <p className="text-gray-600 text-center max-w-xs">
        Escanea este QR para ver el menú en tu móvil 📱🍽️
      </p>

      <div className="text-xs text-gray-400 text-center break-all">
        {url}
      </div>
    </main>
  );
}
