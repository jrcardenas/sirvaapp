"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";

type GrupoItem = {
  id: string;
  name: string;
  price: number;
  pendientes: number;
  servidos: number;
};

export default function AdminPanel() {
  const router = useRouter();
  const {
    mesas,
    marcarServido,
    incrementarItem,
    reducirItem,
    cobrarMesa,
    atenderLlamada,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const dingRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 Preparar sonido
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current!.volume = 1;
  }, []);

  // 🔐 Proteger acceso
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // 🔄 Sync entre pestañas
  useEffect(() => {
    const bc = new BroadcastChannel("pedidos_channel");
    bc.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: ev.data.mesas });
        if (ev.data?.nuevoPedido) dingRef.current?.play().catch(() => null);
      }
    };
    return () => bc.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada || m.cuentaSolicitada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

      {/* 🔓 Salir */}
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
            const agrupados = Object.values(
              mesa.items.reduce(
                (acc: Record<string, GrupoItem>, it: PedidoItem) => {
                  if (!acc[it.id]) {
                    acc[it.id] = {
                      id: it.id,
                      name: it.name,
                      price: it.price,
                      pendientes: 0,
                      servidos: 0,
                    };
                  }
                  it.entregado ? acc[it.id].servidos++ : acc[it.id].pendientes++;
                  return acc;
                },
                {}
              )
            );

            const totalCuenta = agrupados.reduce(
              (acc, i) => acc + i.price * i.servidos,
              0
            );

            return (
              <div
                key={mesaId}
                className="p-4 rounded-xl shadow-md border border-border bg-surface"
              >
                <div className="flex justify-between mb-3">
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

                {/* 🍽️ Items agrupados  */}
                <div className="space-y-2 mb-4">
                  {agrupados.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-yellow-100 rounded-lg border border-yellow-300"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{item.name}</span>

                        {item.pendientes > 0 ? (
                          <div className="flex items-center gap-2">

                            {/* ➖ */}
                            <button
                              onClick={() => reducirItem(mesaId, item.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                            >
                              ➖
                            </button>

                            <span className="font-bold">{item.pendientes}</span>

                            {/* ➕ */}
                            <button
                              onClick={() => incrementarItem(mesaId, item.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded-md"
                            >
                              ➕
                            </button>

                            {/* ✅ Servir todos */}
                            <button
                              onClick={() =>
                                mesa.items
                                  .filter(
                                    (i) =>
                                      i.id === item.id && !i.entregado
                                  )
                                  .forEach((i) =>
                                    marcarServido(mesaId, i.timestamp)
                                  )
                              }
                              className="bg-primary text-white px-2 py-1 rounded-md font-bold"
                            >
                              ✅ Servir
                            </button>
                          </div>
                        ) : (
                          <span className="text-green-700 font-bold">
                            ✅ Servidos: {item.servidos}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💳 Cobrar */}
                <button
                  onClick={() => setMesaParaCobrar(mesaId)}
                  className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                >
                  💳 Cobrar — {totalCuenta.toFixed(2)} €
                </button>

                {/* Atender llamada */}
                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full mt-2 bg-primary text-white py-2 rounded-xl font-bold"
                  >
                    👋 Atender llamada
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Modal Cobro */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-gray-900 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">
              Confirmar Cobro - Mesa {mesaParaCobrar}
            </h3>

            {(() => {
              const mesa = mesas[mesaParaCobrar];
              const itemsAgrupados = Object.values(
                mesa.items
                  .filter((i) => i.entregado)
                  .reduce((acc: any, item: PedidoItem) => {
                    if (!acc[item.id]) {
                      acc[item.id] = {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        qty: 0,
                      };
                    }
                    acc[item.id].qty++;
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
                        <span>{i.qty}x {i.name}</span>
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
    </main>
  );
}
