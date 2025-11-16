import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number;
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
};

type MesaOrders = {
  [mesaId: string]: MesaState;
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  marcarServido: (mesaId: string, timestamp: number) => void;
  pedirCuenta: (mesaId: string) => void;
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

      // ✅ Añadir pedidos como líneas independientes
      addToMesa: (mesaId, items) => {
        const mesa = get().mesas[mesaId] || {
          items: [],
          cuentaSolicitada: false,
        };

        const nuevosPedidos = items.map((i) => ({
          ...i,
          entregado: false,
          timestamp: Date.now(),
        }));

        const updated = {
          ...mesa,
          items: [...mesa.items, ...nuevosPedidos],
        };

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();
      },

      // ✅ Marca solo el ítem específico servido
      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updatedMesa = {
          ...mesa,
          items: mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, entregado: true } : i
          ),
        };

        set({ mesas: { ...get().mesas, [mesaId]: updatedMesa } });
        get()._notifyChanges();
      },

      // ✅ Cliente pide cuenta → Se bloquea repetir acción
      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updated = {
          ...mesa,
          cuentaSolicitada: true,
        };

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();

        notifyChannel?.postMessage({ mesaId, cuentaSolicitada: true });
      },

      // ✅ Camarero cobra → Vacía todo y desbloquea cuenta
      cobrarMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { items: [], cuentaSolicitada: false },
          },
        });

        get()._notifyChanges();

        notifyChannel?.postMessage({ mesaId, cobrado: true });
      },

      clearMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { items: [], cuentaSolicitada: false },
          },
        });

        get()._notifyChanges();
      },

      _notifyChanges: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

// ✅ Sincronización en tiempo real entre admin y cliente
pedidosChannel &&
  (pedidosChannel.onmessage = (ev) => {
    useOrderStore.setState({ mesas: ev.data.mesas });
  });
