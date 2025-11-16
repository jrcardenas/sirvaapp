"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";

export default function CuentaMesaPage() {
  const { id: mesaId } = useParams() as { id: string };
  const [showToast, setShowToast] = useState(false);

  const mesas = useOrderStore((s) => s.mesas);
  const pedidos = mesas[mesaId] || [];

  const total = pedidos.reduce((acc, p) => acc + p.price * p.qty, 0);

  // ✅ Recibir notificación del camarero cuando cobren/limpien mesa
  useEffect(() => {
    const notifyChannel = new BroadcastChannel("notify_channel");
    notifyChannel.onmessage = (ev) => {
      const { mesaId: mesa, cobrado } = ev.data;
      if (mesa === mesaId && cobrado) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    };
    return () => notifyChannel.close();
  }, [mesaId]);

  const pedirCuenta = () => {
    const channel = new BroadcastChannel("pedir_cuenta_channel");
    channel.postMessage({ mesaId });
    channel.close();

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] max-w-md mx-auto p-6 pt-16">
      <h1 className="text-2xl font-bold text-center mb-6 text-[var(--color-text-dark)]">
        Cuenta 💶
      </h1>

      {pedidos.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)]">
          No hay pedidos todavía 🕓
        </p>
      ) : (
        <>
          {pedidos.map((item: PedidoItem, idx: number) => (
            <div
              key={idx}
              className={`p-3 mb-2 rounded flex justify-between items-center ${
                item.entregado ? "bg-green-100" : "bg-white"
              }`}
            >
              <div>
                <p className="font-semibold">
                  {item.qty}x {item.name}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {(item.price * item.qty).toFixed(2)} €
                </p>
              </div>

              {item.entregado ? (
                <span className="text-green-600 font-bold text-sm">✅</span>
              ) : (
                <span className="text-yellow-500 font-bold text-sm">
                  ⏳
                </span>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-[var(--color-surface)] rounded-lg shadow">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <button
            onClick={pedirCuenta}
            className="bg-[var(--color-primary)] text-white font-bold w-full py-3 mt-6 rounded-xl shadow-md"
          >
            📣 Pedir la cuenta
          </button>
        </>
      )}

      {showToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-xl animate-toast">
          ✅ Petición enviada
        </div>
      )}
    </main>
  );
}
