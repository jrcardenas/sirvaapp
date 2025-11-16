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

  const getQty = (id: string) =>
    items.find((p) => p.id === id && !p.note)?.qty ?? 0;

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6 text-[var(--color-text-dark)]">
        Menú 🍽
      </h1>

      <div className="grid gap-4 max-w-md mx-auto">
        {productos.map((item) => {
          const qty = getQty(item.id);

          return (
            <div
              key={item.id}
              className="bg-[var(--color-surface)] shadow-md rounded-[var(--radius)] px-4 py-3 border border-gray-200"
            >
              {/* Nombre y precio */}
              <div className="flex justify-between mb-3">
                <div>
                  <p className="font-bold text-[var(--color-text-dark)]">
                    {item.nombre}
                  </p>
                  <p className="opacity-70 text-sm">
                    {item.precio.toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* Botón o contador */}
              {qty === 0 ? (
                <Button
                  fullWidth
                  onClick={() =>
                    addItem({
                      id: item.id,
                      name: item.nombre,
                      price: item.precio,
                      qty: 1,
                    })
                  }
                >
                  Añadir
                </Button>
              ) : (
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
                  {/* Botón - */}
                  <button
                    className="w-9 h-9 flex items-center justify-center 
                    bg-[var(--color-secondary)] text-white rounded-full text-lg font-bold"
                    onClick={() => changeQty(item.id, qty - 1)}
                  >
                    -
                  </button>

                  {/* Cantidad */}
                  <span className="font-bold text-lg">{qty}</span>

                  {/* Botón + */}
                  <button
                    className="w-9 h-9 flex items-center justify-center 
                    bg-[var(--color-primary)] text-white rounded-full text-lg font-bold"
                    onClick={() =>
                      changeQty(item.id, qty + 1)
                    }
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón flotante carrito */}
      <ViewOrderButton />
    </main>
  );
}
