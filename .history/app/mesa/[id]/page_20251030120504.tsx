import Button from "@/components/ui/Button";

type MesaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MesaPage({ params }: MesaPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-4">
        Mesa {id}
      </h1>

      <p className="text-center text-[var(--color-text-dark)] opacity-70 mb-6">
        Selecciona lo que quieres pedir 🍻🍟
      </p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <Button as="link" href={`/mesa/${id}/menu`} fullWidth>
          Ver Carta 📋
        </Button>

        <Button variant="secondary" fullWidth>
          Llamar al camarero 🛎️
        </Button>
      </div>
    </main>
  );
}
