"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada } = useOrderStore();

  // ✅ Ruta protegida
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin/login");
    }
  }, [router]);

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  // ✅ Cargar sonido
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 0.7;
  }, []);

  // ✅ Avisos de llamada en tiempo real
  useEffect(() => {
    const ch = new BroadcastChannel("notify_channel");
    ch.onmessage = (ev) => {
      if (ev.data?.llamada === true) {
        setSoundReady(true);
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => ch.close();
  }, []);

  // ✅ Mostrar cualquier mesa con pedidos o llamada activa
  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) => mesa.items.length > 0 || mesa.llamada === true
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative animate-fade-in">

      {/* ✅ Banners de llamada en la parte superior */}
      {Object.entries(mesas)
        .filter(([, mesa]) => mesa.llamada)
        .map(([mesaId]) => (
          <div
            key={mesaId}
            className="bg-danger text-white font-bold text-center py-3 px-4 rounded-xl shadow-lg mb-3 animate-pulse"
          >
            🔔 Mesa {mesaId} está llamando
            <button
              className="ml-3 underline font-bold"
              onClick={() =>
                document.getElementById(`mesa-${mesaId}`)?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              📍 Ir
            </button>
          </div>
        ))}

      {/* ✅ Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin/login");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold shadow-md active:scale-95"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
        📢 Panel Camarero
      </h1>

      {!soundReady && (
        <div className="flex justify-center mb-4">
          <button
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-md active:scale-95"
            onClick={() =>
              dingRef.current?.play().finally(() => setSoundReady(true))
            }
          >
            🔊 Activar sonido
          </button>
        </div>
      )}

      {/* ✅ Listado mesas */}
      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes = mesa.items.filter((i) => !i.entregado).length;

            return (
              <div
                id={`mesa-${mesaId}`}
                key={mesaId}
                className={`p-4 rounded-xl shadow-md border ${
                  mesa.llamada
                    ? "bg-danger/10 border-danger animate-pulse"
                    : "bg-surface border-border"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                  {mesa.llamada ? (
                    <span className="bg-danger text-white py-1 px-3 text-sm rounded-full font-bold animate-pulse">
                      🛎️ Llamando
                    </span>
                  ) : pendientes > 0 ? (
                    <span className="bg-accent text-white py-1 px-3 text-sm rounded-full font-bold animate-pulse">
                      {pendientes} Pend.
                    </span>
                  ) : null}
                </div>

                {/* ✅ Items */}
                {mesa.items.length > 0 && (
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
                        <span>
                          {item.qty}x {item.name}
                        </span>

                        {!item.entregado && (
                          <button
                            onClick={() =>
                              marcarServido(mesaId, item.timestamp)
                            }
                            className="px-2 py-1 text-xs bg-primary text-white rounded-lg font-semibold active:scale-95"
                          >
                            ✅ Servido
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Atender llamada */}
                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full bg-primary text-white py-2 rounded-xl font-bold shadow-md active:scale-95 mb-2"
                  >
                    👋 Atender llamada
                  </button>
                )}

                {/* ✅ Cobrar mesa */}
                <button
                  onClick={() => cobrarMesa(mesaId)}
                  className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold shadow-md active:scale-95"
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
