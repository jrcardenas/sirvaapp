/* ✅ orderStore.ts */
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
  estado?: "pendiente" | "enCocina" | "listo"; // 👨‍🍳 estado del pedido
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
  addToMesa: (mesaId: string, items: PedidoItem[]) => void;
  addCustomProduct: (mesaId: string, name: string, price: number) => void;
  incrementarItem: (mesaId: string, itemId: string) => void;
  reducirItem: (mesaId: string, itemId: string) => void;
  marcarServido: (mesaId: string, timestamp: number) => void;
  actualizarEstadoItem: (
    mesaId: string,
    timestamp: number,
    estado: "pendiente" | "enCocina" | "listo"
  ) => void;
  cobrarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  pedirCuenta: (mesaId: string) => void;
  atenderCuenta: (mesaId: string) => void;
  _sync: (extra?: SyncEvent) => void;
};

/* ---------- Canal de sincronización ---------- */
const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      /* 🧾 Añadir pedido desde cliente */
      addToMesa: (mesaId, items) => {
        const state = get().mesas;
        const mesa: MesaState = {
          items: [...(state[mesaId]?.items ?? [])],
          cuentaSolicitada: state[mesaId]?.cuentaSolicitada ?? false,
          llamada: state[mesaId]?.llamada ?? false,
          customProducts: state[mesaId]?.customProducts ?? [],
        };

        const now = Date.now();
        let counter = 0;

        const nuevos: PedidoItem[] = items.flatMap((i) =>
          Array.from({ length: i.qty }).map(() => ({
            ...i,
            qty: 1,
            entregado: false,
            estado: "pendiente",
            timestamp: now + counter++,
          }))
        ) as PedidoItem[];

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [...mesa.items, ...nuevos],
            },
          },
        });

        get()._sync({ tipo: "nuevoPedido", mesaId });
      },

      /* ➕ Añadir producto personalizado desde admin/camarero */
      addCustomProduct: (mesaId, name, price) => {
        const state = get().mesas;
        const mesa: MesaState = {
          items: [...(state[mesaId]?.items ?? [])],
          cuentaSolicitada: state[mesaId]?.cuentaSolicitada ?? false,
          llamada: state[mesaId]?.llamada ?? false,
          customProducts: state[mesaId]?.customProducts ?? [],
        };

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

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [...mesa.items, nuevo],
              customProducts: [...(mesa.customProducts ?? []), { id, name, price }],
            },
          },
        });

        get()._sync({ tipo: "añadidoPorCamarero", mesaId });
      },

      /* ➕ Incrementar cantidad de un producto */
      incrementarItem: (mesaId, itemId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;
        const ref = mesa.items.find((i) => i.id === itemId);
        if (!ref) return;

        const nuevo: PedidoItem = {
          ...ref,
          entregado: false,
          timestamp: Date.now(),
          estado: "pendiente",
        };

        set({
          mesas: {
            ...state,
            [mesaId]: {
              ...mesa,
              items: [...mesa.items, nuevo],
            },
          },
        });

        get()._sync();
      },

      /* ➖ Reducir cantidad */
      reducirItem: (mesaId, itemId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        const idx = mesa.items.findIndex(
          (i) => i.id === itemId && !i.entregado
        );
        if (idx === -1) return;

        const newItems = [...mesa.items];
        newItems.splice(idx, 1);

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, items: newItems },
          },
        });

        get()._sync();
      },

      /* ✅ Marcar como servido */
      marcarServido: (mesaId, timestamp) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        const newItems = mesa.items.map((i) =>
          i.timestamp === timestamp
            ? { ...i, entregado: true, estado: "listo" }
            : i
        );

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, items: newItems },
          },
        });

        get()._sync();
      },

      /* 👨‍🍳 Cambiar estado desde cocina */
      actualizarEstadoItem: (mesaId, timestamp, estado) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        const newItems = mesa.items.map((i) =>
          i.timestamp === timestamp ? { ...i, estado } : i
        );

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, items: newItems },
          },
        });

        get()._sync({ tipo: "actualizadoPorCocina", mesaId });
      },

      /* 💳 Cobrar mesa */
      cobrarMesa: (mesaId) => {
        const mesas = get().mesas;
        set({
          mesas: {
            ...mesas,
            [mesaId]: {
              items: [],
              cuentaSolicitada: false,
              llamada: false,
              customProducts: [],
            },
          },
        });

        get()._sync({ tipo: "mesaCobrada", mesaId });
      },

      /* 📞 Llamar al camarero */
      llamarCamarero: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, llamada: true },
          },
        });

        get()._sync({ tipo: "llamada", mesaId });
      },

      /* ✅ Atender llamada */
      atenderLlamada: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, llamada: false },
          },
        });

        get()._sync({ tipo: "llamadaAtendida", mesaId });
      },

      /* 💰 Pedir cuenta */
      pedirCuenta: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, cuentaSolicitada: true },
          },
        });

        get()._sync({ tipo: "cuenta", mesaId });
      },

      /* ✅ Atender cuenta */
      atenderCuenta: (mesaId) => {
        const state = get().mesas;
        const mesa = state[mesaId];
        if (!mesa) return;

        set({
          mesas: {
            ...state,
            [mesaId]: { ...mesa, cuentaSolicitada: false },
          },
        });

        get()._sync({ tipo: "cuentaAtendida", mesaId });
      },

      /* 🔄 Sincronización global */
      _sync: (extra) => {
        pedidosChannel?.postMessage({
          mesas: get().mesas,
          ...extra,
        });
      },
    }),
    { name: "order-storage" }
  )
);
