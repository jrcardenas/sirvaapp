"use client";

import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
};

type CartState = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  changeQty: (id: string, newQty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // ✅ Añadir producto o sumar si ya existe
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id && i.note === item.note
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.note === item.note
              ? { ...i, qty: i.qty + item.qty }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  // ✅ Reducir / aumentar cantidad
  changeQty: (id, newQty) =>
    set((state) => {
      if (newQty <= 0) {
        // 🔥 Eliminar producto cuando llegue a 0
        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, qty: newQty } : item
        ),
      };
    }),

  // ✅ Eliminar producto manualmente
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  // ✅ Vaciar carrito
  clearCart: () => set({ items: [] }),
}));
