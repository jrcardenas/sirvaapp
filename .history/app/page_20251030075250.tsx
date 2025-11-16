export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">SirvaApp</h1>
        <p className="text-gray-600 mb-6">
          Pide desde tu mesa. Fácil y rápido 🍻
        </p>
        <a
          href="/mesa/1"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Escanear QR / Entrar
        </a>
      </div>
    </main>
  );
}
