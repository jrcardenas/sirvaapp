"use client";
import { useOrderStore } from "@/store/orderStore";
import { useParams } from "next/navigation";

export default function CuentaPage() {
  const { mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const items = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

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
        </div>
      )}
    </main>
  );
}
