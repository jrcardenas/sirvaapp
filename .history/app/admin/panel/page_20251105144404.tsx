"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOrderStore,
  PedidoItem,
} from "@/store/orderStore";

type GrupoPendientes = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
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

  const [mesaParaCobrar, setMesaParaCobrar] =
    useState<string | null>(null);

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

  // 🔔 Sonidos cliente
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

  // 🔄 Sincronización pedidos
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
    ([, m]) =>
      (m.items?.length ?? 0) > 0 ||
      m.llamada ||
      m.cuentaSolicitada
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
        <p className="text-center text-textMuted">
          No hay pedidos 😴
        </p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            // ✅ Agrupar todo
            const agrupados = Object.values(
              mesa.items.reduce(
                (
                  acc: Record<string, GrupoPendientes>,
                  item: PedidoItem
                ) => {
                  if (!acc[item.id]) {
                    acc[item.id] = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      qty: 0,
                      entregado: item.entregado,
                    };
                  }
                  acc[item.id].qty += 1;
                  return acc;
                },
                {}
              )
            );

            const totalCuenta = agrupados.reduce(
              (acc, i) => acc + i.price * i.qty,
              0
            );

            return (
              <div
                key={mesaId}
                className="p-4 rounded-xl shadow-md border border-border bg-surface"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">
                    Mesa {mesaId}
                  </h2>

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

                {/* ✅ Productos agrupados */}
                <div className="space-y-2 mb-4">
                  {agrupados.map((item) => (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                        item.entregado
                          ? "bg-green-100 border-green-300"
                          : "bg-yellow-100 border-yellow-300"
                      }`}
                    >
                      <span>{item.name}</span>

                      {!item.entregado ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              reducirItem(mesaId, item.id)
                            }
                            className="bg-red-500 text-white px-2 py-1 rounded-md"
                          >
                            ➖
                          </button>

                          <span className="font-bold">
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              incrementarItem(mesaId, item.id)
                            }
                            className="bg-green-600 text-white px-2 py-1 rounded-md"
                          >
                            ➕
                          </button>

                          <button
                            onClick={() =>
                              mesa.items
                                .filter(
                                  (p) =>
                                    p.id === item.id &&
                                    !p.entregado
                                )
                                .forEach((p) =>
                                  marcarServido(
                                    mesaId,
                                    p.timestamp
                                  )
                                )
                            }
                            className="bg-primary text-white px-2 py-1 rounded-md font-bold"
                          >
                            ✅ Servir
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-green-800">
                          ✅ Servido
                        </span>
                      )}
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
                  💳 Cobrar Mesa ({totalCuenta.toFixed(2)} €)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔹 Modal Cobro */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-gray-900 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">
              Confirmar Cobro - Mesa {mesaParaCobrar}
            </h3>

            {(() => {
              const mesa = mesas[mesaParaCobrar];
              const total = mesa.items.reduce(
                (acc, i) => acc + i.price,
                0
              );
              return (
                <p className="text-center text-xl font-bold mb-6">
                  Total: {total.toFixed(2)} €
                </p>
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
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
