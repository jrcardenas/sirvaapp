"use client";

import { useState } from "react";
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

  const getQty = (id: string) => items.find((p) => p.id === id)?.qty || 0;
  const total = items.reduce((acc, p) => acc + p.price * p.qty, 0);

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleConfirmOrder = () => {
    if (!mesaId || items.length === 0) return;
    addToMesa(
      mesaId,
      items.map((i) => ({ ...i, entregado: false, timestamp: Date.now() }))
    );
    clearCart();
    setShowConfirm(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <main className="min-h-screen bg-white p-5 pb-32 max-w-md mx-auto pt-14">
        <h1 className="text-2xl font-bold text-center mb-5 text-gray-900">Carta 📋</h1>

        {categorias.map((cat) => (
          <div key={cat} className="mb-6">
            <button
              className="w-full flex justify-between items-center text-lg font-semibold py-2 text-gray-900"
              onClick={() => toggleCategory(cat)}
            >
              <span className="flex items-center gap-2">{iconosCat[cat]} {cat}</span>
              <span className="text-gray-600 text-sm">
                {openCategories.includes(cat) ? "▲" : "▼"}
              </span>
            </button>

            <div className="border-t border-gray-300 mb-2"></div>

            {openCategories.includes(cat) &&
              productos
                .filter((p) => p.categoria === cat)
                .map((item) => {
                  const qty = getQty(item.id);

                  return (
                    <div key={item.id} className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.nombre}</p>
                        <p className="text-gray-600 text-sm">{item.precio.toFixed(2)} €</p>
                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          disabled={qty === 0}
                          onClick={() =>
                            qty <= 1 ? removeItem(item.id) : changeQty(item.id, qty - 1)
                          }
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                            qty === 0
                              ? "border border-gray-300 text-gray-400 opacity-40"
                              : "border-2 border-red-600 text-red-600 active:scale-90"
                          }`}
                        >
                          -
                        </button>

                        <span className="w-6 font-bold text-center text-gray-900">{qty}</span>

                        <button
                          className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow active:scale-95 transition"
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
        ))}

        {total > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-xl">
            <div className="max-w-md mx-auto p-4">

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-3">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {/* ✅ Botón elegante */}
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 rounded-xl font-bold text-white 
                           bg-primary hover:bg-primaryLight 
                           shadow-md active:scale-95 transition"
              >
                ✅ Realizar Pedido
              </button>
            </div>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-80 shadow-xl animate-modal">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-900">Confirmar Pedido</h3>

            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm mb-2 text-gray-900">
                <span>{i.qty}x {i.name}</span>
                <span>{(i.price * i.qty).toFixed(2)} €</span>
              </div>
            ))}

            <p className="text-center font-bold mb-4 text-gray-900">
              Total: {total.toFixed(2)} €
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 py-2 bg-gray-300 rounded-lg font-semibold"
                onClick={() => setShowConfirm(false)}
              >
                ❌ Cancelar
              </button>

              {/* ✅ Botón elegante Confirmar */}
              <button
                className="w-1/2 py-2 rounded-lg font-semibold text-white
                           bg-primary hover:bg-primaryLight 
                           active:scale-95 transition"
                onClick={handleConfirmOrder}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-toast">
          🍽️ Pedido enviado con éxito
        </div>
      )}
    </>
  );
}
