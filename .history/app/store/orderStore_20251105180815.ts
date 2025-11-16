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
  tipo?: "nuevoPedido" | "llamada" | "llamadaAtendida" | "cuenta" | "mesaCobrada";
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
  _sync: (extra?: SyncEvent) => void;
};

const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      addToMesa: (mesaId, items) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
          customProducts: [],
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

        mesa.items.push(...nuevos);
        set({ mesas: { ...get().mesas, [mesaId]: mesa } });

        get()._sync({ tipo: "nuevoPedido", mesaId });
      },

      addCustomProduct: (mesaId, name, price) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
          customProducts: [],
        };

        const id = "custom-" + Date.now();
        mesa.items.push({
          id,
          name,
          price,
          qty: 1,
          entregado: false,
          timestamp: Date.now(),
          personalizado: true,
        });

        mesa.customProducts = [...(mesa.customProducts ?? []), { id, name, price }];

        set({ mesas: { ...get().mesas, [mesaId]: mesa } });
        get()._sync({ tipo: "nuevoPedido", mesaId });
      },

      incrementarItem: (mesaId, itemId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const ref = mesa.items.find(i => i.id === itemId);
        if (!ref) return;

        mesa.items.push({ ...ref, entregado: false, timestamp: Date.now() });

        set({ mesas: { ...get().mesas } });
        get()._sync();
      },

      reducirItem: (mesaId, itemId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        const idx = mesa.items.findIndex(i => i.id === itemId && !i.entregado);
        if (idx === -1) return;

        mesa.items.splice(idx, 1);

        set({ mesas: { ...get().mesas } });
        get()._sync();
      },

      marcarServido: (mesaId, timestamp) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.items = mesa.items.map(i =>
          i.timestamp === timestamp ? { ...i, entregado: true } : i
        );

        set({ mesas: { ...get().mesas } });
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
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.llamada = true;

        set({ mesas: { ...get().mesas } });
        get()._sync({ tipo: "llamada", mesaId });
      },

      atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.llamada = false;

        set({ mesas: { ...get().mesas } });
        get()._sync({ tipo: "llamadaAtendida", mesaId });
      },
      atenderCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.cuentaSolicitada = false;

        set({ mesas: { ...get().mesas } });
        get()._sync({ tipo: "cuentaAtendida", mesaId });
      },
      pedirCuenta: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;

        mesa.cuentaSolicitada = true;

        set({ mesas: { ...get().mesas } });
        get()._sync({ tipo: "cuenta", mesaId });
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
