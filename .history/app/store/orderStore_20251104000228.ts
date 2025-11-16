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
  llamada: boolean; // ✅ nuevo
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
  llamarCamarero: (mesaId: string) => void; // ✅ nuevo
  atenderLlamada: (mesaId: string) => void; // ✅ nuevo
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

      addToMesa: (mesaId, items) => {
        const mesa = get().mesas[mesaId];
        const currentItems = mesa?.items ?? [];
        const cuentaSolicitada = mesa?.cuentaSolicitada ?? false;
        const llamada = mesa?.llamada ?? false;

        const nuevosPedidos = items.map((i) => ({
          ...i,
          entregado: false,
          timestamp: Date.now(),
        }));

        const updated: MesaState = {
          items: [...currentItems, ...nuevosPedidos],
          cuentaSolicitada,
          llamada,
        };

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();
      },

      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updated: MesaState = {
          ...mesa,
          items: mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, entregado: true } : i
          ),
        };

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();
      },

      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updated: MesaState = {
          ...mesa,
          cuentaSolicitada: true,
        };

        set({ mesas: { ...get().mesas, [mesaId]: updated } });
        get()._notifyChanges();

        notifyChannel?.postMessage({ mesaId, cuentaSolicitada: true });
      },

      cobrarMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { items: [], cuentaSolicitada: false, llamada: false },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, cobrado: true });
      },

      clearMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { items: [], cuentaSolicitada: false, llamada: false },
          },
        });

        get()._notifyChanges();
      },

      // ✅ Cliente llama al camarero
      llamarCamarero: (mesaId) => {
        const mesa = get().mesas[mesaId] ?? { items: [], cuentaSolicitada: false, llamada: false };

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { ...mesa, llamada: true },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, llamada: true });
      },

      // ✅ Camarero atiende → reset
      atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { ...mesa, llamada: false },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, respondido: true });
      },

      _notifyChanges: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

// ✅ Sincronización tiempo real entre admin y cliente
notifyChannel &&
  (notifyChannel.onmessage = (ev) => {
    const { mesaId, llamada, respondido } = ev.data;
    const mesas = useOrderStore.getState().mesas;
    const mesa = mesas[mesaId];

    if (!mesa) return;

    if (typeof llamada === "boolean") {
      mesa.llamada = llamada;
    }
    if (respondido) {
      mesa.llamada = false;
    }

    useOrderStore.setState({ mesas: { ...mesas } });
  });
