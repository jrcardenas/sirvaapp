"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPage() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();

  // ✅ Protección de login
  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  // ✅ Crea el audio una sola vez
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) {
      dingRef.current.volume = 0.6;
    }
  }, []);

  // ✅ Reproduce sonido cuando lleguen pedidos nuevos
  useEffect(() => {
    const a = dingRef.current;
    if (!a || !soundReady) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => null);
    } catch {}
  }, [mesas, soundReady]);

  const mesasActivas = Object.entries(mesas).filter(
    ([, pedidos]) => pedidos.length > 0
  );

  return (
    <main className="min-h-screen bg-zinc-100 p-5 pt-24 max-w-lg mx-auto relative">
      {/* ✅ Botón salir */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.replace("/admin");
        }}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">📢 Panel Camarero</h1>

      {/* ✅ Botón habilitar sonido */}
      {!soundReady && (
        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 rounded bg-black text-white text-sm"
            onClick={() => {
              const a = dingRef.current;
              if (!a) return;
              a.play().finally(() => setSoundReady(true));
            }}
          >
            🔊 Activar sonido
          </button>
        </div>
      )}

      {mesasActivas.length === 0 && (
        <p className="text-center text-gray-500">
          No hay pedidos por ahora 😴
        </p>
      )}

      <div className="space-y-6">
        {mesasActivas.map(([mesaId, pedidos]) => {
          const pendientes = pedidos.filter((p) => !p.entregado).length;

          return (
            <div key={mesaId} className="bg-white p-4 rounded-xl shadow-md border">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
                {pendientes > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {pendientes} Pend.
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {pedidos.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                      item.entregado
                        ? "bg-green-100 border-green-300"
                        : "bg-yellow-100 border-yellow-300 animate-pulse"
                    }`}
                  >
                    <span>{item.qty}x {item.name}</span>

                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.entregado
                          ? "bg-gray-400 text-white"
                          : "bg-green-600 text-white"
                      }`}
                      onClick={() => marcarServido(mesaId, item.id)}
                    >
                      {item.entregado ? "✅ Servido" : "✔️ Marcar"}
                    </button>
                  </div>
                ))}
              </div>

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
    </main>
  );
}
