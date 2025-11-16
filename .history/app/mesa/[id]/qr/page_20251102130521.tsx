"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";

export default function QRMesaPage() {
  const { id } = useParams() as { id: string };

  // ✅ ¿Estamos en localhost o red local?
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.startsWith("127.") ||
      window.location.hostname.startsWith("10.") ||
      window.location.hostname.startsWith("192."));

  // ✅ Cambia esta IP si tu PC cambia de red
  const localNetworkUrl = "http://10.42.54.65:3000";

  // ✅ Selecciona origen correcto según entorno
  const baseUrl =
    typeof window !== "undefined"
      ? isLocal
        ? localNetworkUrl
        : window.location.origin
      : "";

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

      <p className="text-xs text-gray-400 text-center max-w-xs break-all mt-2">
        URL generada: {url}
      </p>
    </main>
  );
}
