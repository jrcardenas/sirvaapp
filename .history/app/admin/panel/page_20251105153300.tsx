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
  personalizado?: boolean; // ✅ NUEVO
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts?: { id: string; name: string; price: number }[]; // ✅ NUEVO
};

type MesaOrders = {
  [mesaId: string]: MesaState;
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  addCustomProduct: (mesaId: string, name: string, price: number) => void; // ✅ NUEVO
  incrementarItem: (mesaId: string, itemId: string) => void;
  reducirItem: (mesaId: string, itemId: string) => void;
  marcarServido: (mesaId: string, timestamp: number) => void;
  cobrarMesa: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  _sync: () => void;
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
        get()._sync();
      },

      addCustomProduct: (mesaId, name, price) => {
        const mesa = get().mesas[mesaId] ?? {
          items: [],
          customProducts: [],
          cuentaSolicitada: false,
          llamada: false,
        };

        const id = "custom-" + Date.now(); // ID único

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
        get()._sync();
      },

      incrementarItem: (mesaId, itemId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;
        const itemRef = mesa.items.find(i => i.id === itemId);
        if (!itemRef) return;

        mesa.items.push({ ...itemRef, entregado: false, timestamp: Date.now() });
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
            [mesaId]: { items: [], cuentaSolicitada: false, llamada: false, customProducts: [] },
          },
        });
        get()._sync();
      },

      llamarCamarero: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;
        mesa.llamada = true;
        set({ mesas: { ...get().mesas } });
        get()._sync();
      },

      atenderLlamada: (mesaId) => {
        const mesa = get().mesas[mesaId];
        if (!mesa) return;
        mesa.llamada = false;
        set({ mesas: { ...get().mesas } });
        get()._sync();
      },

      _sync: () => {
        pedidosChannel?.postMessage({ mesas: get().mesas });
      },
    }),
    { name: "order-storage" }
  )
);
