"use client";
import QRCode from "qrcode.react";
import { useParams } from "next/navigation";

export default function QRMesaPage() {
  const { id } = useParams() as { id: string };

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/mesa/${id}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Mesa {id}</h1>

      <QRCode value={url} size={220} level="H" includeMargin />

      <p className="text-gray-600 text-center max-w-xs">
        Escanea el código con tu móvil para ver el menú y hacer tu pedido 🍽️
      </p>
    </main>
  );
}
