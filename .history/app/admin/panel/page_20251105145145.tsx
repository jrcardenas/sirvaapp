"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOrderStore,
  PedidoItem,
} from "@/store/orderStore";

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

  useEffect(() => {
    const bc = new BroadcastChannel("pedidos_channel");
    bc.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: ev.data.mesas });
        if (ev.data?.nuevoPedido)
          dingRef.current?.play().catch(() => null);
      }
    };
    return () => bc.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada || m.cuentaSolicitada
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
                  it.entregado
                    ? acc[it.id].servidos++
                    : acc[it.id].pendientes++;
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
                </div>

                {/* ✅ Items agrupados */}
                <div className="space-y-2 mb-4">
                  {agrupados.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-yellow-100 rounded-lg border border-yellow-300"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          {item.name}
                        </span>

                        {/* ✅ Se puede editar si hay pendientes */}
                        {item.pendientes > 0 ? (
                          <div className="flex items-center gap-2">

                            <button
                              onClick={() => reducirItem(mesaId, item.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                            >
                              ➖
                            </button>

                            <span className="font-bold">{item.pendientes}</span>

                            <button
                              onClick={() => incrementarItem(mesaId, item.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded-md"
                            >
                              ➕
                            </button>

                            <button
                              onClick={() =>
                                mesa.items
                                  .filter(
                                    (i) =>
                                      i.id === item.id &&
                                      !i.entregado
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
                          <span className="text-green-600 font-bold">
                            ✅ Servidos: {item.servidos}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setMesaParaCobrar(mesaId)}
                  className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                >
                  💳 Cobrar — {totalCuenta.toFixed(2)} €
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Modal cobro */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80">
            <h3 className="text-lg font-bold text-center mb-4">
              Cobrar Mesa {mesaParaCobrar}
            </h3>

            {(() => {
              const mesa = mesas[mesaParaCobrar];
              const total = mesa.items
                .filter((i) => i.entregado)
                .reduce((acc, i) => acc + i.price, 0);

              return (
                <p className="text-xl font-bold text-center mb-6">
                  Total: {total.toFixed(2)} €
                </p>
              );
            })()}

            <button
              className="bg-primary text-white py-2 rounded-lg font-bold mb-2"
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
      )}
    </main>
  );
}
