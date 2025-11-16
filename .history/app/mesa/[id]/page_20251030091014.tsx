import Link from "next/link";

type MesaPageProps = {
  params: { id: string };
};

export default async function MesaPage({ params }: MesaPageProps) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)] mb-4">
        Mesa {id}
      </h1>

      <p className="text-center text-[var(--color-text-dark)] opacity-70 mb-6">
        Selecciona lo que quieres pedir 🍻🍟
      </p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <Link
          href={`/mesa/${id}/menu`}
          className="bg-[var(--color-primary)] text-[var(--color-text-light)] py-[var(--button-height)] rounded-[var(--radius)] font-semibold text-center transition hover:opacity-90"
        >
          Ver Carta 📋
        </Link>

        <button className="bg-[var(--color-secondary)] text-[var(--color-text-light)] py-[var(--button-height)] rounded-[var(--radius)] font-semibold text-center transition hover:opacity-90">
          Llamar al camarero 🛎️
        </button>
      </div>
    </main>
  );
}
