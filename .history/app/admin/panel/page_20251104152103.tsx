"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa } = useOrderStore();

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
  }, []);

  useEffect(() => {
    const ch = new BroadcastChannel("notify_channel");
    ch.onmessage = (ev) => {
      if (ev.data?.llamada || ev.data?.cuenta) {
        dingRef.current?.play().catch(() => {});
      }
    };
    return () => ch.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => (mesa.items?.length ?? 0) > 0 || mesa.cuentaSolicitada || mesa.llamada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto">
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">📢 Panel Camarero</h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        mesasActivas.map(([mesaId, mesa]) => (
          <div
            key={mesaId}
            className={`p-4 rounded-xl shadow-md border mb-6 ${
              mesa.llamada
                ? "bg-danger/10 border-danger animate-pulse"
                : mesa.cuentaSolicitada
                ? "bg-yellow-100 border-yellow-300"
                : "bg-surface border-border"
            }`}
          >
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-bold">Mesa {mesaId}</h2>
              {mesa.llamada && <span>🛎️ Llamando</span>}
              {mesa.cuentaSolicitada && <span>🧾 Cuenta</span>}
            </div>

            {mesa.items?.map((item) => (
              <div
                key={`${item.id}-${item.timestamp}`}
                className="flex justify-between items-center p-2 bg-white rounded mb-1"
              >
                <span>{item.qty}x {item.name}</span>
                {!item.entregado && (
                  <button
                    onClick={() => marcarServido(mesaId, item.timestamp)}
                    className="text-xs bg-primary text-white px-2 py-1 rounded"
                  >
                    ✅
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => cobrarMesa(mesaId)}
              className="w-full bg-primary text-white py-2 rounded-xl font-bold mt-2"
            >
              💳 Cobrar y cerrar mesa
            </button>
          </div>
        ))
      )}
    </main>
  );
}
