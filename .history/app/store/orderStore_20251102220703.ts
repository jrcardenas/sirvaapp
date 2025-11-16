import { create } from "zustand";
import { persist } from "zustand/middleware";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type MesaOrders = {
  [mesaId: string]: OrderItem[];
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string, items: OrderItem[]) => void;
  clearMesa: (mesaId: string) => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      mesas: {},

      addToMesa: (mesaId, items) =>
        set((state) => {
          const current = state.mesas[mesaId] || [];
          const updated = [...current];

          items.forEach((item) => {
            const existing = updated.find((i) => i.id === item.id);
            if (existing) {
              existing.qty += item.qty; // ✅ Se suma si existe
            } else {
              updated.push({ ...item }); // ✅ Se añade nuevo producto
            }
          });

          return {
            mesas: {
              ...state.mesas,
              [mesaId]: updated,
            },
          };
        }),

      clearMesa: (mesaId) =>
        set((state) => ({
          mesas: { ...state.mesas, [mesaId]: [] },
        })),
    }),
    { name: "order-storage" }
  )
);
