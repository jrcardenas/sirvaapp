"use client";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const router = useRouter();
  const { items, changeQty, removeItem, clearCart, totalAmount } = useCartStore();

  if (items.length === 0) {
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

      {items.map((p, index) => (
        <div key={index} className="bg-[var(--color-surface)] p-4 rounded-[var(--radius)] shadow-sm">
          <div className="font-semibold text-lg mb-2">{p.name}</div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => changeQty(p.id, p.qty - 1)}>
                -
              </Button>

              <span className="font-semibold text-lg w-6 text-center">{p.qty}</span>

              <Button size="sm" onClick={() => changeQty(p.id, p.qty + 1)}>
                +
              </Button>
            </div>
            <span className="font-semibold text-lg">
              {(p.price * p.qty).toFixed(2)} €
            </span>
          </div>

          {p.note && (
            <p className="text-sm text-gray-600 mt-2">
              Nota: {p.note}
            </p>
          )}

          <button
            className="text-red-600 text-sm mt-2 underline"
            onClick={() => removeItem(p.id, p.note)}
          >
            Eliminar
          </button>
        </div>
      ))}

      <div className="font-bold text-xl text-right">
        Total: {totalAmount.toFixed(2)} €
      </div>

      <Button
        fullWidth
        onClick={() => {
          alert("Pedido enviado a cocina ✅");
          clearCart();
          router.push("/mesa/1"); // luego lo cambiamos por mesa real
        }}
      >
        Enviar pedido ✅
      </Button>

      <Button fullWidth variant="ghost" onClick={() => router.back()}>
        Seguir pidiendo
      </Button>
    </main>
  );
}
