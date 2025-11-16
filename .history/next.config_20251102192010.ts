"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";

export default function QRMesaPage() {
  const { id } = useParams() as { id: string };

  const LOCAL_IP = "192.168.0.17"; // ✅ tu IP del WiFi
  const PORT = 3000;

  const url = `http://${LOCAL_IP}:${PORT}/mesa/${id}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">QR Mesa {id}</h1>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <QRCode value={url} size={220} />
      </div>

      <p className="text-gray-600 text-center max-w-xs">
        Escanea este QR para ver el menú en tu móvil 📱🍽️
      </p>
    </main>
  );
}
