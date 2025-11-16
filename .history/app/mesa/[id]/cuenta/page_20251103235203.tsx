"use client";

import { useEffect, useState } from "react";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function CuentaPage() {
  const { mesas, pedirCuenta } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const mesa = mesas[mesaId] || { items: [], cuentaSolicitada: false };
  const items: PedidoItem[] = mesa.items || [];
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

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

  const handleConfirmBill = () => {
    pedirCuenta(mesaId);
    setShowConfirm(false);
  };

  return (
    <>
      <main className="min-h-screen bg-white p-5 max-w-md mx-auto pt-20 pb-40 text-gray-900">
        <h1 className="text-2xl font-bold mb-4">
          Cuenta Mesa {mesaId}
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-500">
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
                    : "bg-white border-gray-300"
                }`}
              >
                <span>{i.qty} x {i.name}</span>
                <span className="font-semibold">
                  {(i.price * i.qty).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between mb-3 font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Button
              fullWidth
              disabled={mesa.cuentaSolicitada}
              className={`w-full py-3 rounded-2xl shadow-md font-bold active:scale-95 transition ${
                mesa.cuentaSolicitada
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white"
              }`}
              onClick={() => !mesa.cuentaSolicitada && setShowConfirm(true)}
            >
              {mesa.cuentaSolicitada
                ? "✅ Cuenta solicitada"
                : "🧾 Pedir Cuenta"}
            </Button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
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
              <button
                className="w-1/2 py-2 bg-gray-300 rounded-lg font-semibold"
                onClick={() => setShowConfirm(false)}
              >
                ❌ Cancelar
              </button>

              <button
                className="w-1/2 bg-green-600 text-white font-bold py-2 rounded-lg shadow-md active:scale-95 transition"
                onClick={handleConfirmBill}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-xl font-semibold">
          🧾 ¡La cuenta está en camino! ✅
        </div>
      )}
    </>
  );
}
