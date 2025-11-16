"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";

type GrupoItem = {
  id: string;
  name: string;
  price: number;
  cantidad: number;
  estado: "pendienteCocina" | "preparando" | "preparado";
};

export default function CocinaPage() {
  const { mesas, actualizarEstadoItem } = useOrderStore();
  const [pedidosAgrupados, setPedidosAgrupados] = useState<
    Record<string, GrupoItem[]>
  >({});

  // 🔄 Sincronización en tiempo real segura
  useEffect(() => {
    const pedidosChannel = new BroadcastChannel("pedidos_channel");
    pedidosChannel.onmessage = (ev) => {
      if (ev.data?.mesas) {
        requestAnimationFrame(() => {
          useOrderStore.setState({ mesas: structuredClone(ev.data.mesas) });
        });
      }
    };
    return () => pedidosChannel.close();
  }, []);

  // 🧮 Agrupar pedidos que deben aparecer en cocina
  useEffect(() => {
    const agrupado: Record<string, GrupoItem[]> = {};

    for (const [mesaId, mesa] of Object.entries(mesas)) {
      if (!mesa?.items) continue;

      const itemsParaCocina = mesa.items.filter((i) =>
        ["pendienteCocina", "preparando", "preparado"].includes(i.estado ?? "")
      );

      const grupos = Object.values(
        itemsParaCocina.reduce<Record<string, GrupoItem>>((acc, it) => {
          const key = `${it.id}-${it.estado}`;
          if (!acc[key]) {
            acc[key] = {
              id: it.id,
              name: it.name,
              price: it.price,
              cantidad: 0,
              estado: it.estado as GrupoItem["estado"],
            };
          }
          acc[key].cantidad += 1;
          return acc;
        }, {})
      );

      if (grupos.length > 0) agrupado[mesaId] = grupos;
    }

    setPedidosAgrupados(agrupado);
  }, [mesas]);

  const mesasIds = Object.keys(pedidosAgrupados);

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">👨‍🍳 Cocina</h1>

      {mesasIds.length === 0 && (
        <p className="text-center text-gray-500">
          No hay pedidos pendientes en cocina
        </p>
      )}

      <div className="space-y-6">
        {mesasIds.map((mesaId) => (
          <div
            key={mesaId}
            className="p-4 rounded-2xl border shadow bg-white space-y-3"
          >
            <h2 className="text-xl font-bold mb-2">Mesa {mesaId}</h2>

            {pedidosAgrupados[mesaId].map((item) => (
              <div
                key={`${item.id}-${item.estado}`}
                className={`flex justify-between items-center p-3 rounded-xl mb-2 ${
                  item.estado === "pendienteCocina"
                    ? "bg-yellow-100 border-l-4 border-yellow-500"
                    : item.estado === "preparando"
                    ? "bg-orange-100 border-l-4 border-orange-500"
                    : "bg-green-100 border-l-4 border-green-600"
                }`}
              >
                <div>
                  <span className="font-semibold text-lg">{item.name}</span>
                  <p className="text-sm text-gray-600">
                    {item.cantidad}x — {item.price.toFixed(2)} €
                  </p>
                </div>

                <div className="flex gap-2">
                  {item.estado === "pendienteCocina" && (
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-yellow-600"
                      onClick={() =>
                        actualizarEstadoItemMesa(mesaId, item.id, "preparando")
                      }
                    >
                      🍳 Preparar
                    </button>
                  )}

                  {item.estado === "preparando" && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-700"
                      onClick={() =>
                        actualizarEstadoItemMesa(mesaId, item.id, "preparado")
                      }
                    >
                      ✅ Preparado
                    </button>
                  )}

                  {item.estado === "preparado" && (
                    <span className="text-green-700 font-bold">✔️ Listo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );

  // 🔧 Cambiar estado de todos los items de ese producto
  function actualizarEstadoItemMesa(
    mesaId: string,
    itemId: string,
    nuevoEstado: "pendienteCocina" | "preparando" | "preparado"
  ) {
    const mesa = mesas[mesaId];
    if (!mesa) return;

    mesa.items
      .filter(
        (i) =>
          i.id === itemId &&
          ["pendienteCocina", "preparando"].includes(i.estado ?? "")
      )
      .forEach((i) => actualizarEstadoItem(mesaId, i.timestamp, nuevoEstado));
  }
}
