import { create } from "zustand";
import { persist } from "zustand/middleware";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  mesa: string;
  items: OrderItem[];
  date: string;
};

type OrderStore = {
  orders: Order[];
  addOrder: (mesa: string, items: OrderItem[]) => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (mesa, items) =>
        set((state) => ({
          orders: [
            ...state.orders,
            {
              mesa,
              items,
              date: new Date().toISOString(),
            },
          ],
        })),
    }),
    { name: "order-storage" } // ✅ Persistencia local
  )
);
