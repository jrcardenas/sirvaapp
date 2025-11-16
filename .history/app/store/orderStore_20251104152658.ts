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
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void; ✅
  _sync: () => void;
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

        const nuevos = items.map((i) => ({
          ...i,
          entregado: false,
          timestamp: Date.now(),
        }));

        set({
          mesas: {
            ...get().mesas,
            [mesaId]: { ...mesa, items: [...mesa.items, ...nuevos] },
          },
        });

        get()._sync();
      },

      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.items = mesa.items.map((i) =>
          i.timestamp === timestamp ? { ...i, entregado: true } : i
        );

        set({ mesas: { ...get().mesas } });
        get()._sync();
      },

      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.cuentaSolicitada = true;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, cuenta: true });
        get()._sync();
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

        notifyChannel?.postMessage({ mesaId, cobrado: true });
        get()._sync();
      },

      llamarCamarero: (mesaId) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        mesa.llamada = true;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, llamada: true });
        get()._sync();
      },

      ✅ atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.llamada = false;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, llamada: false });
        get()._sync();
      },

      _sync: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

// ✅ Sincronización visual entre pestañas
if (notifyChannel) {
  notifyChannel.onmessage = (ev) => {
    const mesas = useOrderStore.getState().mesas;
    const { mesaId, llamada, cuenta, cobrado } = ev.data;

    if (!mesas[mesaId]) return;

    if (typeof llamada === "boolean") mesas[mesaId].llamada = llamada;
    if (cuenta) mesas[mesaId].cuentaSolicitada = true;
    if (cobrado) mesas[mesaId] = { items: [], cuentaSolicitada: false, llamada: false };

    useOrderStore.setState({ mesas: { ...mesas } });
  };
}
