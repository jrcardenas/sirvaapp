"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");

  // ✅ Si ya está logueado → directamente al panel
  useEffect(() => {
    if (localStorage.getItem("admin-auth") === "true") {
      router.replace("/admin/panel");
    }
  }, [router]);

  const handleLogin = () => {
    if (pin === "1234") {
      localStorage.setItem("admin-auth", "true");
      router.replace("/admin/panel");
    } else {
      alert("❌ PIN incorrecto");
      setPin("");
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-[var(--color-background)] text-[var(--color-text-dark)] px-6">
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-2xl w-80 text-center border border-[var(--color-border)] animate-fade-in">
        
        <h1 className="text-2xl font-bold mb-5 text-[var(--color-text-dark)]">
          👨‍🍳 Acceso Camarero
        </h1>

        {/* PIN Input */}
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Introduce PIN"
          className="w-full p-3 rounded-xl border text-center text-2xl font-bold tracking-[0.3em]
          border-[var(--color-border)]
          bg-white focus:outline-none focus:border-[var(--color-primary)] transition"
        />

        {/* ✅ Botón entrar */}
        <button
          onClick={handleLogin}
          className="mt-5 w-full py-3 rounded-xl font-bold text-white bg-[var(--color-primary)]
          shadow-md active:scale-95 transition"
        >
          Entrar ✅
        </button>

        {/* ✅ Volver al menú del cliente */}
        <button
          onClick={() => router.push("/mesa/1/menu")}
          className="mt-4 w-full py-2 rounded-xl text-sm text-[var(--color-text-muted)] underline"
        >
          Volver al menú 🍽️
        </button>

      </div>
    </main>
  );
}
