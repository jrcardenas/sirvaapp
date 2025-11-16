export default function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {

  // ✅ Mientras Next está resolviendo el id, simplemente mostramos children
  if (!params.id) {
    return <>{children}</>;
  }

  // ✅ Validación REAL solo cuando params.id ya existe
  const mesaId = Number(params.id);

  if (isNaN(mesaId) || mesaId < 1 || mesaId > 5) {
    return (
      <div className="p-8 text-center text-red-500">
        ❌ Mesa no válida
      </div>
    );
  }

  return <>{children}</>;
}
