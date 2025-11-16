export default function MenuPage() {
  const productos = [
    { id: 1, nombre: "Cerveza", precio: 2.00 },
    { id: 2, nombre: "Coca-Cola", precio: 2.20 },
    { id: 3, nombre: "Tortilla", precio: 3.50 },
    { id: 4, nombre: "Patatas Bravas", precio: 4.00 },
  ];

  return (
    <main className="min-h-screen bg-[#F5F5F5] p-6">
      <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-6">
        Menú
      </h1>

      <div className="grid gap-4 max-w-md mx-auto">
        {productos.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl px-4 py-3 flex justify-between items-center border border-gray-200"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[#2C2C2C]">
                {item.nombre}
              </span>
              <span className="text-[#555] text-sm">
                {item.precio.toFixed(2)} €
              </span>
            </div>
            <button className="bg-[#14532D] hover:bg-[#0f3e21] text-white py-2 px-4 rounded-lg font-semibold transition text-sm">
              Añadir
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
