"use client";
import { useOrder } from "../context/OrderContext";
import PageTitle from "../components/ui/PageTitle";
import Button from "../components/ui/Button";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const { pedido } = useOrder();
  const router = useRouter();

  const total = pedido.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  if (pedido.length === 0) {
    return (
      <main className="text-center mt-10">
        <PageTitle>Carrito vacío</PageTitle>
        <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <PageTitle>Carrito 🛒</PageTitle>

      {pedido.map((p) => (
        <div key={p.id}
          className="bg-[var(--color-surface)] p-4 rounded-[var(--radius)] flex justify-between shadow-sm">
          <span>{p.nombre} x {p.cantidad}</span>
          <span>{(p.precio * p.cantidad).toFixed(2)} €</span>
        </div>
      ))}

      <h2 className="font-bold text-xl self-end">Total: {total.toFixed(2)} €</h2>

      <Button fullWidth>Enviar pedido ✅</Button>
      <Button variant="ghost" fullWidth onClick={() => router.back()}>
        Seguir pidiendo
      </Button>
    </main>
  );
}
