import { redirect } from "next/navigation";

export default function MesaRedirect({ params }: { params: { id: string } }) {
  redirect(`/mesa/${params.id}/menu`);
}
