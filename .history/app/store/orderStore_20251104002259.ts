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

// ✅ Canales Broadcast
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

        const updatedMesa: MesaState = {
          ...mesa,
          items: [...mesa.items, ...nuevosItems],
        };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        get()._notifyChanges();
      },

      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updatedMesa: MesaState = {
          ...mesa,
          items: mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, entregado: true } : i
          ),
        };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        get()._notifyChanges();
      },

      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updatedMesa: MesaState = {
          ...mesa,
          cuentaSolicitada: true,
        };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        notifyChannel?.postMessage({ mesaId, cuentaSolicitada: true });
        get()._notifyChanges();
      },

      cobrarMesa: (mesaId) => {
        const updatedMesa: MesaState = {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        notifyChannel?.postMessage({ mesaId, cobrado: true });
        get()._notifyChanges();
      },

      limpiarMesa: (mesaId) => {
        const updatedMesa: MesaState = {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        get()._notifyChanges();
      },

      llamarCamarero: (mesaId) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        const updatedMesa: MesaState = { ...mesa, llamada: true };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        notifyChannel?.postMessage({ mesaId, llamada: true });
        get()._notifyChanges();
      },

      atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const updatedMesa: MesaState = { ...mesa, llamada: false };

        set({
          mesas: { ...get().mesas, [mesaId]: updatedMesa },
        });

        notifyChannel?.postMessage({ mesaId, respondido: true });
        get()._notifyChanges();
      },

      _notifyChanges: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);

// ✅ Escucha de cambios desde otros clientes
if (notifyChannel) {
  notifyChannel.onmessage = (ev) => {
    const { mesaId, llamada, respondido, cuentaSolicitada } = ev.data;
    const mesas = useOrderStore.getState().mesas;
    const mesaActual = mesas[mesaId];

    if (!mesaActual) return;

    const updatedMesa: MesaState = { ...mesaActual };

    if (typeof llamada === "boolean") updatedMesa.llamada = llamada;
    if (respondido) updatedMesa.llamada = false;
    if (cuentaSolicitada) updatedMesa.cuentaSolicitada = true;

    useOrderStore.setState({
      mesas: { ...mesas, [mesaId]: updatedMesa },
    });
  };
}
