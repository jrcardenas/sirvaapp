"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada, atenderCuenta } = useOrderStore();

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 0.7;
  }, []);

  // ✅ Llamadas + Cuentas → Notificación
  useEffect(() => {
    const ch = new BroadcastChannel("notify_channel");
    ch.onmessage = (ev) => {
      if (ev.data?.llamada || ev.data?.cuentaSolicitada) {
        setSoundReady(true);
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => ch.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => (mesa.items?.length ?? 0) > 0 || mesa.llamada || mesa.cuentaSolicitada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

      {/* ✅ Banner de llamadas */}
      {Object.entries(mesas)
        .filter(([, mesa]) => mesa.llamada)
        .map(([mesaId]) => (
          <div key={mesaId} className="bg-danger text-white font-bold text-center py-3 px-4 rounded-xl shadow-lg mb-3 animate-pulse">
            🛎 Mesa {mesaId} llama al camarero
          </div>
        ))}

      {/* ✅ Banner de cuentas pendientes */}
      {Object.entries(mesas)
        .filter(([, mesa]) => mesa.cuentaSolicitada)
        .map(([mesaId]) => (
          <div key={mesaId} className="bg-blue-600 text-white font-bold text-center py-3 px-4 rounded-xl shadow-lg mb-3 animate-pulse">
            💳 Mesa {mesaId} pidió la cuenta
          </div>
        ))}

      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">📢 Panel Camarero</h1>

      {!soundReady && (
        <div className="flex justify-center mb-4">
          <button
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold"
            onClick={() => dingRef.current?.play().finally(() => setSoundReady(true))}
          >
            🔊 Activar sonido
          </button>
        </div>
      )}

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = (mesa.items ?? []).filter((i) => !i.entregado).length;

            return (
              <div key={mesaId} className="p-4 rounded-xl shadow-md border border-border bg-surface">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                  {mesa.llamada && (
                    <span className="bg-danger text-white py-1 px-3 rounded-full animate-pulse">
                      🛎 Llamando
                    </span>
                  )}

                  {mesa.cuentaSolicitada && (
                    <span className="bg-blue-600 text-white py-1 px-3 rounded-full animate-pulse">
                      💳 Cuenta
                    </span>
                  )}

                  {!mesa.llamada && !mesa.cuentaSolicitada && pendientes > 0 && (
                    <span className="bg-accent text-white py-1 px-3 rounded-full animate-pulse">
                      {pendientes} Pend.
                    </span>
                  )}
                </div>

                {mesa.items?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {mesa.items.map((item) => (
                      <div
                        key={`${item.id}-${item.timestamp}`}
                        className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                          item.entregado
                            ? "bg-green-100 border-green-300"
                            : "bg-yellow-100 border-yellow-300"
                        }`}
                      >
                        <span>{item.qty}x {item.name}</span>
                        {!item.entregado && (
                          <button
                            onClick={() => marcarServido(mesaId, item.timestamp)}
                            className="px-2 py-1 text-xs bg-primary text-white rounded-lg font-semibold"
                          >
                            ✅ Servido
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {mesa.cuentaSolicitada && (
                  <button
                    onClick={() => atenderCuenta(mesaId)}
                    className="w-full bg-blue-700 text-white py-2 rounded-xl font-bold mb-2"
                  >
                    ✅ Cuenta atendida
                  </button>
                )}

                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                >
                  💳 Cobrar Mesa
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
