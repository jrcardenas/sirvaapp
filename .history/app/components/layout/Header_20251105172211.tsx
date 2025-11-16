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
      action: "call",
    },
    {
      href: mesaId ? `/mesa/${mesaId}/info` : "/",
      label: "Info",
      icon: "ℹ️",
      visible: !!mesaId,
    },
  ];

  // ✅ Enviar llamada al camarero + sonido
  const handleConfirmCall = () => {
    if (!mesaId) return;

    llamarCamarero(mesaId);
    dingRef.current?.play().catch(() => null);

    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.postMessage({
      mesas: useOrderStore.getState().mesas,
      llamada: true,
      mesaId,
    });
    pedidos.close();

    setShowPopup(false);
  };

  const handleClick = (item: NavItem) => {
    if (!item.visible) return;
    if (!isLinkItem(item)) {
      if (!llamada) setShowPopup(true);
      return;
    }
    router.push(item.href);
  };

  return (
    <>
      {/* NAV */}
      <header className="w-full h-14 bg-white border-b shadow-sm fixed top-0 z-50">
        <nav className="flex justify-around items-center max-w-md mx-auto h-full text-[11px]">
          {navItems.filter((i) => i.visible).map((item) => {
            const isActive =
              isLinkItem(item) && pathname?.startsWith(item.href);
            const isCallActive = !isLinkItem(item) && llamada;

            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`flex flex-col items-center relative ${
                  isActive || isCallActive ? "text-blue-600 font-bold" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>

                {!isLinkItem(item) && llamada && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* MODAL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">
              ¿Llamar al camarero?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Avisaremos al camarero para atenderte.
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 bg-gray-300 py-2 rounded-xl font-semibold"
                onClick={() => setShowPopup(false)}
              >
                ❌ Cancelar
              </button>

              <button
                className="w-1/2 bg-blue-600 text-white rounded-xl font-bold py-2"
                onClick={handleConfirmCall}
              >
                ✅ Llamar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-xl font-bold">
          👋 Camarero ha respondido ✅
        </div>
      )}
    </>
  );
}
