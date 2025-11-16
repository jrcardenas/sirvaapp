"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function CuentaPage() {
  const { mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const mesa = mesas[mesaId] || { items: [], cuentaSolicitada: false };
  const items: PedidoItem[] = mesa.items || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const pedirCuenta = () => {
    const channel = new BroadcastChannel("pedir_cuenta_channel");
    channel.postMessage({ mesaId });
    channel.close();

    setShowConfirm(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ✅ Cuando notifican que la mesa pidió cuenta → ocultar botón
  useEffect(() => {
    const notifyChannel = new BroadcastChannel("notify_channel");

    notifyChannel.onmessage = (ev) => {
      const { mesaId: mesa, cuentaSolicitada } = ev.data;
      if (mesa === mesaId && cuentaSolicitada) {
        setShowConfirm(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    };

    return () => notifyChannel.close();
  }, [mesaId]);

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
                key={`${i.id}-${i.timestamp}`}
                className={`flex justify-between items-center p-3 rounded-lg shadow-sm border ${
                  i.entregado
                    ? "bg-green-100 border-green-300"
                    : "bg-[var(--color-surface)] border-[var(--color-border)]"
                }`}
              >
                <span className="text-[var(--color-text-dark)]">
                  {i.qty} x {i.name}
                </span>
                <span className="font-semibold text-[var(--color-text-dark)]">
                  {(i.price * i.qty).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Mensaje después de pedir cuenta */}
        {mesa.cuentaSolicitada && (
          <p className="text-center text-green-700 font-semibold mt-5">
            ✅ Cuenta solicitada. El camarero va en camino 🧾👨‍🍳
          </p>
        )}
      </main>

      {/* ✅ Ocultar botón si ya pidió la cuenta */}
      {items.length > 0 && !mesa.cuentaSolicitada && (
        <div className="fixed bottom-0 left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between mb-3 font-bold text-lg text-[var(--color-text-dark)]">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Button fullWidth className="bg-[var(--color-primary)] text-white" onClick={() => setShowConfirm(true)}>
              🧾 Pedir Cuenta
            </Button>
          </div>
        </div>
      )}

      {/* ✅ Popup Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">
              Confirmar Cuenta
            </h3>

            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {items.map((i) => (
                <div key={`${i.id}-${i.timestamp}`} className="flex justify-between text-sm">
                  <span>{i.qty} x {i.name}</span>
                  <span>{(i.price * i.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="w-1/2 py-2 rounded-lg bg-gray-300" onClick={() => setShowConfirm(false)}>
                ❌ Cancelar
              </button>
              <button className="w-1/2 py-2 rounded-lg bg-[var(--color-primary)] text-white" onClick={pedirCuenta}>
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast Animado */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-xl">
          🧾 ¡La cuenta está en camino! ✅
        </div>
      )}
    </>
  );
}
