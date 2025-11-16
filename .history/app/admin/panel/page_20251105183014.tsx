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

      if (data.tipo === "llamada") {
        dingRef.current?.play().catch(() => null);
      }
    };

    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada || m.cuentaSolicitada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

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

            const allServed = agrupados.every(i => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
                <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

                {mesa.llamada && (
                  <div className="bg-red-600 text-white p-3 rounded-xl mb-3 text-center font-bold animate-pulse flex justify-between items-center">
                    🚨 Mesa llamando al camarero
                    <button
                      onClick={() => {
                        atenderLlamada(mesaId);
                        enviarAvisoCliente(mesaId, "camareroEnCamino"); // ✅ FIX
                      }}
                      className="bg-white text-red-600 px-2 py-1 rounded-lg font-bold"
                    >
                      ✅ Atender
                    </button>
                  </div>
                )}

                {agrupados.filter(i => i.pendientes > 0).map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2">
                    <span className="font-semibold">{item.name}</span>
                    <button
                      className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                      onClick={() => {
                        mesa.items
                          .filter(i => i.id === item.id && !i.entregado)
                          .forEach(i => marcarServido(mesaId, i.timestamp));

                        enviarAvisoCliente(mesaId, "pedidoEnCamino");
                      }}
                    >
                      ✅
                    </button>
                  </div>
                ))}

                {allServed && (
                  <button
                    onClick={() => setMesaParaCobrar(mesaId)}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  >
                    💳 Cobrar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function enviarAvisoCliente(mesaId: string, mensaje: string) {
  const notify = new BroadcastChannel("notify_channel");
  notify.postMessage({ mesaId, mensaje });
  notify.close();
}
