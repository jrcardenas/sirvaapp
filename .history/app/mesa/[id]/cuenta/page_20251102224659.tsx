"use client";

import { useOrderStore } from "@/store/orderStore";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function CuentaPage() {
  const { mesas, clearMesa } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const items = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handleConfirmBill = () => {
    clearMesa(mesaId);
    setShowConfirm(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] p-5 max-w-md mx-auto pt-20">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-dark)]">
          Cuenta Mesa {mesaId}
        </h1>

        {items.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            No hay pedidos todavía 🍽️
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((i, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-[var(--color-surface)] p-3 rounded-lg shadow-sm border border-[var(--color-border)]"
              >
                <span className="text-[var(--color-text-dark)]">
                  {i.qty} x {i.name}
                </span>

                <span className="font-semibold text-[var(--color-text-price)]">
                  {(i.price * i.qty).toFixed(2)} €
                </span>
              </div>
            ))}

            <div className="border-t border-[var(--color-border)] my-3"></div>

            <div className="flex justify-between text-xl font-bold text-[var(--color-text-dark)]">
              <span>Total:</span>
              <span className="text-[var(--color-text-price)]">
                {total.toFixed(2)} €
              </span>
            </div>

            <Button
              fullWidth
              onClick={() => setShowConfirm(true)}
              className="mt-5"
            >
              🧾 Pedir la cuenta
            </Button>
          </div>
        )}
      </main>

      {/* ✅ Popup Confirmación - estilo igual a MenuPage */}
      {showConfirm && items.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl animate-modal">
            <h3 className="text-lg font-bold text-center mb-3 text-[var(--color-text-dark)]">
              Confirmar Cuenta
            </h3>

            <div className="space-y-2 mb-4 text-[var(--color-text-dark)]">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm">
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
                ✅ Pedir Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast éxito */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-xl animate-toast">
          🧾 Cuenta solicitada ✅ Gracias!
        </div>
      )}
    </>
  );
}
