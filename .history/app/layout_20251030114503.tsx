"use client";

import Link from "next/link";
import { useOrder } from "@/app/context/OrderContext";

export default function Header() {
  const { pedido } = useOrder();
  const total = pedido.reduce((acc, p) => acc + p.cantidad, 0);

  return (
    <header className="flex justify-between items-center mb-6">
      {/* Título de la app */}
      <h1 className="text-lg font-bold">SirvaApp</h1>

      {/* Carrito con badge */}
      <Link href="/carrito" className="relative">
        <span className="text-2xl">🛒</span>

        {total > 0 && (
          <span className="absolute -top-1 -right-2 bg-[var(--color-primary)] text-white rounded-full text-xs px-1 font-bold">
            {total}
          </span>
        )}
      </Link>
    </header>
  );
}
