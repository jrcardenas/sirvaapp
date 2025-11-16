"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada, atenderCuenta } =
    useOrderStore();

  const dingRef = useRef<HTMLAudioElement | null>(null);

  // Cargar sonido una sola vez
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 1;
  }, []);

  // Proteger acceso admin
  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // 🔔 Sonido SOLO cuando el CLIENTE llama o pide cuenta
  useEffect(() => {
    const notify = new BroadcastChannel("notify_channel");
    notify.onmessage = (ev) => {
      const data = ev.data || {};
      // Suena solo si viene de cliente: llamada o cuentaSolicitada
      if (data.llamada === true || data.cuentaSolicitada === true) {
        dingRef.current?.play().catch(() => null);
      }
      // Ignora: llamadaAtendida, cuentaAtendida, cobrado (acciones del camarero)
    };
    return () => notify.close();
  }, []);

  // 🔔 Sonido SOLO cuando el CLIENTE hace pedido nuevo (nuevoPedido === true)
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data || {};
      if (data.mesas) {
        // Sincroniza el estado
        useOrderStore.setState({ mesas: data.mesas });
        // Suena solo si se marcó explícitamente como nuevo pedido
        if (data.nuevoPedido === true) {
          dingRef.current?.play().catch(() => null);
        }
      }
    };
    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, mesa]) =>
      (mesa.items?.length ?? 0) > 0 || mesa.llamada || mesa.cuentaSolicitada
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
        📢 Panel Camarero
      </h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            const pendientes =
              (mesa.items ?? []).filter((i) => !i.entregado).length;

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

                {/* Lista items */}
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

                {/* Atender llamada */}
                {mesa.llamada && (
                  <button
                    onClick={() => atenderLlamada(mesaId)}
                    className="w-full bg-primary text-white py-2 rounded-xl font-bold mb-2"
                  >
                    👋 Atender llamada
                  </button>
                )}

                {/* Atender cuenta */}
                {mesa.cuentaSolicitada && (
                  <button
                    onClick={() => atenderCuenta(mesaId)}
                    className="w-full bg-blue-700 text-white py-2 rounded-xl font-bold mb-2"
                  >
                    ✅ Cuenta atendida
                  </button>
                )}

                {/* Cobrar (no bloquear por cuenta para simplificar flujo) */}
                {!mesa.llamada && (
                  <button
                    onClick={() => cobrarMesa(mesaId)}
                    className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold"
                  >
                    💳 Cobrar Mesa
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
