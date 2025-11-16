"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { useEffect, useRef, useState } from "react";

type CallItem = {
  label: string;
  icon: string;
  visible: boolean;
  action: "call";
};

type LinkItem = {
  href: string;
  label: string;
  icon: string;
  visible: boolean;
};

type NavItem = CallItem | LinkItem;

function isLinkItem(item: NavItem): item is LinkItem {
  return "href" in item;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const rawParams = useParams() as Record<string, string | string[]>;
  const mesaId =
    typeof rawParams?.id === "string"
      ? rawParams.id
      : Array.isArray(rawParams?.id)
      ? rawParams.id[0]
      : undefined;

  const { mesas, llamarCamarero } = useOrderStore();
  const mesa = mesaId ? mesas[mesaId] : undefined;
  const llamada = mesa?.llamada ?? false;

  const [showPopup, setShowPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const dingRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Prepara sonido
  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current!.volume = 1;
  }, []);

  // ✅ Escucha respuesta desde el camarero
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");

    pedidos.onmessage = (ev) => {
      if (!mesaId) return;
      if (ev.data?.respondido === mesaId) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    };

    return () => pedidos.close();
  }, [mesaId]);

  const navItems: NavItem[] = [
    { href: "/", label: "Inicio", icon: "🏠", visible: true },
    {
      href: mesaId ? `/mesa/${mesaId}/menu` : "/",
      label: "Menú",
      icon: "🍽️",
      visible: !!mesaId,
    },
    {
      href: mesaId ? `/mesa/${mesaId}/cuenta` : "/",
      label: "Cuenta",
      icon: "🧾",
      visible: !!mesaId,
    },
    {
      label: llamada ? "Esperando" : "Llamar",
      icon: "🛎️",
      visible: !!mesaId,
      action: "c
