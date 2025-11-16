"use client";

import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CuentaPage() {
  const { mesas, pedirCuenta } = useOrderStore();
  const { id: mesaId } = useParams() as { id: string };

  const [cuentaSolicitada, setCuentaSolicitada] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // ✅ Modal confirmación

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string, ms = 2500) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), ms);
  };

  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: ev.data.mesas });
      }
    };
    return () => pedidos.close();
  }, []);

  useEffect(() => {
    const notify = new BroadcastChannel("notify_channel");
    notify.onmessage = (ev) => {
      const data = ev.data;
      if (!data || data.mesaId !== mesaId) return;

      switch (data.mensaje) {
        case "cuentaEnCamino":
          setCuentaSolicitada(true);
          showToast("💳 La cuenta está en camino");
          break;
      }
    };
    return () => notify.close();
  }, [mesaId]);

  const mesa =
    mesas[mesaId] || ({
      items: [],
      llamada: false,
      cuentaSolicitada: false,
    } as { items: PedidoItem[]; llamada: boolean; cuentaSolicitada: boolean });

  const items: PedidoItem[] = mesa.items || [];

  const itemsAgrupados = Object.values(
    items.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 0,
          entregados: 0,
        };
      }
      acc[item.id].qty++;
      if (item.entregado) acc[item.id].entregados++;
      return acc;
    }, {} as Record<string, { id: string; name: string; price: number; qty: number; entregados: number }> )
  );

  const total = itemsAgrupados.reduce((a, i) => a + i.qty * i.price, 0);

  const confirmPedirCuenta = () => {
    pedirCuenta(mesaId);
    setCuentaSolicitada(true);

    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.postMessage({
      tipo: "cuenta",
      mesaId,
      mesas: useOrderStore.getState().mesas,
    });
    pedidos.close();

    setShowConfirm(false);
    showToast("💳 Cuenta solicitada");
  };

  return (
    <main className="min-h-screen bg-white p-5 max-w-md mx-auto pt-20 pb-40 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Cuenta Mesa {mesaId}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No hay pedidos todavía 🍽️</p>
      ) : (
        <div className="space-y-3 mb-24">
          {itemsAgrupados.map((i) => {
            const pendientes = i.qty - i.entregados;
            const todosServidos = pendientes === 0;
            return (
              <div
                key={i.id}
                className={`flex justify-between items-center p-3 rounded-lg shadow-sm border text-sm ${
                  todosServidos
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-yellow-100 border-yellow-300 text-yellow-800 animate-pulse"
                }`}
              >
                <span>
                  {i.qty}x {i.name}
                  {!todosServidos ? (
                    <span className="font-semibold ml-1">
                      ⏳ {pendientes} pendiente(s)
                    </span>
                  ) : (
                    <span className="font-semibold ml-1">✅</span>
                  )}
                </span>
                <span className="font-bold">{(i.price * i.qty).toFixed(2)} €</span>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl">
          <div className="max-w-md mx-auto p-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            {!mesa.cuentaSolicitada && !cuentaSolicitada ? (
              <button
                onClick={() => setShowConfirm(true)} // ✅ Abre modal
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg animate-pulse"
              >
                📢 Pedir la cuenta
              </button>
            ) : (
              <div className="text-center bg-green-100 text-green-700 p-3 rounded-xl font-bold">
                ✅ Cuenta solicitada — en camino
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-80 text-gray-900">
            <h3 className="text-xl font-bold text-center mb-4">
              ¿Confirmar solicitud de cuenta?
            </h3>

            <div className="flex gap-2 mt-2">
              <button
                className="w-1/2 bg-gray-300 py-2 rounded-lg font-semibold"
                onClick={() => setShowConfirm(false)}
              >
                ❌ Cancelar
              </button>
              <button
                className="w-1/2 bg-blue-600 text-white py-2 rounded-lg font-bold"
                onClick={confirmPedirCuenta}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold">
          {toastMsg}
        </div>
      )}
    </main>
  );
}
