"use client";
import { useOrderStore } from "@/store/orderStore";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CuentaPage() {
  const { mesas, clearMesa } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };
  const [showToast, setShowToast] = useState(false);

  const items = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handleRequestBill = () => {
    clearMesa(mesaId);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-5 max-w-md mx-auto pt-20">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-dark)]">
        Cuenta Mesa {mesaId}
      </h1>

      {items.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          No hay pedidos aún
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

          {/* ✅ Botón pedir cuenta */}
          <button
            onClick={handleRequestBill}
            className="w-full mt-5 py-3 text-white font-semibold bg-[var(--color-primary)] rounded-lg shadow-md"
          >
            🧾 Pedir la cuenta
          </button>
        </div>
      )}

      {/* ✅ Toast feedback */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-lg animate-toast">
          ✅ Cuenta solicitada. Gracias 🙌
        </div>
      )}
    </main>
  );
}
