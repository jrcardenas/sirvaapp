import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number; // Identifica cada pedido individual
};

type MesaOrders = {
  [mesaId: string]: PedidoItem[];
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  marcarServido: (mesaId: string, idProducto: string, timestamp: number) => void;
  cobrarMesa: (mesaId: string) => void;
  clearMesa: (mesaId: string) => void;
  _notifyChanges: () => void;
};

const pedidosChannel =
  typeof window !== "undefined"
    ? new BroadcastChannel("pedidos_channel")
    : null;

const notifyChannel =
  typeof window !== "undefined"
    ? new BroadcastChannel("notify_channel")
    : null;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      // ✅ Cada pedido es una línea nueva → No se acumulan cantidades
      addToMesa: (mesaId, items) => {
        const current = get().mesas[mesaId] || [];

        const updated = [
          ...current,
          ...items.map((i) => ({
            ...i,
            entregado: false,
            timestamp: Date.now(),
          })),
        ];

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();
      },

      // ✅ Marca servido solo ese pedido individual
      marcarServido: (mesaId, idProducto, timestamp) => {
        const updated = get().mesas[mesaId]?.map((i) =>
          i.id === idProducto && i.timestamp === timestamp
            ? { ...i, entregado: true }
            : i
        );

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();

        const item = updated?.find(
          (i) => i.id === idProducto && i.timestamp === timestamp
        );

        if (item && notifyChannel) {
          notifyChannel.postMessage({
            mesaId,
            idProducto,
            estado: item.entregado,
          });
        }
      },

      cobrarMesa: (mesaId) => {
        set({ mesas: { ...get().mesas, [mesaId]: [] } });
        get()._notifyChanges();

        if (notifyChannel) {
          notifyChannel.postMessage({ mesaId, cobrado: true });
        }
      },

      clearMesa: (mesaId) => {
        set({ mesas: { ...get().mesas, [mesaId]: [] } });
        get()._notifyChanges();
      },

      _notifyChanges: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

// ✅ Sincroniza admin y cliente en tiempo real
pedidosChannel &&
  (pedidosChannel.onmessage = (ev) => {
    useOrderStore.setState({ mesas: ev.data.mesas });
  });
