"use client";

import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CuentaPage() {
  const { mesas, pedirCuenta } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [cuentaSolicitada, setCuentaSolicitada] = useState(false);

  // ✅ Sync en tiempo real para actualizar pedido del camarero
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");

    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: ev.data.mesas });
      }
    };

    return () => pedidos.close();
  }, []);

  const mesa = mesas[mesaId] || { items: [], llamada: false, cuenta: false };
  const items: PedidoItem[] = mesa.items || [];

  const itemsAgrupados = Object.values(
    items.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 0,
          entregados: 0,
        };
      }
      acc[item.id].qty++;
      if (item.entregado) acc[item.id].entregados++;
      return acc;
    }, {} as Record<string, { id: string; name: string; price: number; qty: number; entregados: number }>)
  );

  const total = itemsAgrupados.reduce(
    (acc, i) => acc + i.qty * i.price,
    0
  );

  const handlePedirCuenta = () => {
    pedirCuenta(mesaId);
    setCuentaSolicitada(true);

    // ✅ Avisar al camarero con audio
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.postMessage({
      tipo: "cuenta",
      mesaId,
      mesas: useOrderStore.getState().mesas,
    });
    pedidos.close();
  };

  return (
    <main className="min-h-screen bg-white p-5 max-w-md mx-auto pt-20 pb-40 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Cuenta Mesa {mesaId}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No hay pedidos todavía 🍽️</p>
      ) : (
        <div className="space-y-3 mb-24">
          {itemsAgrupados.map((i) => {
            const pendientes = i.qty - i.entregados;
            const todosServidos = pendientes === 0;
            return (
              <div
                key={i.id}
                className={`flex justify-between items-center p-3 rounded-lg shadow-sm border text-sm ${
                  todosServidos
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-yellow-100 border-yellow-300 text-yellow-800 animate-pulse"
                }`}
              >
                <span>
                  {i.qty}x {i.name}
                  {!todosServidos ? (
                    <span className="font-semibold ml-1">
                      ⏳ {pendientes} pendiente(s)
                    </span>
                  ) : (
                    <span className="font-semibold ml-1">✅</span>
                  )}
                </span>
                <span className="font-bold">
                  {(i.price * i.qty).toFixed(2)} €
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Zona fija inferior con total + botón pedir cuenta  */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl">
          <div className="max-w-md mx-auto p-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            {!mesa.cuenta && !cuentaSolicitada ? (
              <button
                onClick={handlePedirCuenta}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg animate-pulse"
              >
                📢 Pedir la cuenta
              </button>
            ) : (
              <div className="text-center bg-green-100 text-green-700 p-3 rounded-xl font-bold">
                ✅ Cuenta solicitada — en camino
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
