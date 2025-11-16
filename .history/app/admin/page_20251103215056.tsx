"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const validUser = "admin"; // ✅ cambia si quieres
    const validPass = "1234";  // ✅ cambia si quieres

    if (user === validUser && pass === validPass) {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/panel");
    } else {
      setError("❌ Usuario o contraseña incorrectos");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-zinc-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h1 className="text-xl font-bold mb-4 text-center">🔐 Panel Camarero</h1>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          className="w-full bg-blue-600 text-white py-2 rounded font-bold"
          onClick={handleLogin}
        >
          Entrar 🚪
        </button>
      </div>
    </main>
  );
}
