"use client";

import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";

export default function CuentaPage() {
  const { mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const mesa = mesas[mesaId] || { items: [] };

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

  return (
    <main className="min-h-screen bg-white p-5 max-w-md mx-auto pt-20 pb-20 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Cuenta Mesa {mesaId}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No hay pedidos todavía 🍽️</p>
      ) : (
        <div className="space-y-3">
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
                  {i.qty}x {i.name}{" "}
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

      {/* Total */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
          <div className="max-w-md mx-auto p-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      )}
    </main>
  );
}
