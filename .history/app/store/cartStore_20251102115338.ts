import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  changeQty: (id: string, qty: number) => void;
  removeItem: (id: string, note?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const exists = get().items.find(
      (i) => i.id === item.id && i.note === item.note
    );

    if (exists) {
      set({
        items: get().items.map((i) =>
          i.id === item.id && i.note === item.note
            ? { ...i, qty: i.qty + item.qty }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },

  changeQty: (id, qty) => {
    if (qty < 1) return; // ✅ regla elegida (A)
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, qty } : i
      ),
    });
  },

  removeItem: (id, note) =>
    set({
      items: get().items.filter(
        (i) => !(i.id === id && i.note === note)
      ),
    }),

  clearCart: () => set({ items: [] }),

  get totalItems() {
    return get().items.reduce((acc, i) => acc + i.qty, 0);
  },

  get totalAmount() {
    return get().items.reduce((acc, i) => acc + i.qty * i.price, 0);
  },
}));
