"use client";

import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import ViewOrderButton from "@/components/ViewOrderButton";

export default function MenuPage() {
  const { addItem, changeQty, items } = useCartStore();

  const productos = [
    { id: "1", nombre: "Cerveza", precio: 2.0 },
    { id: "2", nombre: "Coca-Cola", precio: 2.2 },
    { id: "3", nombre: "Tortilla", precio: 3.5 },
    { id: "4", nombre: "Patatas Bravas", precio: 4.0 },
  ];

  // ✅ Ahora suma TODAS las unidades de ese producto (aunque tenga notas o múltiples entradas)
  const getQty = (id: string) =>
    items.reduce((acc, p) => (p.id === id ? acc + p.qty : acc), 0);

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6 pb-20">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-6">
        Menú
      </h1>

      <div className="grid gap-4 max-w-md mx-auto">
        {productos.map((item) => {
          const qty = getQty(item.id);

          return (
            <div
              key={item.id}
              className="bg-[var(--color-surface)] shadow-md rounded-[var(--radius)] px-4 py-3 flex justify-between items-center border border-gray-200"
            >
              {/* Nombre + Precio */}
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-text-dark)]">
                  {item.nombre}
                </span>
                <span className="text-[var(--color-text-dark)] opacity-70 text-sm">
                  {item.precio.toFixed(2)} €
                </span>
              </div>

              {/* Controles siempre visibles */}
              <div className="flex items-center gap-2">
                {/* Botón - (deshabilitado si qty=0) */}
                <button
                  className={`w-8 h-8 rounded-full text-lg font-bold flex items-center justify-center
                  ${qty === 0 ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-black"}`}
                  disabled={qty === 0}
                  onClick={() => changeQty(item.id, qty - 1)}
                >
                  -
                </button>

                {/* Cantidad */}
                <span className="font-semibold w-6 text-center text-lg">
                  {qty}
                </span>

                {/* Botón + */}
                <button
                  className="w-8 h-8 bg-blue-600 text-white rounded-full text-lg font-bold flex items-center justify-center"
                  onClick={() =>
                    addItem({
                      id: item.id,
                      name: item.nombre,
                      price: item.precio,
                      qty: 1,
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Botón flotante Carrito */}
      <ViewOrderButton />
    </main>
  );
}
