"use client";
import Link from "next/link";

export default function MesasPage() {
  const mesas = Array.from({ length: 20 }, (_, i) => i + 1); // 20 mesas

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Mesas del Local</h1>

      <div className="grid grid-cols-2 gap-4">
        {mesas.map((id) => (
          <Link
            key={id}
            href={`/mesa/${id}/qr`}
            className="bg-white shadow rounded-lg py-4 text-center font-bold border border-gray-200 hover:bg-gray-100"
          >
            Mesa {id}
          </Link>
        ))}
      </div>
    </main>
  );
}
