/* ✅ orderStore.ts */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PedidoItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  entregado: boolean;
  timestamp: number;
  personalizado?: boolean;
  estado?: "pendiente" | "enCocina" | "listo"; // 👈 añadido para cocina
};

type MesaState = {
  items: PedidoItem[];
  cuentaSolicitada: boolean;
  llamada: boolean;
  customProducts?: { id: string; name: string; price: number }[];
};

type MesaOrders = {
  [mesaId: string]: MesaState;
};

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
  ) => void; // 👈 NUEVO
  cobrarMesa: (mesaId: string) => void;
  llamarCamarero: (mesaId: string) => void;
  atenderLlamada: (mesaId: string) => void;
  pedirCuenta: (mesaId: string) => void;
  atenderCuenta: (mesaId: string) => void;
  _sync: (extra?: SyncEvent) => void;
};

const pedidosChannel =
  typeof window !== "undefined" ? new BroadcastChannel("pedidos_channel") : null;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

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

        const nuevos = items.flatMap((i) =>
          Array.from({ length: i.qty }).map(() => ({
            ...i,
            qty: 1,
            entregado: false,
            estado: "pendiente", // 👈 nuevos pedidos llegan así
            timestamp: now + counter++,
          }))
        );

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

      addCustomProduct: (mesaId, name, price) => {
        const state = get().mesas;
        const mesa: MesaState = {
          items: [...(state[mesaId]?.items ?? [])],
          cue
