import Button from "@/components/ui/Button";

export default function MenuPage() {
  const productos = [
    { id: 1, nombre: "Cerveza", precio: 2.0 },
    { id: 2, nombre: "Coca-Cola", precio: 2.2 },
    { id: 3, nombre: "Tortilla", precio: 3.5 },
    { id: 4, nombre: "Patatas Bravas", precio: 4.0 },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-6">
        Menú
      </h1>

      <div className="grid gap-4 max-w-md mx-auto">
        {productos.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--color-surface)] shadow-md rounded-[var(--radius)] px-4 py-3 flex justify-between items-center border border-gray-200"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[var(--color-text-dark)]">
                {item.nombre}
              </span>
              <span className="text-[var(--color-text-dark)] opacity-70 text-sm">
                {item.precio.toFixed(2)} €
              </span>
            </div>

            <Button size="sm">Añadir</Button>
          </div>
        ))}
      </div>
    </main>
  );
}
