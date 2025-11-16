"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

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
    atenderCuenta,
    addCustomProduct,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);

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
    const pedidos = new BroadcastChannel("pedidos_channel");

    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;

      if (data.mesas) useOrderStore.setState({ mesas: data.mesas });

      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo)) {
        dingRef.current?.play().catch(() => null);
      }
    };

    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada || m.cuentaSolicitada || m.cuentaEnProceso
  );

  const productosFiltrados = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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

      <h1 className="text-3xl font-bold text-center mb-6">📢 Panel Camarero</h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const agrupados = Object.values(
              mesa.items.reduce<Record<string, GrupoItem>>((acc, it) => {
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
              }, {})
            );

            const totalCuenta = agrupados.reduce(
              (a, i) => a + i.price * i.servidos,
              0
            );

            const allServed = agrupados.every(i => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
                <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

                {/* ✅ Llamada */}
                {mesa.llamada && (
                  <div className="bg-red-600 text-white p-3 rounded-xl mb-3 text-center font-bold animate-pulse flex justify-between items-center">
                    🚨 Mesa llamando al camarero
                    <button
                      onClick={() => {
                        atenderLlamada(mesaId);
                        enviarAvisoCliente(mesaId, "camareroEnCamino");
                      }}
                      className="bg-white text-red-600 px-2 py-1 rounded-lg font-bold"
                    >
                      ✅ Atender
                    </button>
                  </div>
                )}

                {/* ✅ Cuenta Solicitada */}
                {mesa.cuentaSolicitada && !mesa.cuentaEnProceso && (
                  <div className="bg-blue-600 text-white p-3 rounded-xl mb-3 text-center font-bold animate-pulse flex justify-between items-center">
                    💳 Mesa ha pedido la cuenta
                    <button
                      onClick={() => {
                        atenderCuenta(mesaId);
                        enviarAvisoCliente(mesaId, "cuentaEnCamino");
                      }}
                      className="bg-white text-blue-700 px-2 py-1 rounded-lg font-bold"
                    >
                      ✅ Preparar
                    </button>
                  </div>
                )}

                {/* ✅ Cuenta en preparación */}
                {mesa.cuentaEnProceso && !allServed && (
                  <div className="bg-purple-500 text-white p-3 rounded-xl mb-3 text-center font-bold animate-pulse">
                    ⏳ Preparando cuenta...
                  </div>
                )}

                {/* ✅ Pedidos pendientes */}
                {agrupados.filter(i => i.pendientes > 0).map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2">
                    <span className="font-semibold">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button className="bg-red-600 text-white px-2 rounded-lg"
                        onClick={() => reducirItem(mesaId, item.id)}>➖</button>

                      <span className="text-lg font-bold">{item.pendientes}</span>

                      <button className="bg-green-600 text-white px-2 rounded-lg"
                        onClick={() => incrementarItem(mesaId, item.id)}>➕</button>

                      <button
                        onClick={() => {
                          mesa.items
                            .filter(i => i.id === item.id && !i.entregado)
                            .forEach(i => marcarServido(mesaId, i.timestamp));

                          enviarAvisoCliente(mesaId, "pedidoEnCamino");
                        }}
                        className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                      >
                        ✅
                      </button>
                    </div>
                  </div>
                ))}

                {/* ✅ Servidos */}
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

                {/* ✅ Botón cobrar solo si ✅ está todo servido + cuenta en proceso */}
                {mesa.cuentaEnProceso && allServed && (
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

      {/* ✅ Modal cobro */}
      {mesaParaCobrar && (
        <ModalCobro mesaParaCobrar={mesaParaCobrar} setMesaParaCobrar={setMesaParaCobrar} />
      )}
    </main>
  );
}

/* ✅ Notificación al cliente */
function enviarAvisoCliente(mesaId: string, mensaje: string) {
  const notify = new BroadcastChannel("notify_channel");
  notify.postMessage({ mesaId, mensaje });
  notify.close();
}

/* ✅ Modal cobro */
function ModalCobro({
  mesaParaCobrar,
  setMesaParaCobrar,
}: {
  mesaParaCobrar: string;
  setMesaParaCobrar: (id: string | null) => void;
}) {
  const { mesas, cobrarMesa } = useOrderStore();
  const mesa = mesas[mesaParaCobrar];

  const itemsAgrupados = mesa.items.filter(i => i.entregado);

  const total = itemsAgrupados.reduce((a, i) => a + i.price, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">
        <h3 className="text-xl font-bold text-center mb-4">
          💳 Cobrar Mesa {mesaParaCobrar}
        </h3>

        <div className="max-h-40 overflow-y-auto mb-4 space-y-1 text-sm">
          {itemsAgrupados.map((i, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{i.name}</span>
              <span>{i.price.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 mb-6">
          <span>Total:</span>
          <span>{total.toFixed(2)} €</span>
        </div>

        <button
          className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg"
          onClick={() => {
            cobrarMesa(mesaParaCobrar);
            enviarAvisoCliente(mesaParaCobrar, "mesaCobrada");
            setMesaParaCobrar(null);
          }}
        >
          ✅ Confirmar Cobro
        </button>

        <button
          className="w-full bg-gray-300 py-3 rounded-xl font-semibold text-lg mt-2"
          onClick={() => setMesaParaCobrar(null)}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}
