"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

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

  // Sincronización con BroadcastChannel
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

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">
      <h1 className="text-3xl font-bold text-center mb-6">📢 Panel Administración</h1>

      <div className="space-y-6">
        {mesasIds.map((mesaId) => {
          const mesa = mesas[mesaId];
          if (!mesa) return null;

          const total = mesa.items.reduce(
            (a, i) => a + (i.entregado ? i.price : 0),
            0
          );

          return (
            <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
              <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

              {mesa.items
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
                        onClick={() => marcarServido(mesaId, item.timestamp)}
                      >
                        ✅
                      </button>
                    </div>
                  </div>
                ))}

              {total > 0 && (
                <button
                  className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => setMesaParaCobrar(mesaId)}
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
