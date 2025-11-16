"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

// ✅ Tipamos correctamente los items del store
type OrderItemType = {
  id: string;
  name: string;
  price: number;
  qty?: number;
  entregado: boolean;
  timestamp: number;
};

type MesaType = {
  items: OrderItemType[];
  llamada: boolean;
  cuentaSolicitada: boolean;
};

type ProductoMenu = { id: string; name: string; price: number };

type ItemAgrupado = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

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
  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ✅ Sync en tiempo real
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: { ...ev.data.mesas } });
      }
    };
    return () => pedidos.close();
  }, []);

  function enviarAvisoCliente(mesaId: string, mensaje: string) {
    const notify = new BroadcastChannel("notify_channel");
    notify.postMessage({ mesaId, mensaje });
    notify.close();
  }

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());
  const productosFiltrados: ProductoMenu[] = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const mesasOrdenadas = mesasIds.sort((a, b) => {
    const ma: MesaType = mesas[a] ?? { items: [], llamada: false, cuentaSolicitada: false };
    const mb: MesaType = mesas[b] ?? { items: [], llamada: false, cuentaSolicitada: false };

    const pa = (ma?.items ?? []).filter((i) => !i.entregado).length;
    const pb = (mb?.items ?? []).filter((i) => !i.entregado).length;

    if (ma.llamada !== mb.llamada) return ma.llamada ? -1 : 1;
    if (ma.cuentaSolicitada !== mb.cuentaSolicitada)
      return ma.cuentaSolicitada ? -1 : 1;
    if (pa !== pb) return pb - pa;

    const sa = (ma?.items ?? []).filter((i) => i.entregado).length;
    const sb = (mb?.items ?? []).filter((i) => i.entregado).length;
    return sb - sa;
  });

  return (
    <main className="min-h-screen bg-background p-5 pt-20 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        🛎️ Camarero
      </h1>

      <div className="space-y-4">
        {mesasOrdenadas.map((mesaId) => {
          const mesa: MesaType = mesas[mesaId] ?? {
            items: [],
            llamada: false,
            cuentaSolicitada: false,
          };

          const itemsMesa = mesa?.items ?? [];
          const pendientes = itemsMesa.filter((i) => !i.entregado);
          const servidos = itemsMesa.filter((i) => i.entregado);
          const allServed = pendientes.length === 0 && servidos.length > 0;

          const groupedPendientes: ItemAgrupado[] = Object.values(
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

          const groupedServidos: ItemAgrupado[] = Object.values(
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

              {/* ✅ Limpiar filtro al cambiar mesa */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                <button
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg font-bold"
                  onClick={() => {
                    if (mesaEditando === mesaId) {
                      setMesaEditando(null);
                    } else {
                      setMesaEditando(mesaId);
                      setSearch(""); // ✅ limpiar busqueda
                    }
                  }}
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
                      <span>{p.qty}x {p.name}</span>
                      {mesaEditando === mesaId ? (
                        <div className="flex gap-2">
                          <button
                            className="bg-red-600 text-white px-2 rounded-lg"
                            onClick={() => reducirItem(mesaId, p.id)}>
                            ➖
                          </button>
                          <button
                            className="bg-green-600 text-white px-2 rounded-lg"
                            onClick={() => incrementarItem(mesaId, p.id)}>
                            ➕
                          </button>
                          <button
                            className="bg-primary text-white px-2 rounded-lg"
                            onClick={() =>
                              pendientes
                                .filter((i) => i.id === p.id)
                                .forEach((i) => marcarServido(mesaId, i.timestamp))
                            }>
                            ✅
                          </button>
                        </div>
                      ) : <span>⏳</span>}
                    </div>
                  ))}
                </div>
              )}

              {groupedServidos.length > 0 && (
                <div className="bg-green-100 p-3 rounded-xl mt-3">
                  <h3 className="font-bold mb-2 text-green-800">✅ Servidos</h3>
                  {groupedServidos.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.qty}x {s.name}</span>
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
                        className="w-full text-left p-2 rounded-md bg-gray-100 hover:bg-gray-200 mb-1">
                        ➕ {p.name} — {p.price} €
                      </button>
                    ))}
                </div>
              )}

              {allServed && (
                <button
                  className="w-full mt-3 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => setMesaParaCobrar(mesaId)}>
                  💳 Cobrar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {mesaParaCobrar && (
        <ModalCobroEditable
          mesaId={mesaParaCobrar}
          setMesaParaCobrar={setMesaParaCobrar}
        />
      )}
    </main>
  );
}

/* ✅ Modal para revisar cuenta antes de cobrar */
function ModalCobroEditable({
  mesaId,
  setMesaParaCobrar,
}: {
  mesaId: string;
  setMesaParaCobrar: (v: string | null) => void;
}) {
  const { mesas, incrementarItem, reducirItem, cobrarMesa } = useOrderStore();
  const mesa: MesaType = mesas[mesaId];

  const itemsMesa = mesa?.items ?? [];

  const agrupados: ItemAgrupado[] = Object.values(
    itemsMesa
      .filter((i) => i.entregado)
      .reduce<Record<string, ItemAgrupado>>((acc, item) => {
        if (!acc[item.id])
          acc[item.id] = {
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 0,
          };
        acc[item.id].qty++;
        return acc;
      }, {})
  );

  const total = agrupados.reduce((a, i) => a + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">
        <h3 className="text-xl font-bold text-center mb-4">
          🧾 Revisar Cuenta — Mesa {mesaId}
        </h3>

        <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
          {agrupados.map((i) => (
            <div key={i.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <span className="flex-1">{i.name}</span>

              <div className="flex items-center gap-1">
                <button className="bg-red-600 text-white w-7 h-7 rounded-lg"
                  onClick={() => reducirItem(mesaId, i.id)}>
                  ➖
                </button>

                <span className="text-lg font-bold w-7 text-center">{i.qty}</span>

                <button className="bg-green-600 text-white w-7 h-7 rounded-lg"
                  onClick={() => incrementarItem(mesaId, i.id)}>
                  ➕
                </button>
              </div>

              <span className="ml-3 w-14 text-right font-semibold">
                {(i.price * i.qty).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg mb-6 border-t pt-2">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>

        <button
          className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg"
          onClick={() => {
            cobrarMesa(mesaId);
            const notify = new BroadcastChannel("notify_channel");
            notify.postMessage({ mesaId, mensaje: "mesaCobrada" });
            notify.close();
            setMesaParaCobrar(null);
          }}>
          ✅ Confirmar Cobro
        </button>

        <button
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold text-lg mt-2"
          onClick={() => setMesaParaCobrar(null)}>
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}
