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
  estado?: "pendiente" | "confirmado" | "enCocina" | "listo";
};

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
  confirmarPedido: (mesaId: string) => void;
  incrementarItem: (mesaId: string, itemId: string) => void;
  reducirItem: (mesaId: string, itemId: string) => void;
  marcarServido: (mesaId: string, timestamp: number) => void;
  actualizarEstadoItem: (
    mesaId: string,
    timestamp: number,
    estado: "pendiente" | "confirmado" | "enCocina" | "listo"
  ) => void;
  cobrarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  pedirCuenta: (mesaId: string) => void;
  atenderCuenta: (mesaId: string) => void;
  _sync: (extra?: SyncEvent) => void;
};

/* ---------- Canal de comunicación ---------- */
const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      /* 🧾 Cliente hace pedido */
      addToMesa: (mesaId, items) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
          customProducts: [],
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
        );

        mesa.items = [...mesa.items, ...nuevos];
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "nuevoPedido", mesaId });
      },

      /* ➕ Añadir producto personalizado */
      addCustomProduct: (mesaId, name, price) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId] ?? {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
          customProducts: [],
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

        mesa.items.push(nuevo);
        mesa.customProducts.push({ id, name, price });
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "añadidoPorCamarero", mesaId });
      },

      /* ✅ Confirmar pedido */
      confirmarPedido: (mesaId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;

        mesa.items = mesa.items.map((i) =>
          i.estado === "pendiente" ? { ...i, estado: "confirmado" } : i
        );

        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "pedidoConfirmado", mesaId });
      },

      /* ➕ Incrementar */
      incrementarItem: (mesaId, itemId) => {
        const state = structuredClone(get().mesas);
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

        mesa.items.push(nuevo);
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync();
      },

      /* ➖ Reducir */
      reducirItem: (mesaId, itemId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;

        const idx = mesa.items.findIndex(
          (i) => i.id === itemId && !i.entregado
        );
        if (idx !== -1) mesa.items.splice(idx, 1);

        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync();
      },

      /* ✅ Marcar como servido */
      marcarServido: (mesaId, timestamp) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;

        mesa.items = mesa.items.map((i) =>
          i.timestamp === timestamp
            ? { ...i, entregado: true, estado: "listo" }
            : i
        );

        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync();
      },

      /* 👨‍🍳 Cambiar estado desde cocina */
      actualizarEstadoItem: (mesaId, timestamp, estado) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;

        mesa.items = mesa.items.map((i) =>
          i.timestamp === timestamp ? { ...i, estado } : i
        );

        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "actualizadoPorCocina", mesaId });
      },

      /* 💳 Cobrar mesa */
      cobrarMesa: (mesaId) => {
        const state = structuredClone(get().mesas);
        state[mesaId] = {
          items: [],
          cuentaSolicitada: false,
          llamada: false,
          customProducts: [],
        };
        set({ mesas: state });
        get()._sync({ tipo: "mesaCobrada", mesaId });
      },

      /* 📞 Llamadas y cuentas */
      llamarCamarero: (mesaId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;
        mesa.llamada = true;
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "llamada", mesaId });
      },

      atenderLlamada: (mesaId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;
        mesa.llamada = false;
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "llamadaAtendida", mesaId });
      },

      pedirCuenta: (mesaId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;
        mesa.cuentaSolicitada = true;
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "cuenta", mesaId });
      },

      atenderCuenta: (mesaId) => {
        const state = structuredClone(get().mesas);
        const mesa = state[mesaId];
        if (!mesa) return;
        mesa.cuentaSolicitada = false;
        state[mesaId] = mesa;
        set({ mesas: state });
        get()._sync({ tipo: "cuentaAtendida", mesaId });
      },

      /* 🔁 Broadcast general */
      _sync: (extra) => {
        pedidosChannel?.postMessage({ mesas: get().mesas, ...extra });
      },
    }),
    { name: "order-storage" }
  )
);
