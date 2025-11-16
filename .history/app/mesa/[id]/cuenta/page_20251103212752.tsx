"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function CuentaPage() {
  const { mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [showToast, setShowToast] = useState(false);

  const items: PedidoItem[] = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  // ✅ Recibir aviso cuando el camarero cobra la mesa
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
    <>
      <main className="min-h-screen bg-[var(--color-background)] p-5 max-w-md mx-auto pt-20 pb-40">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-dark)]">
          Cuenta Mesa {mesaId}
        </h1>

        {items.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            No hay pedidos todavía 🍽️
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <div
                key={i.id}
                className={`flex justify-between items-center p-3 rounded-lg shadow-sm border ${
                  i.entregado
                    ? "bg-green-100 border-green-300"
                    : "bg-[var(--color-surface)] border-[var(--color-border)]"
                }`}
              >
                <div>
                  <p className="font-semibold text-[var(--color-text-dark)]">
                    {i.qty} x {i.name}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {(i.price * i.qty).toFixed(2)} €
                  </p>
                </div>

                {i.entregado ? (
                  <span className="text-green-600 text-lg">✅</span>
                ) : (
                  <span className="text-yellow-500 text-lg">⏳</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ✅ Footer fijo con total y pedir cuenta */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between mb-3 font-bold text-lg text-[var(--color-text-dark)]">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Button
              fullWidth
              className="bg-[var(--color-primary)] text-white"
              onClick={pedirCuenta}
            >
              🧾 Pedir Cuenta
            </Button>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-xl animate-toast">
          ✅ Cuenta solicitada
        </div>
      )}
    </>
  );
}
