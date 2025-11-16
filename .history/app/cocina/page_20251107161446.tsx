"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

export default function CocinaPage() {
  const { mesas, actualizarEstadoItem } = useOrderStore();
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);

  useEffect(() => {
    // 🔄 sincronización en tiempo real
    const canal = new BroadcastChannel("pedidos_channel");
    canal.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: structuredClone(ev.data.mesas) });
      }
    };
    return () => canal.close();
  }, []);

  // 🧩 Extraemos los pedidos pendientes o en cocina
  useEffect(() => {
    const lista: PedidoItem[] = [];
    Object.entries(mesas).forEach(([mesaId, mesa]) => {
      mesa.items
        ?.filter((i) => !i.entregado && (i.estado === "pendiente" || i.estado === "enCocina"))
        .forEach((i) =>
          lista.push({
            ...i,
            mesaId,
          })
        );
    });
    setPedidos(lista);
  }, [mesas]);

  return (
    <main className="min-h-screen bg-background p-5 pt-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">👨‍🍳 Cocina</h1>

      {pedidos.length === 0 && (
        <p className="text-center text-gray-500">No hay pedidos pendientes</p>
      )}

      <div className="grid gap-4">
        {pedidos.map((p) => (
          <div
            key={p.timestamp}
            className={`p-4 rounded-2xl shadow ${
              p.estado === "enCocina"
                ? "bg-yellow-100 border-yellow-300"
                : "bg-white border"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <span className="text-sm text-gray-500">Mesa {p.mesaId}</span>
            </div>

            <p className="text-gray-600 text-sm mt-1">{p.price} €</p>

            <div className="flex justify-end gap-2 mt-3">
              {p.estado === "pendiente" && (
                <button
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId!, p.timestamp, "enCocina")
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                >
                  🍳 En cocina
                </button>
              )}

              {p.estado === "enCocina" && (
                <button
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId!, p.timestamp, "listo")
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
