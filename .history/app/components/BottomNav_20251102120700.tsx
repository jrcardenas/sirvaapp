"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/menu", label: "Menú", icon: "🍽️" },
    { href: "/cuenta", label: "Cuenta", icon: "🧾" },
    { href: "/llamar", label: "Llamar", icon: "🛎️" },
    { href: "/info", label: "Info", icon: "ℹ️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
      <div className="flex justify-around py-2 max-w-md mx-auto text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-4 ${
              pathname === item.href
                ? "text-blue-600 font-bold"
                : "text-gray-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
