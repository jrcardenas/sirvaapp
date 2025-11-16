import Link from "next/link";

interface MesaPageProps {
  params: {
    id: string;
  };
}

export default function MesaPage({ params }: MesaPageProps) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-[#F5F5F5] p-6">
      <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-4">
        Mesa {id}
      </h1>

      <p className="text-center text-[#555] mb-6">
        Selecciona lo que quieres pedir 🍻🍟
      </p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <Link
          href={`/mesa/${id}/menu`}
          className="bg-[#14532D] hover:bg-[#0f3e21] text-white py-3 rounded-lg font-semibold text-center transition"
        >
          Ver Carta 📋
        </Link>

        <button
          className="bg-[#404040] hover:bg-black text-white py-3 rounded-lg font-semibold text-center transition"
        >
          Llamar al camarero 🛎️
        </button>
      </div>
    </main>
  );
}
