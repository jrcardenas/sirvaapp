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
  params: { productoId: string };
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
    router.push("/menu"); // ✅ volver al menú global
  };

  return (
    <main className="flex flex-col gap-4 p-6 pb-20">
      <h1 className="text-2xl font-bold text-center">{producto.nombre}</h1>

      <Button fullWidth onClick={handleAddToCart}>
        Añadir ({(producto.precio * cantidad).toFixed(2)} €)
      </Button>

      <Button fullWidth variant="ghost" onClick={() => router.push("/menu")}>
        Volver
      </Button>
    </main>
  );
}
