"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();

  // ✅ Protección de acceso
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  // ✅ cargar sonido
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 0.6;
  }, []);

  // ✅ reproducir sonido en nuevos pedidos
  useEffect(() => {
    if (!soundReady) return;
    const a = dingRef.current;
    a?.play().catch(() => null);
  }, [mesas, soundReady]);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => mesa?.items?.length > 0
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-5 pt-24 max-w-lg mx-auto relative">

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.replace("/admin");
        }}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">
        📢 Panel Camarero
      </h1>

      {/* Botón para habilitar sonido */}
      {!soundReady && (
        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 bg-black text-white rounded"
            onClick={() => {
              dingRef.current?.play().finally(() => setSoundReady(true));
            }}
          >
            🔊 Activar sonido
          </button>
        </div>
      )}

      {mesasActivas.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)]">
          No hay pedidos 😴
        </p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = mesa.items.filter((i) => !i.entregado).length;

            return (
              <div key={mesaId} className="bg-[var(--color-surface)] p-4 rounded-xl shadow-md border border-[var(--color-border)]">

                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                  {pendientes > 0 && (
                    <span className="bg-red-500 text-white py-1 px-3 text-sm rounded-full font-semibold animate-pulse">
                      {pendientes} Pend.
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {mesa.items.map((item) => (
                    <div
                      key={`${item.id}-${item.timestamp}`}
                      className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                        item.entregado
                          ? "bg-green-100 border-green-300"
                          : "bg-yellow-100 border-yellow-300 animate-pulse"
                      }`}
                    >
                      <span>{item.qty}x {item.name}</span>

                      <button
                        onClick={() => marcarServido(mesaId, item.timestamp)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.entregado ? "bg-gray-500" : "bg-green-600"
                        } text-white`}
                      >
                        {item.entregado ? "✅" : "✔️"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cobrar mesa */}
                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold"
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
