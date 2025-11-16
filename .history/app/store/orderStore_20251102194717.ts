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
        set((state) => ({
          mesas: {
            ...state.mesas,
            [mesaId]: [...(state.mesas[mesaId] || []), ...items],
          },
        })),

      clearMesa: (mesaId) =>
        set((state) => ({
          mesas: { ...state.mesas, [mesaId]: [] },
        })),
    }),
    { name: "order-storage" }
  )
);
