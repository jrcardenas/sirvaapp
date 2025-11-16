"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useParams } from "next/navigation";

export default function MenuPage() {
  const { addItem, changeQty, items, removeItem, clearCart } = useCartStore();
  const { addToMesa } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const iconosCat: Record<string, string> = {
    Bebidas: "🍹",
    Tapas: "🍟",
    Raciones: "🥘",
    Bocadillos: "🥪",
    Postres: "🍰",
  };

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
    { id: "19", categoria: "Raciones", nombre: "Pulpo a la Gallega", precio: 14.0 },
    { id: "20", categoria: "Raciones", nombre: "Chistorra", precio: 7.0 },
    { id: "21", categoria: "Raciones", nombre: "Ensaladilla Rusa", precio: 6.5 },
    { id: "13", categoria: "Bocadillos", nombre: "Bocadillo de Lomo", precio: 4.5 },
    { id: "14", categoria: "Bocadillos", nombre: "Bocadillo Vegetal", precio: 4.2 },
    { id: "15", categoria: "Bocadillos", nombre: "Perrito Caliente", precio: 4.0 },
    { id: "16", categoria: "Postres", nombre: "Tarta de Queso", precio: 4.8 },
    { id: "17", categoria: "Postres", nombre: "Helado 2 bolas", precio: 3.2 },
    { id: "18", categoria: "Postres", nombre: "Flan Casero", precio: 3.5 },
  ];

  const categorias = [...new Set(productos.map((p) => p.categoria))];

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const getQty = (id: string) =>
    items.reduce((acc, p) => (p.id === id ? acc + p.qty : acc), 0);

  const total = items.reduce((acc, p) => acc + p.price * p.qty, 0);

  const handleConfirmOrder = () => {
    if (!mesaId || items.length === 0) return;

    addToMesa(mesaId, items);
    clearCart();
    setShowConfirm(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] p-4 pb-32 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-5 text-[var(--color-text-dark)]">
          Carta 📋
        </h1>

        {categorias.map((cat) => (
          <div key={cat} className="mb-5">
            <button
              className="w-full flex justify-between items-center text-lg font-semibold py-2 text-[var(--color-text-dark)]"
              onClick={() => toggleCategory(cat)}
            >
              <span className="flex items-center gap-2">
                {iconosCat[cat]} {cat}
              </span>
              <span className="text-[var(--color-text-muted)] text-sm">
                {openCategories.includes(cat) ? "▲" : "▼"}
              </span>
            </button>

            <div className="border-t border-[var(--color-border)] mb-2"></div>

            {openCategories.includes(cat) &&
              productos
                .filter((p) => p.categoria === cat)
                .map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text-dark)]">{item.nombre}</p>
                        <p className="text-[var(--color-text-muted)] text-sm">{item.precio.toFixed(2)} €</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={qty === 0}
                          onClick={() =>
                            qty <= 1 ? removeItem(item.id) : changeQty(item.id, qty - 1)
                          }
                          className={`w-7 h-7 rounded-full border text-sm font-bold ${
                            qty === 0
                              ? "border-[var(--color-border)] text-[var(--color-text-disabled)]"
                              : "border-[var(--color-minus-icon)] text-[var(--color-minus-icon)]"
                          }`}
                        >-</button>

                        <span className={`w-6 text-center font-semibold ${
                          qty === 0 ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-dark)]"
                        }`}>
                          {qty}
                        </span>

                        <button
                          className="w-7 h-7 rounded-full bg-[var(--color-plus-button)] text-white text-sm font-bold"
                          onClick={() =>
                            addItem({
                              id: item.id,
                              name: item.nombre,
                              price: item.precio,
                              qty: 1,
                            })
                          }
                        >+</button>
                      </div>
                    </div>
                  );
                })}
          </div>
        ))}

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between mb-3 font-bold text-lg text-[var(--color-text-dark)]">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Button
              fullWidth
              disabled={total === 0}
              className={`${total === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setShowConfirm(true)}
            >
              ✅ Realizar Pedido
            </Button>
          </div>
        </div>
      </main>

      {/* ✅ Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-3 text-[var(--color-text-dark)]">
              Confirmar Pedido
            </h3>

            <div className="space-y-2 mb-4 text-[var(--color-text-dark)]">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {i.qty} x {i.name}
                  </span>
                  <span>{(i.price * i.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <p className="text-center font-bold mb-4">
              Total: {total.toFixed(2)} €
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 py-2 rounded-lg bg-gray-300 font-semibold"
                onClick={() => setShowConfirm(false)}
              >
                ❌ Cancelar
              </button>
              <button
                className="w-1/2 py-2 rounded-lg bg-[var(--color-primary)] text-white font-semibold"
                onClick={handleConfirmOrder}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-lg animate-fade-in">
          🍽️ Pedido enviado
        </div>
      )}
    </>
  );
}
