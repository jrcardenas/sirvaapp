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
  estado?: PedidoItem["estado"];
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
      if (["nuevoPedido", "pedidoEnPreparacion", "pedidoListo", "llamada", "cuenta"].includes(data.tipo))
        dingRef.current?.play().catch(() => null);
    };
    return () => pedidos.close();
  }, []);

  function enviarAvisoCliente(mesaId: string, mensaje: string) {
    const notify = new BroadcastChannel("notify_channel");
    notify.postMessage({ mesaId, mensaje });
    notify.close();
  }

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());

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
        {mesasIds.map((mesaId) => {
          const mesa = mesas[mesaId] ?? { items: [], llamada: false, cuentaSolicitada: false };

          const grupos = mesa.items.reduce<Record<string, GrupoItem>>((acc, it) => {
            if (!acc[it.id]) {
              acc[it.id] = { id: it.id, name: it.name, price: it.price, pendientes: 0, servidos: 0, estado: it.estado };
            }
            if (it.entregado) acc[it.id].servidos++;
            else acc[it.id].pendientes++;
            return acc;
          }, {});

          const items = Object.values(grupos);

          return (
            <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
              <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

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

              {items
                .filter((i) => i.pendientes > 0)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-3 rounded-xl mb-2 ${
                      item.estado === "pendienteCocina"
                        ? "bg-yellow-100"
                        : item.estado === "enCocina"
                        ? "bg-orange-100"
                        : item.estado === "listo"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm text-gray-600 capitalize">{item.estado}</span>
                    <span className="font-bold">{item.pendientes}x</span>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
