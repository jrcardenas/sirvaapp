import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
};

type MesaOrders = {
  [mesaId: string]: PedidoItem[];
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  marcarServido: (mesaId: string, idProducto: string) => void;
  clearMesa: (mesaId: string) => void;
  _notifyChanges: () => void;
};

const channel = typeof window !== "undefined"
  ? new BroadcastChannel("pedidos_channel")
  : null;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      addToMesa: (mesaId, items) => {
        const current = get().mesas[mesaId] || [];
        const updated = [...current];

        items.forEach((item) => {
          const existing = updated.find((i) => i.id === item.id);
          if (existing) {
            existing.qty += item.qty;
          } else {
            updated.push({ ...item, entregado: false });
          }
        });

        const newState = {
          ...get().mesas,
          [mesaId]: updated,
        };

        set({ mesas: newState });
        get()._notifyChanges();
      },

      marcarServido: (mesaId, idProducto) => {
        const updated = get().mesas[mesaId].map((i) =>
          i.id === idProducto ? { ...i, entregado: !i.entregado } : i
        );
        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();
      },

      clearMesa: (mesaId) => {
        set({ mesas: { ...get().mesas, [mesaId]: [] } });
        get()._notifyChanges();
      },

      _notifyChanges: () => {
        if (channel) {
          channel.postMessage({ mesas: get().mesas });
        }
      },
    }),

    { name: "order-storage" }
  )
);

// 🔥 Recibir sincronización en otros dispositivos
if (channel) {
  channel.onmessage = (ev) => {
    useOrderStore.setState({ mesas: ev.data.mesas });
  };
}
