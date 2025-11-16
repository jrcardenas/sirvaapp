"use client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-10 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">🔐 Acceso Camareros</h1>

      <button
        onClick={() => {
          localStorage.setItem("admin-auth", "true");
          router.push("/admin/panel");
        }}
        className="bg-primary text-white px-4 py-2 rounded-xl font-bold"
      >
        Entrar
      </button>
    </main>
  );
}
