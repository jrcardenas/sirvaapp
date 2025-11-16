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
    <header className="w-full h-14 bg-white border-b shadow-sm fixed top-0 z-50">
      <nav className="flex justify-around items-center max-w-md mx-auto text-sm h-full">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const isActive = item.href && pathname?.startsWith(item.href);
            const isCall = item.action === "call";

            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition 
                ${
                  isCall
                    ? "bg-green-600 text-white shadow-md active:scale-95 font-bold"
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
  );
}
