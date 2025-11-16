"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  // Si ya está logueado → ir al panel
  useEffect(() => {
    if (localStorage.getItem("admin-auth") === "true") {
      router.replace("/admin/panel");
    }
  }, [router]);

  const handleLogin = () => {
    if (password === "1234") {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/panel");
    } else {
      alert("❌ Contraseña incorrecta");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🔐 Acceso Camarero</h1>

      <div className="w-full max-w-xs bg-surface p-6 rounded-xl shadow-md border border-border">
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full bg-surfaceAlt border border-border rounded-lg p-3 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white py-2 rounded-xl font-bold active:scale-95"
        >
          ✅ Entrar
        </button>
      </div>
    </main>
  );
}
