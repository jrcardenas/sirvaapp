"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPage() {
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();
  const [selectedMesa, setSelectedMesa] = useState<string | null>(null);
  const [ding] = useState(() => new Audio("/sounds/ding.mp3"));

  // ✅ Sonido al recibir pedidos nuevos
  useEffect(() => {
    ding.volume = 0.6;
    ding.currentTime = 0;
    ding.play().catch(() => null);
  }, [mesas]);

  const mesasActivas = Object.entries(mesas).filter(
    ([, pedidos]) => pedidos.length > 0
  );

  return (
    <main className="min-h-screen bg-zinc-100 p-5 pt-24 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📢 Panel Camarero</h1>

      {mesasActivas.length === 0 && (
        <p className="text-center text-gray-500">
          No hay pedidos por ahora 😴
        </p>
      )}

      <div className="space-y-6">
        {mesasActivas.map(([mesaId, pedidos]) => {
          const pendientes = pedidos.filter((p) => !p.entregado).length;

          return (
            <div key={mesaId} className="bg-white p-4 rounded-xl shadow-md border">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                {/* ✅ Badge de pedidos pendientes */}
                {pendientes > 0 && (
                  <span className=
