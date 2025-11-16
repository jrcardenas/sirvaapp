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
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {pendientes} Pend.
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {pedidos.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                      item.entregado
                        ? "bg-green-100 border-green-300"
                        : "bg-yellow-100 border-yellow-300 animate-pulse"
                    }`}
                  >
                    <span>
                      {item.qty}x {item.name}
                    </span>

                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.entregado
                          ? "bg-gray-400 text-white"
                          : "bg-green-600 text-white"
                      }`}
                      onClick={() => marcarServido(mesaId, item.id)}
                    >
                      {item.entregado ? "✅ Servido" : "✔️ Marcar"}
                    </button>
                  </div>
                ))}
              </div>

              {/* ✅ Botón Cobrar Mesa */}
              <button
                onClick={() => cobrarMesa(mesaId)}
                className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold"
              >
                💳 Cobrar Mesa
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
