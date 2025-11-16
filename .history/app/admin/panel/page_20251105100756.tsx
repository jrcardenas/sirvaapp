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

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

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

            // ✅ Agrupar items completos (para ver cuenta)
            const agrupadosCuenta = Object.values(
              mesa.items.reduce((acc, item) => {
                if (!acc[item.id]) {
                  acc[item.id] = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    qty: 0
                  };
                }
                acc[item.id].qty++;
                return acc;
              }, {} as any)
            );

            // ✅ Agrupar solo pendientes para servir
            const pendientesAgrupados = pendientes.reduce((acc, item) => {
              if (!acc[item.id]) {
                acc[item.id] = {
                  id: item.id,
                  name: item.name,
                  qty: 0,
                  timestamps: [],
                };
              }
              acc[item.id].qty++;
              acc[item.id].timestamps.push(item.timestamp);
              return acc;
            }, {} as any);

            const mostrarCuentaCompleta =
              mesa.cuentaSolicitada || pendientes.length === 0;

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
                </div>

                {/* ✅ Mostrar cuenta completa si se solicitó cuenta o todo servido */}
                {mostrarCuentaCompleta ? (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-800">🧾 Cuenta completa</h3>
                    {agrupadosCuenta.map((item: any) => (
                      <div key={item.id}
                        className="flex justify-between text-sm py-1">
                        <span>{item.qty}x {item.name}</span>
                        <span>{(item.price * item.qty).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ✅ Mostrar pendientes si existen */
                  <div className="space-y-2 mb-4">
                    {Object.values(pendientesAgrupados).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded-lg border bg-yellow-100 border-yellow-300 text-sm"
                      >
                        <span>{item.qty}x {item.name}</span>

                        {/* ✅ Servir todas esas unidades */}
                        <button
                          onClick={() =>
                            item.timestamps.forEach((ts: number) =>
                              marcarServido(mesaId, ts)
                            )
                          }
                          className="px-2 py-1 text-xs bg-primary text-white rounded-lg font-semibold"
                        >
                          ✅ Servido
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Botones administración */}
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

                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                >
                  💳 Cobrar Mesa
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
