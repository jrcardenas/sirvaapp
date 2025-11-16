"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

export default function AdminPanel() {
  const router = useRouter();
  const {
    mesas,
    confirmarItem,
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
      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo))
        dingRef.current?.play().catch(() => null);
    };
    return () => pedidos.close();
  }, []);

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">
      <h1 className="text-3xl font-bold text-center mb-6">🍸 Barra / Administración</h1>

      <div className="space-y-6">
        {Object.entries(mesas).map(([mesaId, mesa]) => (
          <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
            <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

            {(mesa.items ?? []).map((i) => (
              <div
                key={i.timestamp}
                className="flex justify-between items-center p-3 rounded-xl mb-2"
                style={{
                  backgroundColor:
                    i.estado === "pendiente"
                      ? "#fef3c7"
                      : i.estado === "confirmado"
                      ? "#dbeafe"
                      : i.estado === "enCocina"
                      ? "#fde68a"
                      : "#dcfce7",
                }}
              >
                <span className="font-semibold">
                  {i.name}{" "}
                  <span className="text-xs italic text-gray-600">({i.estado})</span>
                </span>

                <div className="flex items-center gap-2">
                  {i.estado === "pendiente" && (
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold"
                      onClick={() => confirmarItem(mesaId, i.timestamp)}
                    >
                      ✅
                    </button>
                  )}

                  {i.estado === "listo" && !i.entregado && (
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded-lg font-bold"
                      onClick={() => marcarServido(mesaId, i.timestamp)}
                    >
                      🍽️ Servido
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
