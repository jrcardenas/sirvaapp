"use client";
import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false, // ✅ Esto evita el error de hidratación
});

export const ClientQRCode = QRCode;
