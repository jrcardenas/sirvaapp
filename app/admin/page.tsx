"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuth = localStorage.getItem("admin-auth") === "true";
    if (isAuth) {
      router.replace("/admin/panel");
      return;
    }

    setTimeout(() => setCheckingAuth(false), 0);
  }, [router]);

  const handleLogin = () => {
    if (password.trim() === "1234") {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin/panel");
    } else {
      alert("❌ Contraseña incorrecta");
    }
  };

  if (checkingAuth) return null;

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
