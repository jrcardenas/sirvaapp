"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Si ya está logueado → ir al panel
  useEffect(() => {
    if (localStorage.getItem("admin-auth") === "true") {
      router.replace("/admin/panel");
    }
  }, [router]);

  const handleLogin = () => {
    if (password === "1234") {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/panel");
      return;
    }

    setError("❌ Contraseña incorrecta");
    setTimeout(() => setError(""), 2500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
        🔐 Acceso Camarero
      </h1>

      <div className="w-full max-w-xs bg-surface p-6 rounded-xl shadow-lg border border-border">
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full bg-surfaceAlt border border-border rounded-lg p-3 mb-4 text-center focus:ring-2 focus:ring-primary outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ Mensaje de error con animación */}
        {error && (
          <p className="text-danger font-semibold text-center mb-3 animate-pulse">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold active:scale-95 transition"
        >
          ✅ Entrar
        </button>
      </div>
    </main>
  );
}
