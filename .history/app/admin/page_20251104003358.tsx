"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  // ✅ Si ya está logueado → pasar al panel directamente
  useEffect(() => {
    if (localStorage.getItem("admin-auth") === "true") {
      router.replace("/admin/panel");
    }
  }, [router]);

  const handleSubmit = () => {
    if (password === "1234") {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/panel");
    } else {
      alert("❌ Contraseña incorrecta");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <h1 className="text-3xl font-bold text-textDark mb-6">
        🔐 Acceso Camarero
      </h1>

      <div className="bg-surface p-6 rounded-xl border border-border shadow-md w-full max-w-sm">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introduce contraseña"
          className="w-full bg-surfaceAlt border border-border rounded-lg p-3 mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl active:scale-95"
        >
          ✅ Entrar
        </button>
      </div>
    </main>
  );
}
