"use client";

import { useEffect, use } from "react";
import Button from "@/components/ui/Button";

export default function MesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrapped correctamente

  useEffect(() => {
    localStorage.setItem("mesaId", id);
  }, [id]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-4">
        Mesa {id}
      </h1>

      <p className="text-center opacity-70 mb-6">Selecciona lo que quieres pedir 🍻🍟</p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <Button as="link" href="/menu" fullWidth>
          Ver Carta 📋
        </Button>

        <Button variant="secondary" fullWidth>
          Llamar al camarero 🛎️
        </Button>
      </div>
    </main>
  );
}
