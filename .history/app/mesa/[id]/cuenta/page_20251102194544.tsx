"use client";
import { useOrderStore } from "@/store/orderStore";
import { useParams } from "next/navigation";

export default function CuentaPage() {
  const { mesas } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const items = mesas[mesaId] || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <main className="p-5 max-w-md mx-auto pt-16">
      <h1 className="text-2xl font-bold mb-4">Cuenta Mesa {mesaId}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No hay pedidos aún</p>
      ) : (
        <div className="space-y-2">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="flex justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <span>
                {i.qty} x {i.name}
              </span>
              <span className="font-semibold">
                {(i.price * i.qty).toFixed(2)} €
              </span>
            </div>
          ))}

          <hr className="my-3" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      )}
    </main>
  );
}
