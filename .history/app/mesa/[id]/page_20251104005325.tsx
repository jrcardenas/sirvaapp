// app/mesa/[id]/page.tsx
import { redirect } from "next/navigation";

export default function MesaPage({ params }: { params: { id: string } }) {
  return redirect(`/mesa/${params.id}/menu`);
}
