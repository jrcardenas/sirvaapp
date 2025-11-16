import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ---------- Tipos ---------- */
export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number;
  personalizado?: boolean;
  estado?: "pendiente" | "pendienteCocina" | "preparando" | "preparado";
};

export type PedidoSource = Pick<PedidoItem, "id" | "name" | "price" | "qty">;

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts: { id: string; name: string; price: number }[];
};

type MesaOrders = Record<string, MesaState>;

type SyncEvent = {
  tipo?:
    | "nuevoPedido"
    | "pedidoConfirmado"
    | "pedidoActualizado"
    | "llamada"
    | "llamadaAtendida"
    | "cuenta"
    | "cuentaAtendida"
    | "mesaCobrada"
    | "añadidoPorCamarero"
    | "actualizadoPorCocina";
  mesaId?: string;
};

/* ---------- Store API ---------- */
type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string | number, items: PedidoSource[]) => void;
  addCustomProduct: (mesaId: string | number, name: string, price: number) => void;
  confirmarItem: (mesaId: string | number, timestamp: number) => void;
  actualizarEstadoItem: (
    mesaId: string | number,
    timestamp: number,
    estado: PedidoItem["estado"]
  ) => void;
  marcarServido: (mesaId: string | number, timestamp: number) => void;
  incrementarItem: (mesaId: string | number, itemId: string) => void;
  reducirItem: (mesaId: string | number, itemId: string) => void;
  cobrarMesa: (mesaId: string | number) => void;
  llamarCamarero: (mesaId: string | number) => void;
  atenderLlamada: (mesaId: string | number) => void;
  pedirCuenta: (mesaId: string | number) => void;
  atenderCuenta: (mesaId: string | number) => void;
  _sync: (extra?: SyncEvent) => void;
};

/* ---------- Helpers ---------- */
const toKey = (id: string | number) => String(id);

const emptyMesa = (): MesaState => ({
  items: [],
  cuentaSolicitada: false,
  llamada: false,
  customProducts: [],
});

const ensureMesa = (mesas: MesaOrders, mesaKey: string): MesaState =>
  mesas[mesaKey] ?? emptyMesa();

const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

/* ---------- Utilidades ---------- */
const updateEstadoItem = (
  items: PedidoItem[],
  timestamp: number,
  estado: NonNullable<PedidoItem["estado"]>
): PedidoItem[] =>
  items.map((i) =>
    i.timestamp === timestamp ? { ...i, estado } : i
  );

const markServido = (items: PedidoItem[], timestamp: number): PedidoItem[] =>
  items.map((i) =>
    i.timestamp === timestamp ? { ...i, entregado: true } : i
  );

/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      addToMesa: (mesaId, items) => {
        const key = toKey(mesaId);
        const now = Date.now();
        let counter = 0;

        const nuevos: PedidoItem[] = items.flatMap((i) =>
          Array.from({ length: Math.max(1, i.qty ?? 1) }).map(() => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: 1,
            entregado: false,
            estado: "pendiente",
            timestamp: now + counter++,
          }))
        );

        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: {
              ...state.mesas,
              [key]: { ...mesa, items: [...mesa.items, ...nuevos] },
            },
          };
        });

        get()._sync({ tipo: "nuevoPedido", mesaId: key });
      },

      addCustomProduct: (mesaId, name, price) => {
        const key = toKey(mesaId);
        const id = "custom-" + Date.now();
        const nuevo: PedidoItem = {
          id,
          name,
          price,
          qty: 1,
          entregado: false,
          estado: "pendiente",
          timestamp: Date.now(),
          personalizado: true,
        };

        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: {
              ...state.mesas,
              [key]: {
                ...mesa,
                items: [...mesa.items, nuevo],
                customProducts: [...mesa.customProducts, { id, name, price }],
              },
            },
          };
        });

        get()._sync({ tipo: "añadidoPorCamarero", mesaId: key });
      },

      confirmarItem: (mesaId, timestamp) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: {
              ...state.mesas,
              [key]: {
                ...mesa,
                items: updateEstadoItem(mesa.items, timestamp, "pendienteCocina"),
              },
            },
          };
        });
        get()._sync({ tipo: "pedidoConfirmado", mesaId: key });
      },

      actualizarEstadoItem: (mesaId, timestamp, estado) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: {
              ...state.mesas,
              [key]: { ...mesa, items: updateEstadoItem(mesa.items, timestamp, estado!) },
            },
          };
        });
        get()._sync({ tipo: "actualizadoPorCocina", mesaId: key });
      },

      marcarServido: (mesaId, timestamp) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, items: markServido(mesa.items, timestamp) } },
          };
        });
        get()._sync({ tipo: "pedidoActualizado", mesaId: key });
      },

      incrementarItem: (mesaId, itemId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const ref = mesa.items.find((i) => i.id === itemId);
          if (!ref) return { mesas: state.mesas };
          const nuevo: PedidoItem = {
            ...ref,
            entregado: false,
            estado: "pendiente",
            timestamp: Date.now(),
            qty: 1,
          };
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, items: [...mesa.items, nuevo] } },
          };
        });
        get()._sync({ tipo: "pedidoActualizado", mesaId: key });
      },

      reducirItem: (mesaId, itemId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const idx = mesa.items.findIndex((i) => i.id === itemId && !i.entregado);
          if (idx === -1) return { mesas: state.mesas };
          const newItems = [...mesa.items];
          newItems.splice(idx, 1);
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: newItems } } };
        });
        get()._sync({ tipo: "pedidoActualizado", mesaId: key });
      },

      cobrarMesa: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => ({
          mesas: { ...state.mesas, [key]: emptyMesa() },
        }));
        get()._sync({ tipo: "mesaCobrada", mesaId: key });
      },

      llamarCamarero: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return { mesas: { ...state.mesas, [key]: { ...mesa, llamada: true } } };
        });
        get()._sync({ tipo: "llamada", mesaId: key });
      },

      atenderLlamada: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return { mesas: { ...state.mesas, [key]: { ...mesa, llamada: false } } };
        });
        get()._sync({ tipo: "llamadaAtendida", mesaId: key });
      },

      pedirCuenta: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, cuentaSolicitada: true } },
          };
        });
        get()._sync({ tipo: "cuenta", mesaId: key });
      },

      atenderCuenta: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, cuentaSolicitada: false } },
          };
        });
        get()._sync({ tipo: "cuentaAtendida", mesaId: key });
      },

      _sync: (extra) => {
        pedidosChannel?.postMessage({ mesas: get().mesas, ...extra });
      },
    }),
    {
      name: "order-storage",
      version: 4,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
);
