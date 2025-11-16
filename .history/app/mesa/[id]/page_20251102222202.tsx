// app/mesa/[id]/page.tsx
import { redirect } from "next/navigation";

export default function MesaPage({ params }: { params: { id: string } }) {
  // Aquí podrás validar mesa o estado futuro
  redirect(`/mesa/${params.id}/menu`);
}
