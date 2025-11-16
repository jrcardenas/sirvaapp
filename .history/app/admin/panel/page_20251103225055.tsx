"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPage() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();

  // ✅ Protección
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  // ✅ Sonido inicial
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current.volume = 0.6;
  }, []);

  // ✅ Sonido cuando llegan pedidos nuevos
  useEffect(() => {
    const audio = dingRef.current;
    if (audio && soundReady) {
      audio.currentTime = 0;
      audio.play().catch(() => null);
    }
  }, [mesas, soundReady]);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => mesa.items.length > 0
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6 pt-24 max-w-lg mx-auto relative">

      {/* ✅ Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.replace("/admin");
        }}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg font-bold shadow-md active:scale-95"
      >
        🔓 Cerrar
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center text-[var(--color-text-dark)]">
        📢 Panel Camarero
      </h1>

      {/* ✅ Activar sonido */}
      {!soundReady && (
        <div className="flex justify-center mb-4">
          <button
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold active:scale-95"
            onClick={() =>
              dingRef.current?.play().finally(() => setSoundReady(true))
            }
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
            const pendientes = mesa.items.filter(i => !i.entregado).length;

            return (
              <div key={mesaId} className="bg-[var(--color-surface)] p-4 rounded-2xl shadow-xl border border-[var(--color-border)]">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[var(--color-text-dark)]">
                    Mesa {mesaId}
                  </h2>

                  {pendientes > 0 && (
                    <span className="bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {pendientes} Pend.
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {mesa.items.map(item => (
                    <div
                      key={`${item.id}-${item.timestamp}`}
                      className={`flex justify-between items-center p-3 rounded-lg text-sm border ${
                        item.entregado
                          ? "bg-green-100 border-green-300"
                          : "bg-yellow-100 border-yellow-300"
                      }`}
                    >
                      <span className="font-medium">{item.qty}x {item.name}</span>

                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-bold text-white active:scale-95 ${
                          item.entregado
                            ? "bg-gray-400"
                            : "bg-[var(--color-primary)]"
                        }`}
                        onClick={() => marcarServido(mesaId, item.timestamp)}
                      >
                        {item.entregado ? "✅" : "✔️"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* ✅ Cobrar Mesa */}
                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-blue-700 text-white py-2 rounded-xl font-bold active:scale-95 shadow-md"
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
