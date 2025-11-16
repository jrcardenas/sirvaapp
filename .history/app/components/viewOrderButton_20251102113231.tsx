"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function ViewOrderButton() {
  const total = useCartStore((s) => s.totalItems);

  if (total === 0) return null; // ✅ no mostrar si no hay productos

  return (
    <Link
      href="/carrito"
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2
        bg-black text-white px-6 py-3 rounded-full
        font-semibold shadow-lg
        transition-transform hover:scale-105
      "
    >
      Ver pedido ({total})
    </Link>
  );
}
