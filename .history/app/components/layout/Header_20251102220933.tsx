"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const mesaId = params?.id;

  const navItems = [
    {
      href: "/",
      label: "Inicio",
      icon: "🏠",
      visible: true,
    },
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
      href: mesaId ? `/mesa/${mesaId}/llamar` : "/",
      label: "Llamar",
      icon: "🛎️",
      visible: !!mesaId,
    },
    {
      href: mesaId ? `/mesa/${mesaId}/info` : "/",
      label: "Info",
      icon: "ℹ️",
      visible: !!mesaId,
    },
  ];

  return (
    <header className="w-full py-3 bg-white border-b shadow-sm fixed top-0 z-50">
      <nav className="flex justify-around max-w-md mx-auto text-sm">
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex flex-col items-center transition ${
                pathname === item.href
                  ? "text-blue-600 font-bold"
                  : "text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
      </nav>
    </header>
  );
}
