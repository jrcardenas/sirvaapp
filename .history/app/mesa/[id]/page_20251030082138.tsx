import Link from "next/link";

...

<div className="flex flex-col gap-4 max-w-sm mx-auto">
  <Link
    href={`/mesa/${id}/menu`}
    className="bg-[#14532D] hover:bg-[#0f3e21] text-white py-3 rounded-lg font-semibold text-center block transition"
  >
    Ver Carta 🧾
  </Link>

  <button className="bg-[#8B5E3C] hover:bg-[#70492e] text-white py-3 rounded-lg font-semibold transition">
    Llamar camarero 🛎️
  </button>
</div>
