"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada } = useOrderStore();

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => mesa.items.length > 0 || mesa.llamada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.replace("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">📢 Panel Camarero</h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">Ninguna mesa activa 🍻</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = mesa.items.filter((i) => !i.entregado).length;

            return (
              <div key={mesaId} className="bg-surface p-4 rounded-xl shadow-md border border-border">

                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                  {/* 🔔 Si está llamando */}
                  {mesa.llamada && (
                    <span className="bg-primary text-white py-1 px-3 text-sm rounded-full font-semibold animate-bounce">
                      🛎️ Llamando
                    </span>
                  )}
                </div>

                {/* 🍽️ Ítems */}
                <div className="space-y-2 mb-4">
                  {mesa.items.map((item) => (
                    <div
                      key={`${item.id}-${item.timestamp}`}
                      className={`flex justify-between items-center p-2 rounded-lg border text-sm 
                      ${item.entregado ? "bg-green-100 border-green-300" : "bg-yellow-100 border-yellow-300"}`}
                    >
                      <span>{item.qty}x {item.name}</span>
                      <button
                        onClick={() => marcarServido(mesaId, item.timestamp)}
                        className="px-2 py-1 rounded bg-primary text-white text-xs font-semibold"
                      >
                        {item.entregado ? "✅" : "✔️"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* ✅ Atender llamada */}
                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full bg-primary text-white py-2 rounded-lg font-bold mb-2"
                  >
                    ✅ Atender Llamada
                  </button>
                )}

                {/* ✅ Cobrar */}
                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-danger text-white py-2 rounded-lg font-bold"
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
