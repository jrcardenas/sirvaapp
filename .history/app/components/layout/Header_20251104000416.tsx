"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const mesaId = useParams()?.id as string | undefined;

  const { mesas, llamarCamarero, atenderLlamada } = useOrderStore();
  const mesa = mesaId ? mesas[mesaId] : undefined;
  const llamada = mesa?.llamada ?? false;

  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navItems = [
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

  const handleCallConfirm = () => {
    if (!mesaId) return;
    llamarCamarero(mesaId);
    setShowCallPopup(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleClick = (item: any) => {
    if (item.action === "call") {
      if (!llamada) setShowCallPopup(true);
    } else if (item.href) router.push(item.href);
  };

  return (
    <>
      <header className="w-full h-14 bg-surface border-b border-border shadow-sm fixed top-0 z-50">
        <nav className="flex justify-around items-center max-w-md mx-auto h-full text-[11px]">
          {navItems.filter(i => i.visible).map((item) => {
            const isActive = item.href && pathname?.startsWith(item.href);

            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`flex flex-col items-center gap-0.5 transition relative
                ${isActive || item.action === "call" && llamada
                  ? "text-primary font-bold"
                  : "text-textMuted"}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>

                {/* 🔔 Ping si esperando */}
                {item.action === "call" && llamada && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ✅ Popup Confirmar */}
      {showCallPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4 text-textDark">
              ¿Llamar al camarero?
            </h3>
            <p className="text-sm text-textMuted text-center mb-6">
              Avisaremos a un camarero para atenderte.
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 py-2 bg-disabledBg text-disabledText rounded-xl font-semibold"
                onClick={() => setShowCallPopup(false)}
              >
                ❌ Cancelar
              </button>

              <button
                className="w-1/2 py-2 bg-primary text-white rounded-xl font-semibold active:scale-95 transition"
                onClick={handleCallConfirm}
              >
                ✅ Llamar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-xl font-bold animate-toast">
          🛎️ Camarero avisado ✅
        </div>
      )}
    </>
  );
}
