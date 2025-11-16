"use client";
import { useEffect, useState } from "react";

export default function CallWaiterToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    };

    document.addEventListener("call-waiter", handler);
    return () => document.removeEventListener("call-waiter", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 
                    bg-[var(--color-primary)] text-white px-4 py-2 
                    rounded-full shadow-xl animate-toast z-[9999]">
      🛎️ ¡Camarero avisado!
    </div>
  );
}
