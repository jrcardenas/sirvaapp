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
  removeItem: (id: string, note?: string) => void;
  totalItems: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item: CartItem) => {
    const existing = get().items.find(
      (i) => i.id === item.id && i.note === item.note
    );

    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === existing.id && i.note === existing.note
            ? { ...i, qty: i.qty + item.qty }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },

  removeItem: (id, note) =>
    set({
      items: get().items.filter(
        (i) => !(i.id === id && i.note === note)
      ),
    }),

  get totalItems() {
    return get().items.reduce((acc, i) => acc + i.qty, 0);
  },
}));
