"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

type ProductoExtra = { id: string; name: string; price: number };
type ItemAgrupado = { id: string; name: string; price: number; qty: number };

export default function CamareroPage() {
  const router = useRouter();
  const {
    mesas,
    marcarServido,
    incrementarItem,
    reducirItem,
    cobrarMesa,
    atenderLlamada,
    atenderCuenta,
    addCustomProduct,
  } = useOrderStore();

  const [mesaEditando, setMesaEditando] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ✅ Sincronización en vivo
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: { ...ev.data.mesas } });
      }
    };
    return () => pedidos.close();
  }, []);

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());
  const productosFiltrados: ProductoExtra[] = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function enviarAvisoCliente(mesaId: string, mensaje: string) {
    const notify = new BroadcastChannel("notify_channel");
    notify.postMessage({ mesaId, mensaje });
    notify.close();
  }

  // ✅ Orden automático por prioridad
  const mesasOrdenadas = mesasIds.sort((a, b) => {
    const ma = mesas[a] || { items: [], llamada: false, cuentaSolicitada: false };
    const mb = mesas[b] || { items: [], llamada: false, cuentaSolicitada: false };

    const pa = ma.items.filter((i) => !i.entregado).length;
    const pb = mb.items.filter((i) => !i.entregado).length;

    if (ma.llamada !== mb.llamada) return ma.llamada ? -1 : 1;
    if (ma.cuentaSolicitada !== mb.cuentaSolicitada)
      return ma.cuentaSolicitada ? -1 : 1;
    if (pa !== pb) return pb - pa;

    const sa = ma.items.filter((i) => i.entregado).length;
    const sb = mb.items.filter((i) => i.entregado).length;
    return sb - sa;
  });

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">🛎️ Servicio en Sala</h1>

      <div className="space-y-4">
        {mesasOrdenadas.map((mesaId) => {
          const mesa = mesas[mesaId] || {
            items: [],
            llamada: false,
            cuentaSolicitada: false,
          };

          const pendientes = mesa.items.filter((i) => !i.entregado);
          const servidos = mesa.items.filter((i) => i.entregado);

          const total = servidos.reduce((a, i) => a + i.price, 0);
          const allServed = pendientes.length === 0 && servidos.length > 0;

          const groupedPendientes = Object.values(
            pendientes.reduce<Record<string, ItemAgrupado>>((acc, it) => {
              if (!acc[it.id])
                acc[it.id] = {
                  id: it.id,
                  name: it.name,
                  price: it.price,
                  qty: 0,
                };
              acc[it.id].qty++;
              return acc;
            }, {})
          );

          const groupedServidos = Object.values(
            servidos.reduce<Record<string, ItemAgrupado>>((acc, it) => {
              if (!acc[it.id])
                acc[it.id] = {
                  id: it.id,
                  name: it.name,
                  price: it.price,
                  qty: 0,
                };
              acc[it.id].qty++;
              return acc;
            }, {})
          );

          return (
            <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                <button
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg font-bold"
                  onClick={() =>
                    setMesaEditando(mesaEditando === mesaId ? null : mesaId)
                  }
                >
                  ➕ Añadir producto
                </button>
              </div>

              {mesa.llamada && (
                <button
                  className="w-full bg-red-600 text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => {
                    atenderLlamada(mesaId);
                    enviarAvisoCliente(mesaId, "camareroEnCamino");
                  }}
                >
                  🚨 Atender llamada
                </button>
              )}

              {mesa.cuentaSolicitada && (
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => {
                    atenderCuenta(mesaId);
                    enviarAvisoCliente(mesaId, "cuentaEnCamino");
                  }}
                >
                  💳 Llevar cuenta
                </button>
              )}

              {groupedPendientes.length > 0 && (
                <div className="bg-yellow-100 p-3 rounded-xl mt-3">
                  <h3 className="font-bold mb-2 text-yellow-800">🟡 Pendientes</h3>
                  {groupedPendientes.map((p) => (
                    <div key={p.id} className="flex justify-between mb-1">
                      <span>
                        {p.qty}x {p.name}
                      </span>
                      {mesaEditando === mesaId ? (
                        <div className="flex gap-2">
                          <button
                            className="bg-red-600 text-white px-2 rounded-lg"
                            onClick={() => reducirItem(mesaId, p.id)}
                          >
                            ➖
                          </button>
                          <button
                            className="bg-green-600 text-white px-2 rounded-lg"
                            onClick={() => incrementarItem(mesaId, p.id)}
                          >
                            ➕
                          </button>
                          <button
                            className="bg-primary text-white px-2 rounded-lg"
                            onClick={() =>
                              pendientes
                                .filter((i) => i.id === p.id)
                                .forEach((i) =>
                                  marcarServido(mesaId, i.timestamp)
                                )
                            }
                          >
                            ✅
                          </button>
                        </div>
                      ) : (
                        <span>⏳</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {groupedServidos.length > 0 && (
                <div className="bg-green-100 p-3 rounded-xl mt-3">
                  <h3 className="font-bold mb-2 text-green-800">✅ Servidos</h3>
                  {groupedServidos.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>
                        {s.qty}x {s.name}
                      </span>
                      <span>{(s.qty * s.price).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              {mesaEditando === mesaId && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Añadir un producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-2 rounded-md border mb-2"
                  />

                  {search &&
                    productosFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addCustomProduct(mesaId, p.name, p.price)}
                        className="w-full text-left p-2 rounded-md bg-gray-100 hover:bg-gray-200 mb-1"
                      >
                        ➕ {p.name} — {p.price} €
                      </button>
                    ))}
                </div>
              )}

              {allServed && (
                <button
                  className="w-full mt-3 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => cobrarMesa(mesaId)}
                >
                  💳 Cobrar {total.toFixed(2)} €
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
