/* ✅ orderStore.ts */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number;
  personalizado?: boolean;
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts?: { id: string; name: string; price: number }[];
};

type MesaOrders = {
  [mesaId: string]: MesaState;
};

type SyncEvent = {
  tipo?:
    | "nuevoPedido"
    | "llamada"
    | "llamadaAtendida"
    | "cuenta"
    | "cuentaAtendida"
    | "mesaCobrada"
    | "añadidoPorCamarero";
  mesaId?: string;
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  addCustomProduct: (mesaId: string, name: string, price: number) => void;
  incrementarItem: (mesaId: string, itemId: string) => void;
  reducirItem: (mesaId: string, itemId: string) => void;
  marcarServido: (mesaId: string, timestamp: number) => void;
  cobrarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  pedirCuenta: (mesaId: string) => void;
  atenderCuenta: (mesaId: string) => void;
  _sync: (extra?: SyncEvent) => void;
};

const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      /** ✅ Ya no usa push ni mutación directa */
      addToMesa: (mesaId, items) => {
        const state = get().mesas;

        const mesa: MesaState = {
          items: [...(state[mesaId]?.items ?? [])],
          cuentaSolicitada: state[mesaId]?.cuentaSolicitada ?? false,
          llamada: state[mesaId]?.llamada ?? false,
          customProducts: state[mesaId]?.customProducts ?? [],
        };

        const now = Date.now();
        let counter = 0;

        const nuevos = items.flatMap((i) =>
          Array.from({ length: i.qty }).map(() => ({
            ...i,
            qty: 1,
            entregado: false,
            timestamp: now + counter++,
          }))
        );

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [...mesa.items, ...nuevos],
            },
          },
        });

        get()._sync({ tipo: "nuevoPedido", mesaId });
      },

      /** ✅ Corregido para no mutar estado y evitar errores en móvil */
      addCustomProduct: (mesaId, name, price) => {
        const state = get().mesas;
        const mesa: MesaState = {
          items: [...(state[mesaId]?.items ?? [])],
          cuentaSolicitada: state[mesaId]?.cuentaSolicitada ?? false,
          llamada: state[mesaId]?.llamada ?? false,
          customProducts: state[mesaId]?.customProducts ?? [],
        };

        const id = "custom-" + Date.now();

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [
                ...mesa.items,
                {
                  id,
                  name,
                  price,
                  qty: 1,
                  entregado: false,
                  timestamp: Date.now(),
                  personalizado: true,
                },
              ],
set({
  mesas: {
    ...state,
    [mesaId]: {
      ...mesa,
      items: [
        ...mesa.items,
        {
          id,
          name,
          price,
          qty: 1,
          entregado: false,
          timestamp: Date.now(),
          personalizado: true,
        },
      ],
      customProducts: [...(mesa.customProducts ?? []), { id, name, price }],
    },
  },
});
            },
          },
        });

        get()._sync({ tipo: "añadidoPorCamarero", mesaId });
      },

      /** ✅ corregido */
      incrementarItem: (mesaId, itemId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        const ref = mesa.items.find((i) => i.id === itemId);
        if (!ref) return;

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [
                ...mesa.items,
                { ...ref, entregado: false, timestamp: Date.now() },
              ],
            },
          },
        });

        get()._sync();
      },

      reducirItem: (mesaId, itemId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        const idx = mesa.items.findIndex(
          (i) => i.id === itemId && !i.entregado
        );
        if (idx === -1) return;

        const newItems = [...mesa.items];
        newItems.splice(idx, 1);

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, items: newItems },
          },
        });

        get()._sync();
      },

      marcarServido: (mesaId, timestamp) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: mesa.items.map((i) =>
                i.timestamp === timestamp ? { ...i, entregado: true } : i
              ),
            },
          },
        });

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
              customProducts: [],
            },
          },
        });

        get()._sync({ tipo: "mesaCobrada", mesaId });
      },

      llamarCamarero: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, llamada: true },
          },
        });

        get()._sync({ tipo: "llamada", mesaId });
      },

      atenderLlamada: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, llamada: false },
          },
        });

        get()._sync({ tipo: "llamadaAtendida", mesaId });
      },

      pedirCuenta: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, cuentaSolicitada: true },
          },
        });

        get()._sync({ tipo: "cuenta", mesaId });
      },

      atenderCuenta: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, cuentaSolicitada: false },
          },
        });

        get()._sync({ tipo: "cuentaAtendida", mesaId });
      },

      _sync: (extra) => {
        pedidosChannel?.postMessage({
          mesas: get().mesas,
          ...extra,
        });
      },
    }),
    { name: "order-storage" }
  )
);
