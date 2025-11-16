"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";

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
  const { productoId } = params;
  const producto = productosMock.find((p) => p.id === productoId);

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");

  if (!producto) return <p>Producto no encontrado</p>;

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      name: producto.nombre,
      price: producto.precio,
      qty: cantidad,
      note: nota,
    });
    router.back();
  };

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">{producto.nombre}</h1>

      <div className="w-full h-40 bg-[var(--color-surface)] rounded-[var(--radius)] shadow-md" />

      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Precio:</span>
        <span>{producto.precio.toFixed(2)} €</span>
      </div>

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

      <textarea
        className="w-full p-3 border border-[var(--color-border)] rounded-[var(--radius)] text-sm"
        placeholder="Añadir nota (ej: sin hielo, sin sal...)"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      <Button fullWidth onClick={handleAddToCart}>
        Añadir ({(producto.precio * cantidad).toFixed(2)} €)
      </Button>

      <Button fullWidth variant="ghost" onClick={() => router.back()}>
        Volver
      </Button>
    </main>
  );
}
