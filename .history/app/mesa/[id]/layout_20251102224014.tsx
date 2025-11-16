import { redirect } from "next/navigation";

export default function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {
  const mesaId = Number(params.id);

  console.log("MesaLayout params:", params, "mesaId:", mesaId);

  // 🧠 Si no hay params.id aún, mostramos loading
  if (!params.id) {
    return (
      <div style={{ padding: 40 }}>
        Cargando mesa...
      </div>
    );
  }

  // ✅ Validación REAL una vez existe params.id
  if (isNaN(mesaId) || mesaId < 1 || mesaId > 5) {
    redirect("/");
  }

  return <>{children}</>;
}
