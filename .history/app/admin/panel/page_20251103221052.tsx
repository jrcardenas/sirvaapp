"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPage() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();

  // ✅ Protección Login
  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth !== "true") router.replace("/admin");
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  // ✅ Audio inicial
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 0.6;
  }, []);

  // ✅ Sonido solo cuando lleguen pedidos nuevos
  useEffect(() => {
    const audio = dingRef.current;
    if (!audio || !soundReady) return;
    audio.currentTime = 0;
    audio.play().catch(() => null);
  }, [mesas, soundReady]);

  // ✅ Convertimos state correcto
  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => mesa.items?.length > 0
  );

  return (
    <main className="min-h-screen bg-zinc-100 p-5 pt-24 max-w-lg mx-auto relative">

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

      <h1 className="text-3xl font-bold mb-6 text-center">📢 Panel Camarero</h1>

      {/* Botón activar sonido */}
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

      {mesasActivas.length === 0 ? (
        <p className="text-center text-gray-500"> No hay pedidos 😴 </p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = mesa.items.filter((i) => !i.entregado).length;

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
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.entregado ? "bg-gray-400" : "bg-green-600"
                        } text-white`}
                        onClick={() => marcarServido(mesaId, item.timestamp)}
                      >
                        {item.entregado ? "✅ Servido" : "✔️ Marcar"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* ✅ Cobrar Mesa */}
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
