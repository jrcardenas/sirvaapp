"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS, MenuItemType } from "@/data/menu";
import { useParams } from "next/navigation";

type PedidoAgrupado = {
  id: string;
  name: string;
  qty: number;
  entregados: number;
};

type ToastType =
  | "pedidoEnviado"
  | "pedidoEnCamino"
  | "pedidoServido"
  | "llamada"
  | "cuenta"
  | null;

export default function MenuPage() {
  const { addItem, changeQty, items, removeItem, clearCart } = useCartStore();
  const { addToMesa, mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastType>(null);

  // 🔔 Utilidad centralizada para mostrar toast sin solapar
  const showToast = (type: ToastType, duration = 3000) => {
    setActiveToast(type);
    setTimeout(() => setActiveToast(null), duration);
  };

  // ✅ ESCUCHA NOTIFICACIONES DEL CAMARERO (notify_channel)
  useEffect(() => {
    if (!mesaId) return;
    const notify = new BroadcastChannel("notify_channel");

    notify.onmessage = (ev) => {
      if (ev.data?.mesaId !== mesaId) return;
      const msg = ev.data?.mensaje;

      if (ev.data?.respondido) showToast("llamada");
      else if (msg === "pedidoEnCamino") showToast("pedidoEnCamino");
      else if (msg === "pedidoServido") showToast("pedidoServido");
      else if (msg === "cuentaEnCamino" || msg === "cuentaEnPreparacion")
        showToast("cuenta");
    };

    return () => notify.close();
  }, [mesaId]);

  // ✅ Sincroniza pedidos en tiempo real (pedidos_channel)
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) useOrderStore.setState({ mesas: ev.data.mesas });
    };
    return () => pedidos.close();
  }, []);

  // --------------------------------------
  const iconosCat: Record<string, string> = {
    Bebidas: "🍹",
    Tapas: "🍟",
    Raciones: "🥘",
    Bocadillos: "🥪",
    Postres: "🍰",
  };

  const productos: MenuItemType[] = MENU_ITEMS;
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  const getQty = (id: string) => items.find((p) => p.id === id)?.qty || 0;
  const total = items.reduce((acc, p) => acc + p.price * p.qty, 0);

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  // 🧾 Confirmar pedido
  const handleConfirmOrder = () => {
    if (!mesaId || items.length === 0) return;

    addToMesa(
      mesaId,
      items.map((i) => ({ ...i, entregado: false, timestamp: Date.now() }))
    );

    clearCart();
    setShowConfirm(false);
    showToast("pedidoEnviado", 2500);
  };

  const mesaActual = mesas[mesaId];

  // --------------------------------------
  return (
    <>
      <main className="min-h-screen bg-white p-5 pb-40 max-w-md mx-auto pt-14">
        <h1 className="text-2xl font-bold text-center mb-5 text-gray-900">Carta 📋</h1>

        {/* 🧾 Pedido actual */}
        {mesaActual?.items?.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-lg mb-2">🧾 Tu pedido en curso</h3>

            {Object.values(
              mesaActual.items.reduce<Record<string, PedidoAgrupado>>((acc, item) => {
                if (!acc[item.id]) {
                  acc[item.id] = { id: item.id, name: item.name, qty: 0, entregados: 0 };
                }
                acc[item.id].qty++;
                if (item.entregado) acc[item.id].entregados++;
                return acc;
              }, {})
            ).map((item) => (
              <div
                key={item.id}
                className={`flex justify-between text-sm mb-2 px-2 py-1 rounded-md ${
                  item.qty === item.entregados
                    ? "bg-green-200 text-green-700"
                    : "bg-yellow-200 text-yellow-700 animate-pulse"
                }`}
              >
                <span>
                  {item.qty}x {item.name}
                </span>
                <span>
                  {item.qty === item.entregados ? "✅ Servido" : `⏳ ${item.qty - item.entregados}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 📋 Categorías */}
        {categorias.map((cat) => (
          <div key={cat} className="mb-6">
            <button
              className="w-full flex justify-between items-center text-lg font-semibold py-2"
              onClick={() => toggleCategory(cat)}
            >
              <span className="flex items-center gap-2">
                {iconosCat[cat]} {cat}
              </span>
              <span className="text-sm">{openCategories.includes(cat) ? "▲" : "▼"}</span>
            </button>

            <div className="border-t border-gray-300 mb-2"></div>

            {openCategories.includes(cat) &&
              productos
                .filter((p) => p.categoria === cat)
                .map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} className="flex justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-600 text-sm">{item.price.toFixed(2)} €</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          disabled={qty === 0}
                          onClick={() =>
                            qty <= 1 ? removeItem(item.id) : changeQty(item.id, qty - 1)
                          }
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            qty === 0
                              ? "border border-gray-300 text-gray-400"
                              : "border-2 border-red-600 text-red-600"
                          }`}
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">{qty}</span>

                        <button
                          className="w-10 h-10 rounded-full bg-green-600 text-white font-bold"
                          onClick={() =>
                            addItem({
                              id: item.id,
                              name: item.name,
                              price: item.price,
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

        {/* ✅ Total + botón de pedido */}
        {total > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl">
            <div className="max-w-md mx-auto p-4">
              <div className="flex justify-between text-lg font-bold mb-2">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              <Button
                fullWidth
                onClick={() => setShowConfirm(true)}
                className="bg-green-600 text-white py-3 font-bold rounded-xl"
              >
                ✅ Realizar Pedido
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* 🧾 Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-80">
            <h3 className="text-lg font-bold text-center mb-3">Confirmar Pedido</h3>

            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm mb-1">
                <span>
                  {i.qty}x {i.name}
                </span>
                <span>{(i.price * i.qty).toFixed(2)} €</span>
              </div>
            ))}

            <p className="font-bold mt-3 text-center">Total: {total.toFixed(2)} €</p>

            <div className="flex gap-2 mt-4">
              <button
                className="w-1/2 bg-gray-300 rounded-lg py-2"
                onClick={() => setShowConfirm(false)}
              >
                ❌ Cancelar
              </button>

              <button
                className="w-1/2 bg-green-600 text-white font-bold py-2 rounded-lg"
                onClick={handleConfirmOrder}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Único toast activo */}
      {activeToast && <Toast type={activeToast} />}
    </>
  );
}

/* ✅ Toast único y dinámico */
function Toast({ type }: { type: ToastType }) {
  const messages: Record<Exclude<ToastType, null>, { color: string; text: string }> = {
    pedidoEnviado: { color: "bg-green-600", text: "🍽️ Pedido enviado con éxito" },
    pedidoEnCamino: { color: "bg-green-700", text: "✅ Tu pedido va en camino" },
    pedidoServido: { color: "bg-green-600", text: "🍽️ Tu pedido está servido" },
    llamada: { color: "bg-blue-600", text: "👋 El camarero está en camino" },
    cuenta: { color: "bg-purple-600", text: "💳 La cuenta está en camino" },
  };

  const { color, text } = messages[type];

  return (
    <div
      className={`fixed bottom-32 left-1/2 -translate-x-1/2 ${color} text-white px-4 py-2 rounded-lg shadow-md font-bold transition-opacity duration-300`}
    >
      {text}
    </div>
  );
}
