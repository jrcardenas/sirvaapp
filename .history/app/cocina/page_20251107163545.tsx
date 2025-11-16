"use client";

import { useEffect, useMemo } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

export default function CocinaPage() {
  const { mesas, actualizarEstadoItem } = useOrderStore();

  // 🔄 Mantener sincronización en tiempo real
  useEffect(() => {
    const pedidosChannel = new BroadcastChannel("pedidos_channel");
    pedidosChannel.onmessage = (ev) => {
      if (ev.data?.mesas) {
        // Evita colisiones con Zustand persist
        requestAnimationFrame(() => {
          useOrderStore.setState({ mesas: structuredClone(ev.data.mesas) });
        });
      }
    };
    return () => pedidosChannel.close();
  }, []);

  // 🧮 Derivar pedidos confirmados/en cocina/listos de forma segura
  const pedidos = useMemo(() => {
    if (!mesas || typeof mesas !== "object") return [];

    const lista: (PedidoItem & { mesaId: string })[] = [];
    for (const [mesaId, mesa] of Object.entries(mesas)) {
      if (!mesa?.items) continue;
      mesa.items.forEach((item) => {
        if (
          item.estado === "confirmado" ||
          item.estado === "enCocina" ||
          item.estado === "listo"
        ) {
          lista.push({ ...item, mesaId });
        }
      });
    }
    // Orden opcional por tiempo
    return lista.sort((a, b) => a.timestamp - b.timestamp);
  }, [mesas]);

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">👨‍🍳 Panel de Cocina</h1>

      {pedidos.length === 0 && (
        <p className="text-center text-gray-500">
          No hay pedidos confirmados aún
        </p>
      )}

      <div className="space-y-4">
        {pedidos.map((p) => (
          <div
            key={`${p.mesaId}-${p.timestamp}`}
            className={`p-4 rounded-2xl border shadow bg-white space-y-2 transition-all ${
              p.estado === "enCocina"
                ? "border-yellow-400 bg-yellow-50"
                : p.estado === "listo"
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{p.name}</h2>
              <span className="text-sm text-gray-600">Mesa {p.mesaId}</span>
            </div>

            <p className="text-gray-700 font-semibold">{p.price.toFixed(2)} €</p>

            <div className="flex justify-end gap-2">
              {p.estado === "confirmado" && (
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded-xl font-semibold hover:bg-yellow-600"
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId, p.timestamp, "enCocina")
                  }
                >
                  🍳 En cocina
                </button>
              )}

              {p.estado === "enCocina" && (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded-xl font-semibold hover:bg-green-700"
                  onClick={() =>
                    actualizarEstadoItem(p.mesaId, p.timestamp, "listo")
                  }
                >
                  ✅ Listo
                </button>
              )}

              {p.estado === "listo" && (
                <span className="text-green-700 font-semibold">
                  ✔️ Listo para servir
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
