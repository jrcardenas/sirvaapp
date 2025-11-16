/* ---------- Store ---------- */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      mesas: {},

      // ✅ --- todas tus funciones iguales ---
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

      // ... (el resto de funciones igual que antes)

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

      // ✅ 🧩 Migración segura: borra o adapta datos viejos
      migrate: (persistedState: any, version: number) => {
        try {
          if (!persistedState || typeof persistedState !== "object") {
            return { mesas: {} };
          }

          // Si venimos de versiones previas, forzamos el formato correcto
          if (version < 4) {
            const mesas = (persistedState.mesas ?? {}) as Record<string, any>;
            for (const key of Object.keys(mesas)) {
              const mesa = mesas[key];
              if (!Array.isArray(mesa.items)) mesa.items = [];
              mesa.customProducts ??= [];
              mesa.llamada ??= false;
              mesa.cuentaSolicitada ??= false;
            }
            return { mesas };
          }

          return persistedState as OrderStore;
        } catch {
          // si algo falla, devolvemos un estado limpio
          return { mesas: {} };
        }
      },
    }
  )
);
