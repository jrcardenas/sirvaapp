"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada, atenderCuenta } =
    useOrderStore();

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 1;
  }, []);

  // ✅ Proteger acceso admin
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // ✅ Sonido: llamada o pedir cuenta del cliente
  useEffect(() => {
    const notify = new BroadcastChannel("notify_channel");
    notify.onmessage = (ev) => {
      const data = ev.data || {};
      if (data.llamada === true || data.cuentaSolicitada === true) {
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => notify.close();
  }, []);

  // ✅ Sync + sonido solo nuevo pedido
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data || {};
      if (data.mesas) {
        useOrderStore.setState({ mesas: data.mesas });
        if (data.nuevoPedido === true) {
          dingRef.current?.play().catch(() => null);
        }
      }
    };
    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) =>
      (mesa.items?.length ?? 0) > 0 ||
      mesa.llamada ||
      mesa.cuentaSolicitada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
        📢 Panel Camarero
      </h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = mesa.items.filter(i => !i.entregado);

            // ✅ Agrupar por producto pendiente
            const pendientesAgrupados = pendientes.reduce((acc, item) => {
              if (!acc[item.id]) {
                acc[item.id] = {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  qty: 0,
                  timestamps: [],
                };
              }

              acc[item.id].qty++;
              acc[item.id].timestamps.push(item.timestamp);

              return acc;
            }, {} as Record<
              string,
              { id: string; name: string; price: number; qty: number; timestamps: number[] }
            >);

            return (
              <div key={mesaId} className="p-4 rounded-xl shadow-md border border-border bg-surface">

                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                  {mesa.llamada && (
                    <span className="bg-danger text-white py-1 px-3 rounded-full animate-pulse">
                      🛎 Llamando
                    </span>
                  )}

                  {mesa.cuentaSolicitada && (
                    <span className="bg-blue-600 text-white py-1 px-3 rounded-full animate-pulse">
                      💳 Cuenta
                    </span>
                  )}

                  {!mesa.llamada && !mesa.cuentaSolicitada && pendientes.length > 0 && (
                    <span className="bg-accent text-white py-1 px-3 rounded-full animate-pulse">
                      {pendientes.length} Pend.
                    </span>
                  )}
                </div>

                {/* ✅ Lista de items agrupados */}
                {pendientes.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {Object.values(pendientesAgrupados).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded-lg border bg-yellow-100 border-yellow-300 text-sm"
                      >
                        <span>{item.qty}x {item.name}</span>

                        {/* ✅ Servir TODAS las unidades de ese producto */}
                        <button
                          onClick={() => {
                            item.timestamps.forEach((ts) =>
                              marcarServido(mesaId, ts)
                            );
                          }}
                          className="px-2 py-1 text-xs bg-primary text-white rounded-lg font-semibold"
                        >
                          ✅ Servido
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botones de acción */}
                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full bg-primary text-white py-2 rounded-xl font-bold mb-2"
                  >
                    👋 Atender llamada
                  </button>
                )}

                {mesa.cuentaSolicitada && (
                  <button
                    onClick={() => atenderCuenta(mesaId)}
                    className="w-full bg-blue-700 text-white py-2 rounded-xl font-bold mb-2"
                  >
                    ✅ Cuenta atendida
                  </button>
                )}

                {!mesa.llamada && (
                  <button
                    onClick={() => cobrarMesa(mesaId)}
                    className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                  >
                    💳 Cobrar Mesa
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
