"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();
  const { addItem, changeQty, items, clearCart, removeItem } = useCartStore();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const productos = [
    { id: "1", categoria: "Bebidas", nombre: "Cerveza", precio: 2.0 },
    { id: "2", categoria: "Bebidas", nombre: "Coca-Cola", precio: 2.2 },
    { id: "3", categoria: "Bebidas", nombre: "Agua", precio: 1.5 },
    { id: "4", categoria: "Bebidas", nombre: "Tinto de Verano", precio: 2.8 },
    { id: "5", categoria: "Bebidas", nombre: "Café con Leche", precio: 1.5 },

    { id: "6", categoria: "Tapas", nombre: "Patatas Bravas", precio: 4.0 },
    { id: "7", categoria: "Tapas", nombre: "Croquetas", precio: 4.5 },
    { id: "8", categoria: "Tapas", nombre: "Tortilla Española", precio: 3.5 },
    { id: "9", categoria: "Tapas", nombre: "Calamares", precio: 5.5 },

    { id: "10", categoria: "Raciones", nombre: "Jamón Ibérico", precio: 9.5 },
    { id: "11", categoria: "Raciones", nombre: "Gambas al Ajillo", precio: 10.5 },
    { id: "12", categoria: "Raciones", nombre: "Huevos Rotos", precio: 8.5 },

    { id: "13", categoria: "Bocadillos", nombre: "Bocadillo de Lomo", precio: 4.5 },
    { id: "14", categoria: "Bocadillos", nombre: "Bocadillo Vegetal", precio: 4.2 },
    { id: "15", categoria: "Bocadillos", nombre: "Perrito Caliente", precio: 4.0 },

    { id: "16", categoria: "Postres", nombre: "Tarta de Queso", precio: 4.8 },
    { id: "17", categoria: "Postres", nombre: "Helado 2 bolas", precio: 3.2 },
    { id: "18", categoria: "Postres", nombre: "Flan Casero", precio: 3.5 },
  ];

  const categorias = [...new Set(productos.map(p => p.categoria))];

  const getQty = (id: string) =>
    items.reduce((acc, p) => (p.id === id ? acc + p.qty : acc), 0);

  const total = items.reduce((acc, p) => acc + p.price * p.qty, 0);

  const handleSendOrder = () => {
    if (items.length === 0) return;
    alert("✅ Pedido enviado a cocina!");
    clearCart();
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6 pb-32">
      <h1 className="text-3xl font-bold text-center mb-4">Menú 🍽️</h1>

      {categorias.map((categoria) => (
        <div key={categoria} className="mb-4">
          {/* ✅ Botón categoría */}
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold flex justify-between items-center"
            onClick={() =>
              setOpenCategory(openCategory === categoria ? null : categoria)
            }
          >
            {categoria}
            <span>{openCategory === categoria ? "▲" : "▼"}</span>
          </button>

          {/* ✅ Lista de productos */}
          {openCategory === categoria && (
            <div className="mt-3 grid gap-3">
              {productos
                .filter((p) => p.categoria === categoria)
                .map((item) => {
                  const qty = getQty(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white px-4 py-3 shadow rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{item.nombre}</p>
                        <p className="text-gray-600 text-sm">
                          {item.precio.toFixed(2)} €
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={qty === 0}
                          onClick={() =>
                            qty <= 1
                              ? removeItem(item.id)
                              : changeQty(item.id, qty - 1)
                          }
                          className={`w-8 h-8 rounded-full flex justify-center items-center
                          ${
                            qty === 0
                              ? "bg-gray-300 text-gray-500"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          -
                        </button>

                        <span
                          className={`w-6 text-center font-bold ${
                            qty === 0 ? "text-gray-400" : "text-black"
                          }`}
                        >
                          {qty}
                        </span>

                        <button
                          className="w-8 h-8 bg-blue-600 text-white rounded-full"
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
          )}
        </div>
      ))}

      {/* ✅ Footer con Total y botón */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between font-semibold mb-3 text-lg">
            <span>Total:</span>
            <span className={total === 0 ? "text-gray-400" : "text-black"}>
              {total.toFixed(2)} €
            </span>
          </div>

          <Button
            fullWidth
            disabled={total === 0}
            className={`${
              total === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""
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
