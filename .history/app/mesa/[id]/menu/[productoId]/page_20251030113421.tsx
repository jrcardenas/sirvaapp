"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import { useOrder } from "@/app/context/OrderContext";

const productosMock = [
  { id: "1", nombre: "Cerveza", precio: 2.0 },
  { id: "2", nombre: "Coca-Cola", precio: 2.2 },
  { id: "3", nombre: "Tortilla", precio: 3.5 },
  { id: "4", nombre: "Patatas Bravas", precio: 4.0 },
];

export default function ProductoPage({
  params,
}: {
  params: { id: string; productoId: string };
}) {
  const { id, productoId } = params;
  const producto = productosMock.find((p) => p.id === productoId);

  const router = useRouter();
const { agregarProducto } = useOrder();
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");

  if (!producto) {
    return <p>Producto no encontrado</p>;
  }

  const handleAddToCart = () => {
    addItem({
      id: productoId,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      nota,
    });
    router.back(); // vuelve al menú ✅
  };

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">{producto.nombre}</h1>

      {/* Imagen temporal */}
      <div className="w-full h-40 bg-[var(--color-surface)] rounded-[var(--radius)] shadow-md" />

      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Precio:</span>
        <span>{producto.precio.toFixed(2)} €</span>
      </div>

      {/* Cantidad ✅ */}
      <div className="flex items-center justify-between bg-[var(--color-surface)] p-3 rounded-[var(--radius)]">
        <span className="font-semibold">Cantidad</span>
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
          >
            -
          </Button>
          <span className="w-6 text-center">{cantidad}</span>
          <Button size="sm" onClick={() => setCantidad((c) => c + 1)}>
            +
          </Button>
        </div>
      </div>

      {/* Nota ✅ */}
      <textarea
        className="w-full p-3 border border-[var(--color-border)] rounded-[var(--radius)] text-sm"
        placeholder="Añadir nota (ej: sin hielo, sin sal...)"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      {/* Botón ✅ */}
      <Button fullWidth onClick={handleAddToCart}>
        Añadir ({(producto.precio * cantidad).toFixed(2)} €)
      </Button>

      <Button
        fullWidth
        variant="ghost"
        onClick={() => router.back()}
      >
        Volver
      </Button>
    </main>
  );
}
