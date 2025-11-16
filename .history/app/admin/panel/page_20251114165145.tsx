"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

type GrupoItem = {
  id: string;
  name: string;
  price: number;
  pendientes: number;
  servidos: number;
};

type MenuItemType = {
  id: string;
  name: string;
  price: number;
};

export default function AdminPanel() {
  const router = useRouter();
  const {
    mesas,
    marcarServido,
    incrementarItem,
    reducirItem,
    cobrarMesa,
    atenderLlamada,
    atenderCuenta,
    addCustomProduct,
    confirmarItem,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current.volume = 1;
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // 🔄 Sincronización en tiempo real
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data?.mesas) return;

      useOrderStore.setState({ mesas: structuredClone(data.mesas) });

      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo)) {
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => pedidos.close();
  }, []);

  function enviarAvisoCliente(mesaId: string, mensaje: string) {
    const notify = new BroadcastChannel("notify_channel");
    notify.postMessage({ mesaId, mensaje });
    notify.close();
  }

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());

  const mesasOrdenadas = mesasIds.sort((a, b) => {
    const ma =
      mesas[a] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };
    const mb =
      mesas[b] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };

    const pendientesA = ma.items?.filter((i) => !i.entregado).length ?? 0;
    const pendientesB = mb.items?.filter((i) => !i.entregado).length ?? 0;

    if (ma.llamada !== mb.llamada) return ma.llamada ? -1 : 1;
    if (ma.cuentaSolicitada !== mb.cuentaSolicitada)
      return ma.cuentaSolicitada ? -1 : 1;
    if (pendientesA !== pendientesB) return pendientesB - pendientesA;

    const servidosA = ma.items?.filter((i) => i.entregado).length ?? 0;
    const servidosB = mb.items?.filter((i) => i.entregado).length ?? 0;
    return servidosB - servidosA;
  });

  const productosFiltrados: MenuItemType[] = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">🏪 Administrador del bar</h1>

      <div className="space-y-6">
        {mesasOrdenadas.map((mesaId) => {
          const mesa =
            mesas[mesaId] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };

          const agrupados = Object.values(
            (mesa.items ?? []).reduce<Record<string, GrupoItem>>((acc, it) => {
              if (!acc[it.id]) {
                acc[it.id] = { id: it.id, name: it.name, price: it.price, pendientes: 0, servidos: 0 };
              }
              it.entregado ? acc[it.id].servidos++ : acc[it.id].pendientes++;
              return acc;
            }, {})
          );

          const allServed = agrupados.every((i) => i.pendientes === 0);
          const totalCuenta = agrupados.reduce((a, i) => a + i.price * i.servidos, 0);
