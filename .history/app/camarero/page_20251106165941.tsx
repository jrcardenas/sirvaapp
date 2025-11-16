"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

export default function CamareroMovil() {
  const router = useRouter();
  const { mesas, marcarServido, addCustomProduct } = useOrderStore();

  const [selectedMesa, setSelectedMesa] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const mesasFijas = ["1", "2", "3", "4", "5", "6"];

  const getMesaState = (id: string) => mesas[id] ?? { items: [] };

  const getEstado = (mesaId: string) => {
    const mesa = getMesaState(mesaId);
    const pendientes = mesa.items.filter(i => !i.entregado).length;
    const servidos = mesa.items.filter(i => i.entregado).length;

    if (pendientes > 0) return "rojo";
    if (servidos > 0) return "amarillo";
    return "verde";
  };

  const servirTodo = (mesaId: string) => {
    const mesa = getMesaState(mesaId);
    mesa.items
      .filter(i => !i.entregado)
      .forEach(i => marcarServido(mesaId, i.timestamp));
    enviarAvisoCliente(mesaId, "pedidoEnCamino");
  };

  const productosFiltrados = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-5 pt-20 max-w-md mx-auto">
      <button
        onClick={() => router.push("/admin")}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        ◀ Volver
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">👨‍🍳 Camarero Móvil</h1>

      <div className="space-y-4">
        {mesasFijas.map((mesaId) => {
          const mesa = getMesaState(mesaId);
          const pendientes = mesa.items.filter(i => !i.entregado).length;
          const servidos = mesa.items.filter(i => i.entregado).length;

          return (
            <div
              key={mesaId}
              className="bg-white border rounded-2xl p-4 shadow"
              onClick={() => setSelectedMesa(mesaId)}
            >
              <h2 className="font-bold text-xl">Mesa {mesaId}</h2>

              <p className="text-sm mt-1">
                {pendientes > 0 && (
                  <span className="text-red-600 font-bold">⏳ {pendientes} pendientes</span>
                )}
                {pendientes === 0 && servidos > 0 && (
                  <span className="text-yellow-600 font-bold">🟡 Parcial servido</span>
                )}
                {pendientes === 0 && servidos === 0 && (
                  <span className="text-green-600 font-bold">✅ Sin pedidos</span>
                )}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMesa(mesaId);
                }}
                className="mt-2 bg-blue-600 w-full text-white py-2 rounded-lg font-bold"
              >
                ➕ Añadir producto
              </button>

              {pendientes > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    servirTodo(mesaId);
                  }}
                  className="mt-2 bg-green-600 w-full text-white py-2 rounded-lg font-bold"
                >
                  ✅ Servir todo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Añadir producto */}
      {selectedMesa && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-4 rounded-xl space-y-3 shadow-xl">
            <h3 className="text-center font-bold text-lg mb-2">
              ➕ Añadir producto a Mesa {selectedMesa}
            </h3>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full p-2 border rounded-lg"
              autoFocus
            />

            <div className="max-h-48 overflow-y-auto">
              {productosFiltrados.map((p) => (
                <button
                  key={p.id}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-200 rounded"
                  onClick={() => {
                    addCustomProduct(selectedMesa, p.name, p.price);
                    setSearch("");
                    setSelectedMesa(null);
                  }}
                >
                  {p.name} — {p.price.toFixed(2)} €
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedMesa(null);
                setSearch("");
              }}
              className="w-full bg-gray-300 py-2 rounded-lg font-semibold"
            >
              ❌ Cancelar
            </button>
          </div>
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
