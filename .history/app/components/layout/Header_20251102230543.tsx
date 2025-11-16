"use client";

import { usePathname, useParams, useRouter } from "next/navigation";

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
      label: "Llamar",
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

  const handleClick = (item: NavItem) => {
    if (item.action === "call") {
      document.dispatchEvent(new Event("call-waiter"));
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <header className="w-full py-3 bg-white border-b shadow-sm fixed top-0 z-50">
      <nav className="flex justify-around max-w-md mx-auto text-sm">
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center transition ${
                item.href && pathname === item.href
                  ? "text-blue-600 font-bold"
                  : "text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
      </nav>
    </header>
    
  );
}
