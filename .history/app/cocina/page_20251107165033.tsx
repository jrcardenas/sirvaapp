"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

type GrupoItem = {
  id: string;
  name: string;
  price: number;
  pendientes: number;
  servidos: number;
};

type MenuItemType = {
  id: string;
  name: string;
  price: number;
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
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current.volume = 1;
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
      if (!data?.mesas) return;
      useOrderStore.setState({ mesas: structuredClone(data.mesas) });
      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo)) {
        dingRef.current?.play().catch(() => null);
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
  const mesasOrdenadas = mesasIds.sort();

  const productosFiltrados: MenuItemType[] = MENU_ITEMS.filter((p) =>
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

      <h1 className="text-3xl font-bold text-center mb-6">
        📢 Panel Administración
      </h1>

      <div className="space-y-6">
        {mesasOrdenadas.map((mesaId) => {
          const mesa = mesas[mesaId] ?? {
            items: [] as PedidoItem[],
            llamada: false,
            cuentaSolicitada: false,
          };

          const agrupados = Object.values(
            (mesa.items ?? []).reduce<Record<string, GrupoItem>>((acc, it) => {
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

          const allServed = agrupados.every((i) => i.pendientes === 0);
          const totalCuenta = agrupados.reduce(
            (a, i) => a + i.price * i.servidos,
            0
          );

          return (
            <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
              <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

              {/* 🚨 Llamada */}
              {mesa.llamada && (
                <div className="bg-red-600 text-white p-3 rounded-xl mb-3 animate-pulse flex justify-between">
                  🚨 Llamando al camarero
                  <button
                    className="bg-white text-red-600 px-2 py-1 rounded-lg font-bold"
                    onClick={() => {
                      atenderLlamada(mesaId);
                      enviarAvisoCliente(mesaId, "camareroEnCamino");
                    }}
                  >
                    ✅
                  </button>
                </div>
              )}

              {/* 💳 Cuenta */}
              {mesa.cuentaSolicitada && (
                <div className="bg-blue-600 text-white p-3 rounded-xl mb-3 animate-pulse flex justify-between">
                  💳 Ha pedido la cuenta
                  <button
                    className="bg-white text-blue-700 px-2 py-1 rounded-lg font-bold"
                    onClick={() => {
                      atenderCuenta(mesaId);
                      enviarAvisoCliente(mesaId, "cuentaEnCamino");
                    }}
                  >
                    ✅
                  </button>
                </div>
              )}

              {/* 🟡 Pedidos activos */}
              {(mesa.items ?? [])
                .filter((i) => !i.entregado)
                .map((item) => (
                  <div
                    key={item.timestamp}
                    className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2"
                  >
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-600 italic">
                        {item.estado === "confirmado"
                          ? "✅ Confirmado"
                          : item.estado === "enCocina"
                          ? "👨‍🍳 En cocina"
                          : item.estado === "listo"
                          ? "🍽️ Listo"
                          : "🕓 Pendiente"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="bg-red-600 text-white px-2 rounded-lg"
                        onClick={() => reducirItem(mesaId, item.id)}
                      >
                        ➖
                      </button>
                      <button
                        className="bg-green-600 text-white px-2 rounded-lg"
                        onClick={() => incrementarItem(mesaId, item.id)}
                      >
                        ➕
                      </button>
                      <button
                        className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                        onClick={() => {
                          marcarServido(mesaId, item.timestamp);
                          enviarAvisoCliente(mesaId, "pedidoEnCamino");
                        }}
                      >
                        ✅
                      </button>
                    </div>
                  </div>
                ))}

              {/* 💳 Cobrar */}
              {allServed && agrupados.some((i) => i.servidos > 0) && (
                <button
                  className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => setMesaParaCobrar(mesaId)}
                >
                  💳 Cobrar {totalCuenta.toFixed(2)} €
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
