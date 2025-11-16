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
  atenderCuenta: (mesaId: string) => void;
  cobrarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  _syncNoSound: () => void;
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

        pedidosChannel?.postMessage({ mesas: get().mesas, nuevoPedido: true });
      },

marcarServido: (mesaId, timestamp) => {
  const mesa = get().mesas[mesaId];
  if (!mesa) return;

  mesa.items = mesa.items.map((i) =>
    i.timestamp === timestamp ? { ...i, entregado: true } : i
  );

  set({ mesas: { ...get().mesas } });

  // ✅ Sync en ambos canales sin sonido
  pedidosChannel?.postMessage({ mesas: get().mesas });
  notifyChannel?.postMessage({ mesas: get().mesas });
},
,

      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.cuentaSolicitada = true;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, cuentaSolicitada: true });
        get()._syncNoSound();
      },

      atenderCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.cuentaSolicitada = false;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, cuentaAtendida: true });
        get()._syncNoSound();
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
        get()._syncNoSound();
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
        get()._syncNoSound();
      },

      atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.llamada = false;
        set({ mesas: { ...get().mesas } });

        notifyChannel?.postMessage({ mesaId, llamadaAtendida: true });
        get()._syncNoSound();
      },

      _syncNoSound: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

if (notifyChannel) {
  notifyChannel.onmessage = (ev) => {
    const mesas = useOrderStore.getState().mesas;
    const { mesaId, llamada, llamadaAtendida, cuentaSolicitada, cuentaAtendida, cobrado } = ev.data;

    if (!mesas[mesaId]) return;

    if (typeof llamada === "boolean") mesas[mesaId].llamada = llamada;
    if (llamadaAtendida) mesas[mesaId].llamada = false;
    if (cuentaSolicitada) mesas[mesaId].cuentaSolicitada = true;
    if (cuentaAtendida) mesas[mesaId].cuentaSolicitada = false;
    if (cobrado)
      mesas[mesaId] = { items: [], cuentaSolicitada: false, llamada: false };

    useOrderStore.setState({ mesas: { ...mesas } });
  };
}
