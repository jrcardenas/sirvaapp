"use client";

import { useEffect, useMemo } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

export default function CocinaPage() {
  const { mesas, actualizarEstadoItem } = useOrderStore();

  // 🔄 Sincronización con BroadcastChannel
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: structuredClone(ev.data.mesas) });
      }
    };
    return () => pedidos.close();
  }, []);

  // 🧮 Derivamos los pedidos pendientes directamente con useMemo
  const pendientes = useMemo(() => {
    const lista: (PedidoItem & { mesaId: string })[] = [];
    Object.entries(mesas).forEach(([mesaId, mesa]) => {
      mesa.items.forEach((item) => {
        if (!item.entregado && item.estado !== "listo") {
          lista.push({ ...item, mesaId });
        }
      });
    });
    return lista;
  }, [mesas]);

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">👨‍🍳 Cocina</h1>

      {pendientes.length === 0 && (
        <p className="text-center text-gray-500">No hay pedidos pendientes</p>
      )}

      <div className="grid gap-4">
        {pendientes.map((p) => (
          <div
            key={p.timestamp}
            className={`p-4 rounded-2xl shadow border ${
              p.estado === "enCocina"
                ? "bg-yellow-100 border-yellow-400"
                : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <span className="text-sm text-gray-500">Mesa {p.mesaId}</span>
            </div>

            <p className="text-gray-700 text-sm mb-3">{p.price.toFixed(2)} €</p>

            <div className="flex justify-end gap-2">
              {p.estado === "pendiente" && (
                <button
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId, p.timestamp, "enCocina")
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                >
                  🍳 En cocina
                </button>
              )}

              {p.estado === "enCocina" && (
                <button
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId, p.timestamp, "listo")
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded-lg"
                >
                  ✅ Listo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
