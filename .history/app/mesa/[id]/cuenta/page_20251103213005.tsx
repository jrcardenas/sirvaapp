"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function CuentaPage() {
  const { mesas, clearMesa } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const items: PedidoItem[] = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  // ✅ Escuchar cuando el camarero cobra / limpia la mesa
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

  const handleConfirmBill = () => {
    pedirCuenta(); // ✅ Se usa pedirCuenta al confirmar popup
    setShowConfirm(false);
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
                <span className="text-[var(--color-text-dark)]">
                  {i.qty} x {i.name}
                </span>

                <span className="font-semibold text-[var(--color-text-price)]">
                  {(i.price * i.qty).toFixed(2)} €
                </span>

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

      {/* ✅ Footer con botón pedir cuenta */}
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
              onClick={() => setShowConfirm(true)}
            >
              🧾 Pedir Cuenta
            </Button>
          </div>
        </div>
      )}

      {/* ✅ Popup Confirmación (mantenido y mejorado) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl animate-modal">
            <h3 className="text-lg font-bold text-center mb-3 text-[var(--color-text-dark)]">
              Confirmar Cuenta
            </h3>

            <div className="space-y-2 mb-4 text-[var(--color-text-dark)] max-h-40 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span>{i.qty} x {i.name}</span>
                  <span>{(i.price * i.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <p className="text-center font-bold mb-4 text-[var(--color-text-dark)]">
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
                onClick={handleConfirmBill}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast animado */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-xl animate-toast">
          🧾 ¡La cuenta está en camino! ✅
        </div>
      )}
    </>
  );
}
