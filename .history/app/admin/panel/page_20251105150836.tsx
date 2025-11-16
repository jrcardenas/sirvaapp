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
        if (ev.data?.nuevoPedido) dingRef.current?.play().catch(() => null);
      }
    };
    return () => bc.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada
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

            const allServed = agrupados.every(i => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                  {mesa.llamada && (
                    <span className="bg-danger text-white px-3 py-1 rounded-full animate-pulse">
                      🛎 Llamando
                    </span>
                  )}
                </div>

                {/* 🟡 Pendientes editables */}
                {agrupados
                  .filter((i) => i.pendientes > 0)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2">
                      <span className="font-semibold">{item.name}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => reducirItem(mesaId, item.id)}
                          className="bg-red-600 text-white px-2 rounded-lg"
                        >
                          ➖
                        </button>

                        <span className="text-lg font-bold">
                          {item.pendientes}
                        </span>

                        <button
                          onClick={() => incrementarItem(mesaId, item.id)}
                          className="bg-green-600 text-white px-2 rounded-lg"
                        >
                          ➕
                        </button>

                        <button
                          onClick={() =>
                            mesa.items
                              .filter(
                                (i) => i.id === item.id && !i.entregado
                              )
                              .forEach((i) => marcarServido(mesaId, i.timestamp))
                          }
                          className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                        >
                          ✅
                        </button>
                      </div>
                    </div>
                  ))}

                {/* ✅ Servidos resumen */}
                {agrupados.some(i => i.servidos > 0) && (
                  <div className="bg-green-100 p-3 rounded-xl mt-3">
                    <h4 className="font-bold text-green-800 mb-1">✅ Servido:</h4>
                    {agrupados.filter(i => i.servidos > 0).map(i => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span>{i.servidos}x {i.name}</span>
                        <span>{(i.servidos * i.price).toFixed(2)} €</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t mt-2 pt-1 text-green-900">
                      <span>Total:</span>
                      <span>{totalCuenta.toFixed(2)} €</span>
                    </div>
                  </div>
                )}

                {/* BOTÓN COBRAR */}
                {allServed && (
                  <button
                    onClick={() => setMesaParaCobrar(mesaId)}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  >
                    💳 Cobrar {totalCuenta.toFixed(2)} €
                  </button>
                )}

                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full mt-2 bg-blue-600 text-white py-2 rounded-xl font-bold"
                  >
                    👋 Atender llamada
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}
{/* ✅ MODAL COBRO COMPLETA Y CORRECTA */}
{mesaParaCobrar && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">

      {/* Título */}
      <h3 className="text-xl font-bold text-center mb-4">
        💳 Cobrar Mesa {mesaParaCobrar}
      </h3>

      {(() => {
        const mesa = mesas[mesaParaCobrar];

        // ✅ Agrupamos correctamente por cantidad servida
        const itemsAgrupados = Object.values(
          mesa.items.reduce((acc: any, item: PedidoItem) => {
            if (!acc[item.id]) {
              acc[item.id] = {
                id: item.id,
                name: item.name,
                price: item.price,
                qty: 0,
              };
            }
            acc[item.id].qty += item.qty;
            return acc;
          }, {})
        );

        const total = itemsAgrupados.reduce(
          (acc, i) => acc + i.qty * i.price,
          0
        );

        return (
          <>
            {/* ✅ Listado con scroll si es largo */}
            <div className="max-h-40 overflow-y-auto mb-4 space-y-1 text-sm">
              {itemsAgrupados.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.qty}x {i.name}</span>
                  <span>{(i.qty * i.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            {/* ✅ Total bien calculado */}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 mb-6">
              <span>Total:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </>
        );
      })()}

      {/* ✅ Botones */}
      <div className="flex flex-col gap-2">
        <button
          className="bg-primary text-white py-3 rounded-xl font-bold text-lg"
          onClick={() => {
            cobrarMesa(mesaParaCobrar);
            setMesaParaCobrar(null);
          }}
        >
          ✅ Confirmar Cobro
        </button>

        <button
          className="bg-gray-300 py-3 rounded-xl font-semibold text-lg"
          onClick={() => setMesaParaCobrar(null)}
        >
          ❌ Cancelar
        </button>

        <button
          disabled
          className="bg-blue-600 text-white py-3 rounded-xl font-bold opacity-50 cursor-not-allowed text-lg"
        >
          🧾 Imprimir Ticket (Próximamente)
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}
