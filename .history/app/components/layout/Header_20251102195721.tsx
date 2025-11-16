"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const { id: mesaId } = useParams() as { id: string };

  const base = `/mesa/${mesaId}`;

  const navItems = [
    { href: `${base}/menu`, label: "Menú", icon: "🍽️" },
    { href: `${base}/cuenta`, label: "Cuenta", icon: "🧾" },
    { href: `${base}/llamar`, label: "Llamar", icon: "🛎️" },
    { href: `${base}/info`, label: "Info", icon: "ℹ️" },
  ];

  return (
    <header className="w-full py-3 bg-white border-b shadow-sm fixed top-0 z-50">
      <nav className="flex justify-around max-w-md mx-auto text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
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
