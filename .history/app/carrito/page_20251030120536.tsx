"use client";

import { useOrder } from "@/app/context/OrderContext";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const { pedido, cambiarCantidad, eliminarProducto, vaciarPedido } = useOrder();
  const router = useRouter();

  const total = pedido.reduce((s, p) => s + p.precio * p.cantidad, 0);

  if (pedido.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center h-full gap-4 mt-10">
        <h1 className="text-2xl font-bold text-center">Carrito vacío</h1>
        <Button fullWidth variant="ghost" onClick={() => router.back()}>
          Volver
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Carrito 🛒</h1>

      {pedido.map((p) => (
        <div
          key={p.id}
          className="bg-[var(--color-surface)] p-4 rounded-[var(--radius)] shadow-sm"
        >
          <div className="font-semibold text-lg mb-2">{p.nombre}</div>

          {/* Botones cantidad estilo mobile ✅ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => cambiarCantidad(p.id, "restar")}>
                -
              </Button>

              <span className="font-semibold text-lg w-6 text-center">{p.cantidad}</span>

              <Button size="sm" onClick={() => cambiarCantidad(p.id, "sumar")}>
                +
              </Button>
            </div>
            <span className="font-semibold text-lg">
              {(p.precio * p.cantidad).toFixed(2)} €
            </span>
          </div>

          {/* Nota si existe ✅ */}
          {p.nota && (
            <p className="text-sm text-gray-600 mt-2">
              Nota: {p.nota}
            </p>
          )}

          <button
            className="text-red-600 text-sm mt-2 underline"
            onClick={() => eliminarProducto(p.id)}
          >
            Eliminar
          </button>
        </div>
      ))}

      {/* Total ✅ */}
      <div className="font-bold text-xl text-right">
        Total: {total.toFixed(2)} €
      </div>

      {/* Botones de acción ✅ */}
      <Button fullWidth onClick={() => {
        alert("Pedido enviado a cocina ✅");
        vaciarPedido();
        router.push("/mesa/1"); // ⚠ Cambiar luego con mesa real
      }}>
        Enviar pedido ✅
      </Button>

      <Button fullWidth variant="ghost" onClick={() => router.back()}>
        Seguir pidiendo
      </Button>
    </main>
  );
}
