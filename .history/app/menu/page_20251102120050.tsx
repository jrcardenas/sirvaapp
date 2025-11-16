"use client";

import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();
  const { addItem, changeQty, items, clearCart, removeItem } = useCartStore();

  const productos = [
    { id: "1", nombre: "Cerveza", precio: 2.0 },
    { id: "2", nombre: "Coca-Cola", precio: 2.2 },
    { id: "3", nombre: "Tortilla", precio: 3.5 },
    { id: "4", nombre: "Patatas Bravas", precio: 4.0 },
  ];

  const getQty = (id: string) =>
    items.reduce((acc, p) => (p.id === id ? acc + p.qty : acc), 0);

  const total = items.reduce(
    (acc, p) => acc + p.price * p.qty,
    0
  );

  const handleSendOrder = () => {
    if (items.length === 0) return;
    alert("✅ Pedido enviado a cocina!");
    clearCart();
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6 pb-32">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-6">
        Menú 🍽️
      </h1>

      <div className="grid gap-4 max-w-md mx-auto">
        {productos.map((item) => {
          const qty = getQty(item.id);

          const handleMinus = () => {
            if (qty <= 1) {
              removeItem(item.id);
            } else {
              changeQty(item.id, qty - 1);
            }
          };

          return (
            <div
              key={item.id}
              className="bg-white shadow rounded-lg px-4 py-3 flex justify-between items-center border border-gray-200"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-text-dark)]">
                  {item.nombre}
                </span>
                <span className="text-gray-600 text-sm">
                  {item.precio.toFixed(2)} €
                </span>
              </div>

              {/* Controles siempre visibles */}
              <div className="flex items-center gap-2">
                <button
                  className={`w-8 h-8 rounded-full text-lg font-bold flex items-center justify-center
                    ${qty === 0 ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-black"}`}
                  disabled={qty === 0}
                  onClick={handleMinus}
                >
                  -
                </button>

                <span
                  className={`w-6 text-center font-bold text-lg ${
                    qty === 0
                      ? "text-gray-400"
                      : "text-[var(--color-text-dark)]"
                  }`}
                >
                  {qty}
                </span>

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

      {/* ✅ Footer centrado y con mismo ancho que el menú */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-lg">
              Total:
            </span>

            <span
              className={`font-bold text-xl ${
                total === 0
                  ? "text-gray-400"
                  : "text-[var(--color-text-dark)]"
              }`}
            >
              {total.toFixed(2)} €
            </span>
          </div>

          <Button
            fullWidth
            disabled={total === 0}
            className={`${
              total === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : ""
            }`}
            onClick={handleSendOrder}
          >
            ✅ Enviar Pedido
          </Button>
        </div>
      </div>
    </main>
  );
}
