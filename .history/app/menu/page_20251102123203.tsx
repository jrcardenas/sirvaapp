"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";

export default function MenuPage() {
  const { addItem, changeQty, items, removeItem, clearCart } = useCartStore();
  const [openCategory, setOpenCategory] = useState("Bebidas");

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

  const categorias = [...new Set(productos.map((p) => p.categoria))];

  const getQty = (id: string) =>
    items.reduce((acc, p) => (p.id === id ? acc + p.qty : acc), 0);

  const total = items.reduce((acc, p) => acc + p.price * p.qty, 0);

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-4 pb-32 max-w-md mx-auto">
      
      <h1 className="text-2xl font-bold text-center text-[var(--color-text-dark)] mb-6">
        Carta
      </h1>

      {categorias.map((categoria) => (
        <div key={categoria} className="mb-4">
          <button
            className="w-full flex justify-between items-center text-lg font-semibold py-3 text-[var(--color-text-dark)]"
            onClick={() =>
              setOpenCategory(openCategory === categoria ? null : categoria)
            }
          >
            {categoria}
            <span className="text-sm opacity-60">
              {openCategory === categoria ? "▲" : "▼"}
            </span>
          </button>

          {openCategory === categoria && (
            <div className="space-y-3">
              {productos
                .filter((p) => p.categoria === categoria)
                .map((item) => {
                  const qty = getQty(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-[var(--color-surface)] shadow-[var(--shadow-card)] rounded-xl px-4 py-3 flex justify-between items-center border border-[var(--color-border)]"
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text-dark)]">
                          {item.nombre}
                        </p>
                        <p className="text-[var(--color-text-medium)] text-sm">
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
                          className={`w-7 h-7 rounded-full text-lg font-bold flex items-center justify-center ${
                            qty === 0
                              ? "bg-[var(--color-disabled)] text-white"
                              : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          }`}
                        >
                          -
                        </button>

                        <span
                          className={`w-6 text-center font-semibold ${
                            qty === 0
                              ? "text-gray-400"
                              : "text-[var(--color-text-dark)]"
                          }`}
                        >
                          {qty}
                        </span>

                        <button
                          className="w-7 h-7 bg-[var(--color-primary)] text-white rounded-full text-lg font-bold flex items-center justify-center"
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

      {/* ✅ FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-footer)]">
        <div className="max-w-md mx-auto p-4">
          <div className="flex justify-between mb-3 text-lg font-bold text-[var(--color-text-dark)]">
            <span>Total</span>
            <span className={total === 0 ? "text-gray-400" : "text-[var(--color-text-dark)]"}>
              {total.toFixed(2)} €
            </span>
          </div>

          <Button
            fullWidth
            disabled={total === 0}
            className={`${
              total === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              alert("✅ Pedido enviado a cocina!");
              clearCart();
            }}
          >
            ✅ Realizar Pedido
          </Button>
        </div>
      </div>
    </main>
  );
}
