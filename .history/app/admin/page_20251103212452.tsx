"use client";

import { useEffect, useRef, useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PIN = "1234";

export default function AdminPage() {
  const mesas = useOrderStore((s) => s.mesas);
  const marcarServido = useOrderStore((s) => s.marcarServido);
  const clearMesa = useOrderStore((s) => s.clearMesa);

  const [auth, setAuth] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const dingSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingSound.current = new Audio("/ding.mp3");
  }, []);

  useEffect(() => {
    const count = Object.values(mesas).reduce(
      (acc, items) => acc + items.filter((i) => !i.entregado).length,
      0
    );

    if (pendingCount !== 0 && count > pendingCount && dingSound.current) {
      dingSound.current.play();
    }
    setPendingCount(count);
  }, [mesas]);

  const mesasActivas = Object.entries(mesas)
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => Number(a) - Number(b));

  if (!auth) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-4">
        <h1 className="text-xl font-bold">Panel Camarero</h1>
        <input
          type="password"
          placeholder="PIN"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className="border rounded p-2 text-center"
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => setAuth(pinInput === PIN)}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        {pendingCount > 0 && (
          <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">
            {pendingCount}
          </span>
        )}
      </div>

      {mesasActivas.length === 0 && (
        <p className="text-gray-500">No hay pedidos pendientes ✅</p>
      )}

      {mesasActivas.map(([id, items]) => (
        <div key={id} className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-xl font-bold text-blue-600">Mesa {id}</h3>

          {[...items]
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item) => (
              <div
                key={item.id}
                className={`mt-3 p-3 rounded flex justify-between items-center ${
                  item.entregado ? "bg-green-200" : "bg-white"
                }`}
              >
                <div>
                  <p className="font-semibold">{item.qty}x {item.name}</p>
                  <small className="text-gray-500">
                    ⏱ {format(item.timestamp, "HH:mm", { locale: es })}
                  </small>
                </div>

                <button
                  onClick={() => marcarServido(id, item.id)}
                  className={`px-3 py-1 rounded text-sm font-bold ${
                    item.entregado ? "bg-green-600" : "bg-black"
                  } text-white`}
                >
                  {item.entregado ? "✅" : "Servir"}
                </button>
              </div>
            ))}

          <button
            onClick={() => clearMesa(id)}
            className="bg-red-600 text-white w-full mt-4 py-2 font-bold rounded"
          >
            Limpiar mesa 🧹
          </button>
        </div>
      ))}
    </div>
  );
}
