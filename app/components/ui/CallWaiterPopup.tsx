"use client";
import { useEffect, useState } from "react";

export default function CallWaiterPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleConfirm = () => {
    setShowPopup(false);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    const handler = () => setShowPopup(true);

    document.addEventListener("call-waiter", handler);
    return () => document.removeEventListener("call-waiter", handler);
  }, []);

  return (
    <>
      {/* ✅ Popup Confirmación */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl animate-modal">

            <h3 className="text-lg font-bold text-center mb-3 text-[var(--color-text-dark)]">
              ¿Llamar al camarero?
            </h3>

            <p className="text-center text-[var(--color-text-dark)] mb-4">
              Le avisaremos enseguida 🚶‍♂️
            </p>

            <div className="flex gap-2">
              <button
                className="w-1/2 py-2 rounded-lg bg-gray-300 font-semibold"
                onClick={() => setShowPopup(false)}
              >
                ❌ Cancelar
              </button>

              <button
                className="w-1/2 py-2 rounded-lg bg-[var(--color-primary)] text-white font-semibold"
                onClick={handleConfirm}
              >
                🛎️ Llamar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ✅ Toast animado */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 
                        bg-[var(--color-primary)] text-white px-4 py-2 
                        rounded-full shadow-xl animate-toast z-[9999]">
          🛎️ ¡Camarero avisado!
        </div>
      )}
    </>
  );
}
