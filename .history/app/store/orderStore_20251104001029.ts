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
  llamada: boolean;
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
  limpiarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
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
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        const nuevosItems = items.map((i) => ({
          ...i,
          entregado: false,
          timestamp: Date.now(),
        }));

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: {
              ...mesa,
              items: [...mesa.items, ...nuevosItems],
            },
          },
        });

        get()._notifyChanges();
      },

      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: {
              ...mesa,
              items: mesa.items.map((i) =>
                i.timestamp === timestamp
                  ? { ...i, entregado: true }
                  : i
              ),
            },
          },
        });

        get()._notifyChanges();
      },

      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { ...mesa, cuentaSolicitada: true },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, cuentaSolicitada: true });
      },

      cobrarMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: {
              items: [],
              cuentaSolicitada: false,
              llamada: false,
            },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, cobrado: true });
      },

      limpiarMesa: (mesaId) => {
        set({
          mesas: {
            ...get().mesas,
            [mesaId]: {
              items: [],
              cuentaSolicitada: false,
              llamada: false,
            },
          },
        });

        get()._notifyChanges();
      },

      llamarCamarero: (mesaId) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { ...mesa, llamada: true },
          },
        });

        get()._notifyChanges();
        notifyChannel?.postMessage({ mesaId, llamada: true });
      },

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

// ✅ Sincronización real
notifyChannel &&
  (notifyChannel.onmessage = (ev) => {
    const { mesaId, llamada, respondido } = ev.data;
    const mesas = useOrderStore.getState().mesas;
    const mesa = mesas[mesaId];
    if (!mesa) return;

    if (typeof llamada === "boolean") mesa.llamada = llamada;
    if (respondido) mesa.llamada = false;

    useOrderStore.setState({ mesas: { ...mesas } });
  });
