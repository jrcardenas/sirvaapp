import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------- Tipos ---------- */
export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;                 // qty de la línea origen (para duplicar)
  entregado: boolean;
  timestamp: number;           // id único por instancia
  personalizado?: boolean;
  estado?: "pendiente" | "confirmado" | "enCocina" | "listo";
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts: { id: string; name: string; price: number }[]; // NO opcional
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

/* ---------- Canal de sincronización ---------- */
const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      /* 🧾 Cliente hace pedido → pendiente (pasa por barra primero) */
      addToMesa: (mesaId, items) => {
        const key = toKey(mesaId);
        const now = Date.now();
        let counter = 0;

        // ✅ qty seguro y >= 1
        const nuevos: PedidoItem[] = items.flatMap((i) => {
          const copies = Math.max(1, i.qty ?? 1);
          return Array.from({ length: copies }).map(
            (): PedidoItem => ({
              ...i,
              qty: 1, // cada instancia es una unidad
              entregado: false,
              estado: "pendiente",
              timestamp: now + counter++,
            })
          );
        });

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

      /* ➕ Producto personalizado */
      addCustomProduct: (mesaId, name, price) => {
        const key = toKey(mesaId);
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
                customProducts: [...mesa.customProducts, { id, name, price }],
              },
            },
          };
        });

        get()._sync({ tipo: "añadidoPorCamarero", mesaId: key });
      },

      /* ✅ Confirmar item → pasa de barra a cocina */
      confirmarItem: (mesaId, timestamp) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, estado: "confirmado" } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync({ tipo: "pedidoConfirmado", mesaId: key });
      },

      /* ➕ Incrementar item (duplica una unidad idéntica pendiente) */
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
        get()._sync();
      },

      /* ➖ Reducir item (elimina la primera unidad no entregada) */
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
        get()._sync();
      },

      /* ✅ Servir item (ya listo en cocina) */
      marcarServido: (mesaId, timestamp) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, entregado: true, estado: "listo" } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync();
      },

      /* 👨‍🍳 Actualizar estado desde cocina */
      actualizarEstadoItem: (mesaId, timestamp, estado) => {
        const key = toKey(mesaId);
        set((state) => {
          const mesa = ensureMesa(state.mesas, key);
          const nuevos = mesa.items.map((i) =>
            i.timestamp === timestamp ? { ...i, estado } : i
          );
          return { mesas: { ...state.mesas, [key]: { ...mesa, items: nuevos } } };
        });
        get()._sync({ tipo: "actualizadoPorCocina", mesaId: key });
      },

      /* 💳 Cobrar mesa */
      cobrarMesa: (mesaId) => {
        const key = toKey(mesaId);
        set((state) => ({
          mesas: { ...state.mesas, [key]: emptyMesa() },
        }));
        get()._sync({ tipo: "mesaCobrada", mesaId: key });
      },

      /* 📞 Llamadas */
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

      /* 💰 Cuenta */
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

      /* 🔄 Sincronización entre pestañas */
      _sync: (extra) => {
        pedidosChannel?.postMessage({ mesas: get().mesas, ...extra });
      },
    }),
    {
      name: "order-storage",
      version: 2,
      // 🧹 migra estados antiguos donde customProducts podía ser undefined
      migrate: (persisted: any, from) => {
        if (!persisted) return { mesas: {} };
        if (from < 2) {
          const mesas: MesaOrders = {};
          for (const [k, v] of Object.entries<any>(persisted.mesas ?? {})) {
            mesas[k] = {
              items: Array.isArray(v.items) ? v.items : [],
              cuentaSolicitada: !!v.cuentaSolicitada,
              llamada: !!v.llamada,
              customProducts: Array.isArray(v.customProducts) ? v.customProducts : [],
            };
          }
          return { mesas };
        }
        return persisted;
      },
    }
  )
);
