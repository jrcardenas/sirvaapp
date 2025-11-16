"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function AdminPanel() {
  const router = useRouter();
  const { mesas, marcarServido, cobrarMesa, atenderLlamada } = useOrderStore();

  const dingRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ✅ Comprobar login ANTES de renderizar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuth = localStorage.getItem("admin-auth") === "true";
    if (!isAuth) {
      router.replace("/admin");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  // ✅ Mientras comprueba credenciales, no mostramos nada
  if (checkingAuth) return null;

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    if (dingRef.current) dingRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    const ch = new BroadcastChannel("notify_channel");
    ch.onmessage = (ev) => {
      if (ev.data?.llamada) {
        setSoundReady(true);
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => ch.close();
  }, []);
