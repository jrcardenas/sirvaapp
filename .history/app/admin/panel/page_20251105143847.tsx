"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

type GrupoCuenta = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current!.volume = 1;
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  useEffect(() => {
    const notify = new BroadcastChannel("notify_channel");
    notify.onmessage = (ev) => {
      const data = ev.data;
      if (data?.llamada || data?.cuentaSolicitada) {
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => notify.close();
  }, []);

  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (data?.mesas) {
        useOrderStore.setState({ mesas: data.mesas });
        if (data?.nuevoPedido) {
          dingRef.current?.play().catch(() => null);
        }
      }
    };
    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) =>
      (mesa.items?.length ?? 0) > 0 || mesa.llamada || mesa.cuentaSolicitada
  );

  return (
    <>
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
              const agrupadosCuenta = Object.values(
                mesa.items.reduce((acc: Record<string, GrupoCuenta>, item: PedidoItem) => {
                  if (!acc[item.id]) {
                    acc[item.id] = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      qty: 0
                    };
                  }
                  acc[item.id].qty += 1;
                  return acc;
                }, {})
              );

              const totalCuenta = agrupadosCuenta.reduce(
                (acc, item) => acc + item.price * item.qty,
                0
              );

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
                        💳 Cuenta pedida
                      </span>
                    )}
                  </div>

                  {/* ✅ Siempre mostrar todos los productos */}
                  <div className="space-y-2 mb-4">
                    {mesa.items.map((item) => (
                      <div
                        key={item.timestamp}
                        className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                          item.entregado
                            ? "bg-green-100 border-green-300"
                            : "bg-yellow-100 border-yellow-300"
                        }`}
                      >
                        <span>
                          {item.name} {item.entregado && "✅"}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              marcarServido(mesaId, item.timestamp)
                            }
                            className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                              item.entregado
                                ? "bg-orange-500 text-white"
                                : "bg-primary text-white"
                            }`}
                          >
                            {item.entregado ? "↩ Deshacer" : "✅ Servir"}
                          </button>

                          <button
                            onClick={() => {
                              const updated = mesa.items.filter(
                                (i) => i.timestamp !== item.timestamp
                              );
                              useOrderStore.setState({
                                mesas: {
                                  ...mesas,
                                  [mesaId]: { ...mesa, items: updated },
                                },
                              });
                            }}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg font-bold"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {mesa.llamada && (
                    <button
                      onClick={() => atenderLlamada(mesaId)}
                      className="w-full bg-primary text-white py-2 rounded-xl font-bold mb-2"
                    >
                      👋 Atender llamada
                    </button>
                  )}

                  <button
                    onClick={() => setMesaParaCobrar(mesaId)}
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

      {/* ✅ Modal Cobro con Total */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-gray-900 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">
              Confirmar Cobro - Mesa {mesaParaCobrar}
            </h3>

            {(() => {
              const mesa = mesas[mesaParaCobrar];
              const itemsAgrupados = Object.values(
                mesa.items.reduce((acc: Record<string, GrupoCuenta>, item: PedidoItem) => {
                  if (!acc[item.id]) {
                    acc[item.id] = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      qty: 0,
                    };
                  }
                  acc[item.id].qty += 1;
                  return acc;
                }, {})
              );
              const total = itemsAgrupados.reduce(
                (acc, i) => acc + i.price * i.qty,
                0
              );

              return (
                <>
                  <div className="max-h-40 overflow-y-auto mb-4 space-y-1 text-sm">
                    {itemsAgrupados.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>
                          {i.qty}x {i.name}
                        </span>
                        <span>{(i.price * i.qty).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mb-5">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </>
              );
            })()}

            <div className="flex flex-col gap-2">
              <button
                className="bg-primary text-white py-2 rounded-lg font-bold"
                onClick={() => {
                  cobrarMesa(mesaParaCobrar);
                  setMesaParaCobrar(null);
                }}
              >
                ✅ Confirmar Cobro
              </button>

              <button
                className="bg-gray-300 py-2 rounded-lg font-semibold"
                onClick={() => setMesaParaCobrar(null)}
              >
                ❌ Cancelar
              </button>

              <button className="bg-blue-600 text-white py-2 rounded-lg font-bold opacity-60 cursor-not-allowed">
                🧾 Imprimir Ticket (Próximamente)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
