import { redirect } from "next/navigation";

export default function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {
  const mesaId = Number(params.id);

  console.log("💡 MesaLayout params:", params, "mesaId:", mesaId);

  // ✅ Nueva validación más robusta
  const invalidMesa =
    !params.id ||
    isNaN(mesaId) ||
    mesaId < 1 ||
    mesaId > 5; // <-- Cambiarás esto luego con BD real

  if (invalidMesa) {
    return redirect("/");
  }

  return <>{children}</>;
}
