import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------- Tipos ---------- */
export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number;
  personalizado?: boolean;
  estado?: "pendiente" | "confirmado" | "enCocina" | "listo";
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts?: { id: string; name: string; price: number }[];
};

type MesaOrders = Record<string, MesaState>;

type SyncEvent = {
  tipo?:
    | "nuevoPedido"
    | "pedidoConfirmado"
    | "llamada"
    | "llamadaAtendida"
    | "cuenta"
    | "cuentaAtendida"
    | "mesaCobrada"
    | "añadidoPorCamarero"
    | "actualizadoPorCocina";
  mesaId?: string;
};

type OrderStore = {
  mesas: MesaOrders;
  addToMesa: (mesaId: string | number, items: PedidoItem[]) => void;
  addCustomProduct: (mesaId: string | number, name: string, price: number) => void;
  confirmarItem: (mesaId: string | number, timestamp: number) => void;
  incrementarItem: (mesaId: string | number, itemId: string) => void;
  reducirItem: (mesaId: string | number, itemId: string) => void;
  marcarServido: (mesaId: string | number, timestamp: number) => void;
  actualizarEstadoItem: (
    mesaId: string | number,
    timestamp: number,
    estado: "pendiente" | "confirmado" | "enCocina" | "listo"
  ) => void;
  cobrarMesa: (mesaId: string | number) => void;
  llamarCamarero: (mesaId: string | number) => void;
  atenderLlamada: (mesaId: string | number) => void;
  pedirCuenta: (mesaId: string | number) => void;
  atenderCuenta: (mesaId: string | number) => void;
  _sync: (extra?: SyncEvent) => void;
};

/* ---------- Helpers robustos ---------- */
const toMesaKey = (mesaId: string | number) => String(mesaId);

const emptyMesa = (): MesaState => ({
  items: [],
  cuentaSolicitada: false,
  llamada: false,
  customProducts: [],
});

// Garantiza que la mesa exista y devuelve una copia mutable
const ensureMesa = (mesas: MesaOrders, mesaKey: string): MesaState => {
  return mesas[mesaKey] ?? emptyMesa();
};

/* ---------- Canal de sincronización ---------- */
const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      addToMesa: (mesaId, items) => {
        const key = toMesaKey(mesaId);
        const now = Date.now();
        let counter = 0;

        const nuevos: PedidoItem[] = items.flatMap((i) =>
          Array.from({ length: i.qty ?? 1 }).map(
            (): PedidoItem => ({
              ...i,
              qty: 1,
              entregado: false,
              estado: "pendiente",
              timestamp: now + counter++,
            })
          )
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
        const key = toMesaKey(mesaId);
        const id = "custom-" + Date.now();
        const nuevo: PedidoItem = {
          id,
          name,
          price,
          qty: 1,
          entregado: false,
          timestamp: Date.now(),
          personalizado: true,
          estado: "pendiente",
        };

        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: {
              ...state.mesas,
              [key]: {
                ...mesa,
                items: [...mesa.items, nuevo],
                customProducts: [...(mesa.customProducts ?? []), { id, name, price }],
              },
            },
          };
        });

        get()._sync({ tipo: "añadidoPorCamarero", mesaId: key });
      },

      confirmarItem: (mesaId, timestamp) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, estado: "confirmado" } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync({ tipo: "pedidoConfirmado", mesaId: key });
      },

      incrementarItem: (mesaId, itemId) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const ref = mesa.items.find((i) => i.id === itemId);
          if (!ref) return { mesas: state.mesas }; // nada que clonar
          const nuevo: PedidoItem = {
            ...ref,
            entregado: false,
            timestamp: Date.now(),
            estado: "pendiente",
          };
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, items: [...mesa.items, nuevo] } },
          };
        });
        get()._sync();
      },

      reducirItem: (mesaId, itemId) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const idx = mesa.items.findIndex((i) => i.id === itemId && !i.entregado);
          if (idx === -1) return { mesas: state.mesas };
          const newItems = [...mesa.items];
          newItems.splice(idx, 1);
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: newItems } } };
        });
        get()._sync();
      },

      marcarServido: (mesaId, timestamp) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, entregado: true, estado: "listo" } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync();
      },

      actualizarEstadoItem: (mesaId, timestamp, estado) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, estado } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync({ tipo: "actualizadoPorCocina", mesaId: key });
      },

      cobrarMesa: (mesaId) => {
        const key = toMesaKey(mesaId);
        set((state) => ({
          mesas: {
            ...state.mesas,
            [key]: emptyMesa(),
          },
        }));
        get()._sync({ tipo: "mesaCobrada", mesaId: key });
      },

      llamarCamarero: (mesaId) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return { mesas: { ...state.mesas, [key]: { ...mesa, llamada: true } } };
        });
        get()._sync({ tipo: "llamada", mesaId: key });
      },

      atenderLlamada: (mesaId) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return { mesas: { ...state.mesas, [key]: { ...mesa, llamada: false } } };
        });
        get()._sync({ tipo: "llamadaAtendida", mesaId: key });
      },

      pedirCuenta: (mesaId) => {
        const key = toMesaKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          return {
            mesas: { ...state.mesas, [key]: { ...mesa, cuentaSolicitada: true } },
          };
        });
        get()._sync({ tipo: "cuenta", mesaId: key });
      },

      atenderCuenta: (mesaId) => {
        const key = toMesaKey(mesaId);
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
    { name: "order-storage" }
  )
);
