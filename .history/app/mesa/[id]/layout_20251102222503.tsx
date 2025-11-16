import { redirect } from "next/navigation";

export default function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {
  const mesaId = Number(params.id);

  // ✅ Validar mesa según cantidad real del local
  if (!mesaId || mesaId < 1 || mesaId > 5) {
    redirect("/");
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
}
