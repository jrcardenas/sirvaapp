interface MesaPageProps {
  params: {
    id: string;
  };
}

export default function MesaPage({ params }: MesaPageProps) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        Mesa {id}
      </h1>

      <p className="text-center text-gray-600 mb-6">
        Selecciona lo que quieres pedir 🍻🍟
      </p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
          Ver Bebidas 🥤
        </button>

        <button className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">
          Ver Tapas 🍤
        </button>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold">
          Ver Raciones 🍽️
        </button>
      </div>
    </main>
  );
}
