"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type NavItem = {
  href?: string;
  label: string;
  icon: string;
  visible: boolean;
  action?: "call";
};

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const mesaId = params?.id as string | undefined;

  const [showCallPopup, setShowCallPopup] = useState(false);
  const [waitingCall, setWaitingCall] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const ch = new BroadcastChannel("waiter_channel");
    ch.onmessage = (ev) => {
      if (ev.data?.mesaId === mesaId && ev.data?.respondido) {
        setWaitingCall(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    };
    return () => ch.close();
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
      label: waitingCall ? "Esperando" : "Llamar",
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

  const callWaiter = () => {
    setWaitingCall(true);
    const ch = new BroadcastChannel("waiter_channel");
    ch.postMessage({ mesaId, llamar: true });
    ch.close();
  };

  const handleClick = (item: NavItem) => {
    if (item.action === "call") {
      if (!waitingCall) setShowCallPopup(true);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <>
      <header className="w-full h-14 bg-white border-b shadow-sm fixed top-0 z-50">
        <nav className="flex justify-around items-center max-w-md mx-auto text-sm h-full">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = item.href && pathname?.startsWith(item.href);

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition ${
                    item.action === "call"
                      ? "text-green-700 font-bold"
                      : isActive
                      ? "text-green-700 font-bold"
                      : "text-gray-600"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
        </nav>
      </header>

      {/* ✅ Popup Confirmar Llamada */}
      {showCallPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl animate-modal">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-900">
              ¿Llamar al camarero?
            </h3>

            <p className="text-sm text-gray-700 text-center mb-4">
              Avisaremos a un camarero para atenderte.
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold"
                onClick={() => setShowCallPopup(false)}
              >
                ❌ Cancelar
              </button>
              <button
                className="w-1/2 py-2 bg-green-600 text-white rounded-lg font-semibold active:scale-95 transition"
                onClick={() => {
                  setShowCallPopup(false);
                  callWaiter();
                }}
              >
                ✅ Llamar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast cuando camarero acepta */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-xl font-bold animate-toast">
          🛎️ Camarero en camino ✅
        </div>
      )}
    </>
  );
}
