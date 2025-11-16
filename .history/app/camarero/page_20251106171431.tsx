"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function CamareroPage() {
  const router = useRouter();
  const { mesas, marcarServido, atenderLlamada, atenderCuenta, cobrarMesa } =
    useOrderStore();

  // ✅ ESCUCHAR actualizaciones de tiempo real
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;

      if (data.mesas) {
        // ✅ Forzamos nueva referencia para re-render automático
        useOrderStore.setState({ mesas: { ...data.mesas } });
      }
    };

    return () => pedidos.close();
  }, []);

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">🛎️ Servicio en Sala</h1>

      <div className="space-y-4">
        {mesasIds.map((mesaId) => {
          const mesa = mesas[mesaId] || {
            items: [],
            llamada: false,
            cuentaSolicitada: false,
          };

          const pendientes = mesa.items.filter((i) => !i.entregado).length;
          const servidos = mesa.items.filter((i) => i.entregado).length;

          const total = mesa.items
            .filter((i) => i.entregado)
            .reduce((a, i) => a + i.price, 0);

          const allServed = pendientes === 0 && servidos > 0;

          return (
            <div
              key={mesaId}
              className="p-4 rounded-2xl border shadow bg-white space-y-2"
            >
              <h2 className="text-xl font-bold flex justify-between">
                Mesa {mesaId}
              </h2>

              <div className="text-sm">
                {pendientes > 0 && (
                  <p className="text-red-600 font-bold">
                    🔴 Pendientes: {pendientes}
                  </p>
                )}
                {servidos > 0 && (
                  <p className="text-green-700 font-bold">
                    ✅ Servidos: {servidos}
                  </p>
                )}
                {mesa.cuentaSolicitada && (
                  <p className="text-blue-700 font-bold animate-pulse">
                    💳 Cuenta solicitada
                  </p>
                )}
                {mesa.llamada && (
                  <p className="text-red-700 font-bold animate-pulse">
                    🚨 Llamando al camarero
                  </p>
                )}
                {total > 0 && (
                  <p className="font-bold">
                    💶 Total: {total.toFixed(2)} €
                  </p>
                )}
                {pendientes === 0 && servidos === 0 && (
                  <p className="text-gray-500">Ningún pedido aún</p>
                )}
              </div>

              {/* Botones rápidos */}
              <div className="flex flex-wrap gap-2">
                {mesa.llamada && (
                  <button
                    className="bg-red-600 text-white px-3 py-2 rounded-xl"
                    onClick={() => atenderLlamada(mesaId)}
                  >
                    ✅ Atender llamada
                  </button>
                )}

                {pendientes > 0 && (
                  <button
                    className="bg-primary text-white px-3 py-2 rounded-xl"
                    onClick={() =>
                      mesa.items
                        .filter((i) => !i.entregado)
                        .forEach((i) => marcarServido(mesaId, i.timestamp))
                    }
                  >
                    ✅ Servir pendientes
                  </button>
                )}

                {allServed && (
                  <button
                    className="bg-blue-600 text-white px-3 py-2 rounded-xl animate-pulse"
                    onClick={() => cobrarMesa(mesaId)}
                  >
                    💳 Cobrar
                  </button>
                )}

                <button
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-xl"
                  onClick={() => router.push(`/admin?mesa=${mesaId}`)}
                >
                  🔎 Ver detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
