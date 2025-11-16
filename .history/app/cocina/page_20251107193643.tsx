"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

export default function CocinaPage() {
  const { mesas, actualizarEstadoItem } = useOrderStore();
  const [pedidos, setPedidos] = useState<(PedidoItem & { mesaId: string })[]>([]);

  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data?.mesas) return;
      useOrderStore.setState({ mesas: structuredClone(data.mesas) });
    };
    return () => pedidos.close();
  }, []);

  useEffect(() => {
    const lista: (PedidoItem & { mesaId: string })[] = [];
    Object.entries(mesas).forEach(([mesaId, mesa]) => {
      mesa.items.forEach((item) => {
        if (["confirmado", "enCocina", "listo"].includes(item.estado ?? "")) {
          lista.push({ ...item, mesaId });
        }
      });
    });
    setPedidos(lista);
  }, [mesas]);

  return (
    <main className="min-h-screen bg-orange-50 p-6 pt-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">👨‍🍳 Cocina</h1>

      <div className="grid gap-4">
        {pedidos.map((p) => (
          <div
            key={p.timestamp}
            className="bg-white rounded-2xl p-4 shadow border flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-gray-500">Mesa {p.mesaId}</p>
              <p className="text-xs italic text-gray-600">Estado: {p.estado}</p>
            </div>

            <div className="flex flex-col gap-2">
              {p.estado === "confirmado" && (
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg font-bold"
                  onClick={() => actualizarEstadoItem(p.mesaId, p.timestamp, "enCocina")}
                >
                  👨‍🍳 Preparando
                </button>
              )}
              {p.estado === "enCocina" && (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold"
                  onClick={() => actualizarEstadoItem(p.mesaId, p.timestamp, "listo")}
                >
                  🍽️ Listo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
