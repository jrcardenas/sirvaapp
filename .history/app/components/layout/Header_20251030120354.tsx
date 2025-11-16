"use client";

import Link from "next/link";
import { useOrder } from "@/context/OrderContext";

export default function Header() {
  const { pedido } = useOrder();
  const totalItems = pedido.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <header className="flex justify-between items-center mb-6">
      <div /> {/* placeholder para el espacio izquierdo */}

      <h1 className="text-lg font-bold">SirvaApp</h1>

      <Link href="/carrito" className="relative">
        <span className="text-2xl">🛒</span>

        {totalItems > 0 && (
          <span className="absolute -top-1 -right-2 bg-[var(--color-primary)] text-white rounded-full text-xs px-1">
            {totalItems}
          </span>
        )}
      </Link>
    </header>
  );
}
