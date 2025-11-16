import { useOrderStore } from "@/store/orderStore";

export default function CocinaPage() {
  const mesas = useOrderStore((state) => state.mesas);

  // ✅ solo mostrar pedidos confirmados o en cocina
  const pedidosCocina = Object.entries(mesas).flatMap(([mesaId, mesa]) =>
    mesa.items
      .filter((item) =>
        item.estado === "confirmado" || item.estado === "enCocina"
      )
      .map((item) => ({
        ...item,
        mesaId,
      }))
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">👨‍🍳 Cocina</h1>

      {pedidosCocina.length === 0 && (
        <p className="text-gray-500">No hay pedidos confirmados todavía.</p>
      )}

      <div className="grid gap-3">
        {pedidosCocina.map((pedido) => (
          <div
            key={pedido.timestamp}
            className="p-3 rounded-lg shadow bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{pedido.name}</p>
              <p className="text-sm text-gray-500">Mesa {pedido.mesaId}</p>
            </div>

            <div className="flex gap-2">
              {pedido.estado === "confirmado" && (
                <button
                  onClick={() =>
                    useOrderStore
                      .getState()
                      .actualizarEstadoItem(pedido.mesaId, pedido.timestamp, "enCocina")
                  }
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  En cocina
                </button>
              )}

              {pedido.estado === "enCocina" && (
                <button
                  onClick={() =>
                    useOrderStore
                      .getState()
                      .actualizarEstadoItem(pedido.mesaId, pedido.timestamp, "listo")
                  }
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Listo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
