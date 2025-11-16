"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");

  // ✅ Si ya está logueado, enviarlo directamente al panel
  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth === "true") {
      router.replace("/admin/panel");
    }
  }, [router]);

  const handleLogin = () => {
    if (pin === "1234") { // ✅ PIN temporal
      localStorage.setItem("admin-auth", "true");
      router.replace("/admin/panel");
    } else {
      alert("❌ PIN incorrecto");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-6 rounded-lg shadow-xl w-72 text-center">
        <h1 className="text-2xl font-bold mb-4">🔐 Acceso Camarero</h1>

        <input
          type="password"
          className="w-full p-2 rounded bg-zinc-700 outline-none text-center text-lg tracking-widest"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
        />

        <button
          onClick={handleLogin}
          className="mt-4 w-full bg-green-600 py-2 rounded font-bold hover:bg-green-500"
        >
          Entrar ✅
        </button>
      </div>
    </main>
  );
}
