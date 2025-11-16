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
    addCustomProduct, // ✅ NUEVO
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [mesaAdding, setMesaAdding] = useState<string | null>(null); // ✅ Mesa donde se añade producto

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

  const handleAddCustom = (mesaId: string) => {
    if (!nuevoNombre.trim() || !Number(nuevoPrecio)) return;

    addCustomProduct(mesaId, nuevoNombre.trim(), Number(nuevoPrecio));
    setNuevoNombre("");
    setNuevoPrecio("");
    setMesaAdding(null);
  };

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

            const totalCuenta = agrupados.reduce((a, i) => a + i.price * i.servidos, 0);
            const allServed = agrupados.every(i => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                </div>

                {/* Pendientes */}
                {agrupados.filter(i => i.pendientes > 0).map(item => (
                  <div key={item.id}
                    className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button className="bg-red-600 text-white px-2 rounded-lg"
                        onClick={() => reducirItem(mesaId, item.id)}
                      >➖</button>
                      <span className="text-lg font-bold">{item.pendientes}</span>
                      <button className="bg-green-600 text-white px-2 rounded-lg"
                        onClick={() => incrementarItem(mesaId, item.id)}
                      >➕</button>
                      <button
                        onClick={() =>
                          mesa.items
                            .filter(i => i.id === item.id && !i.entregado)
                            .forEach(i => marcarServido(mesaId, i.timestamp))
                        }
                        className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                      >
                        ✅
                      </button>
                    </div>
                  </div>
                ))}

                {/* Servidos */}
                {agrupados.some(i => i.servidos > 0) && (
                  <div className="bg-green-100 p-3 rounded-xl mt-3">
                    {agrupados.filter(i => i.servidos > 0).map(i => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span>{i.servidos}x {i.name}</span>
                        <span>{(i.servidos * i.price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Añadir producto personalizado */}
                {mesaAdding === mesaId ? (
                  <div className="mt-3 p-3 bg-gray-100 rounded-xl space-y-2">
                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="w-full p-2 rounded-md border"
                    />
                    <input
                      type="number"
                      placeholder="Precio (€)"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                      className="w-full p-2 rounded-md border"
                    />
                    <button
                      onClick={() => handleAddCustom(mesaId)}
                      className="w-full bg-primary text-white py-2 rounded-xl font-bold"
                    >
                      ✅ Agregar a Mesa
                    </button>
                    <button
                      onClick={() => setMesaAdding(null)}
                      className="w-full bg-gray-300 py-2 rounded-xl font-semibold"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMesaAdding(mesaId)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold mt-3"
                  >
                    ➕ Añadir producto personalizado
                  </button>
                )}

                {/* Botón Cobrar */}
                {allServed && (
                  <button
                    onClick={() => setMesaParaCobrar(mesaId)}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  >
                    💳 Cobrar {totalCuenta.toFixed(2)} €
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cobro */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">
            <h3 className="text-xl font-bold text-center mb-4">
              💳 Cobrar Mesa {mesaParaCobrar}
            </h3>

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
              className="bg-gray-300 py-3 rounded-xl font-semibold text-lg mt-2"
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
