"use client";

import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();
  const { addItem, changeQty, items, clearCart, removeItem } = useCartStore();
const productos = [
  // 🥤 BEBIDAS
  { id: "1", categoria: "Bebidas", nombre: "Cerveza", precio: 2.0, img: "/images/cerveza.png" },
  { id: "2", categoria: "Bebidas", nombre: "Coca-Cola", precio: 2.2, img: "/images/coca.png" },
  { id: "3", categoria: "Bebidas", nombre: "Agua", precio: 1.5, img: "/images/agua.png" },
  { id: "4", categoria: "Bebidas", nombre: "Tinto de Verano", precio: 2.8, img: "/images/tinto.png" },
  { id: "5", categoria: "Bebidas", nombre: "Café con Leche", precio: 1.5, img: "/images/cafe.png" },

  // 🍽️ TAPAS
  { id: "6", categoria: "Tapas", nombre: "Patatas Bravas", precio: 4.0, img: "/images/bravas.png" },
  { id: "7", categoria: "Tapas", nombre: "Croquetas", precio: 4.5, img: "/images/croquetas.png" },
  { id: "8", categoria: "Tapas", nombre: "Tortilla Española", precio: 3.5, img: "/images/tortilla.png" },
  { id: "9", categoria: "Tapas", nombre: "Calamares", precio: 5.5, img: "/images/calamares.png" },

  // 🍟 RACIONES
  { id: "10", categoria: "Raciones", nombre: "Jamón Ibérico", precio: 9.5, img: "/images/jamon.png" },
  { id: "11", categoria: "Raciones", nombre: "Gambas al Ajillo", precio: 10.5, img: "/images/gambas.png" },
  { id: "12", categoria: "Raciones", nombre: "Huevos Rotos", precio: 8.5, img: "/images/huevos.png" },

  // 🍔 BOCADILLOS
  { id: "13", categoria: "Bocadillos", nombre: "Bocadillo de Lomo", precio: 4.5, img: "/images/bocata-lomo.png" },
  { id: "14", categoria: "Bocadillos", nombre: "Bocadillo Vegetal", precio: 4.2, img: "/images/bocata-vegetal.png" },
  { id: "15", categoria: "Bocadillos", nombre: "Perrito Caliente", precio: 4.0, img: "/images/perrito.png" },

  // 🍰 POSTRES
  { id: "16", categoria: "Postres", nombre: "Tarta de Queso", precio: 4.8, img: "/images/queso.png" },
  { id: "17", categoria: "Postres", nombre: "Helado 2 bolas", precio: 3.2, img: "/images/helado.png" },
  { id: "18", categoria: "Postres", nombre: "Flan Casero", precio: 3.5, img: "/images/flan.png" },
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
            ✅ Realizar Pedido
          </Button>
        </div>
      </div>
    </main>
  );
}
