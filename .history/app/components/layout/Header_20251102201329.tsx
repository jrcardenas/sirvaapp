"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const mesaId = params?.id;

  const navItems = [
    { href: mesaId ? `/mesa/${mesaId}/menu` : "/", label: "Menú", icon: "🍽️" },
    { href: mesaId ? `/mesa/${mesaId}/cuenta` : "/", label: "Cuenta", icon: "🧾" },
    { href: mesaId ? `/mesa/${mesaId}/llamar` : "/", label: "Llamar", icon: "🛎️" },
    { href: mesaId ? `/mesa/${mesaId}/info` : "/", label: "Info", icon: "ℹ️" },
  ];

  return (
    <header className="nav-menu">
      <nav className="nav-menu-inner">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
