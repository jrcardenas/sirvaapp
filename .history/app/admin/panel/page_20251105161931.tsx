"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu"; // ✅ Añadimos menú base

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
    addCustomProduct,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string | null>(null);

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

  const mesasActivas = Object.entries(mesas);

  const productosFiltrados = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarDesdeMenu = (mesaId: string, prod: any) => {
    useOrderStore.getState().addToMesa(mesaId, [
      { ...prod, qty: 1 } as PedidoItem,
    ]);
    setBusqueda("");
    setMesaSeleccionada(null);
  };

  const agregarNuevo = (mesaId: string) => {
    const precio = Number(prompt("Precio del producto (€):") || 0);
    if (!precio) return;
    addCustomProduct(mesaId, busqueda.trim(), precio);

    setBusqueda("");
    setMesaSeleccionada(null);
  };

  return (
    <main className="min-h-screen bg-white p-5 pt-24 max-w-lg mx-auto relative">
      
      {/* ✅ HEADER */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">
        📢 Panel Camarero
      </h1>

      {mesasActivas.map(([mesaId, mesa]) => {
        const agrupados = Object.values(
          mesa.items.reduce((acc: any, it: PedidoItem) => {
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

        const total = agrupados.reduce((a: number, i: any) => a + i.price * i.servidos, 0);

        return (
          <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white mb-6">

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

              <button
                className="text-white bg-blue-600 px-3 py-1 rounded-xl font-bold"
                onClick={() => setMesaSeleccionada(mesaId)}
              >
                ➕ Añadir
              </button>
            </div>

            {/* ✅ Buscador de productos */}
            {mesaSeleccionada === mesaId && (
              <div className="bg-gray-100 p-3 rounded-xl mb-4">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full p-2 border rounded-lg mb-2"
                />

                {/* Productos filtrados del menú */}
                {productosFiltrados.map((p) => (
                  <button
                    key={p.id}
                    className="w-full bg-white border mb-2 p-2 rounded-lg text-left"
                    onClick={() => agregarDesdeMenu(mesaId, p)}
                  >
                    {p.name} — {p.price.toFixed(2)} €
                  </button>
                ))}

                {/* Crear nuevo personalizado */}
                {busqueda && productosFiltrados.length === 0 && (
                  <button
                    className="w-full bg-green-600 text-white mt-2 py-2 rounded-lg font-bold"
                    onClick={() => agregarNuevo(mesaId)}
                  >
                    ➕ Crear “{busqueda}”
                  </button>
                )}

                <button
                  className="w-full bg-gray-300 py-2 rounded-lg mt-2"
                  onClick={() => {
                    setMesaSeleccionada(null);
                    setBusqueda("");
                  }}
                >
                  ❌ Cerrar
                </button>
              </div>
            )}

            {/* ✅ Pendientes */}
            {agrupados.filter(i => i.pendientes > 0).map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2">
                <span>{item.name}</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-red-600 text-white px-2 rounded-lg"
                    onClick={() => reducirItem(mesaId, item.id)}>➖</button>
                  <span className="font-bold">{item.pendientes}</span>
                  <button className="bg-green-600 text-white px-2 rounded-lg"
                    onClick={() => incrementarItem(mesaId, item.id)}>➕</button>
                  <button
                    className="bg-green-800 text-white px-3 py-1 rounded-lg font-bold"
                    onClick={() =>
                      mesa.items
                        .filter(i => i.id === item.id && !i.entregado)
                        .forEach(i => useOrderStore.getState().marcarServido(mesaId, i.timestamp))
                    }
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

            {/* ✅ Cobrar */}
            {agrupados.every(i => i.pendientes === 0) && (
              <button
                className="w-full mt-4 bg-green-700 text-white py-3 rounded-xl font-bold"
                onClick={() => setMesaParaCobrar(mesaId)}
              >
                💳 Cobrar {total.toFixed(2)} €
              </button>
            )}
          </div>
        );
      })}

      {/* ✅ Modal Cobro */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-80">

            <h3 className="text-xl font-bold text-center mb-4">
              💳 Cobrar Mesa {mesaParaCobrar}
            </h3>

            <button
              className="bg-green-600 text-white w-full py-3 rounded-lg font-bold"
              onClick={() => {
                cobrarMesa(mesaParaCobrar);
                setMesaParaCobrar(null);
              }}
            >
              ✅ Confirmar Pago
            </button>
            <button
              className="bg-gray-300 w-full mt-2 py-3 rounded-lg"
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
