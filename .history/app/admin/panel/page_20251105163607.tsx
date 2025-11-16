"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
import { MENU_ITEMS, MenuItemType } from "@/src/data/men";

type GrupoItem = {
  id: string;
  name: string;
  price: number;
  pendientes: number;
  servidos: number;
};

type MenuItemType = {
  id: string;
  name: string;
  price: number;
};

type AgrupadoProducto = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function AdminPanel() {
  const router = useRouter();
  const {
    mesas,
    marcarServido,
    incrementarItem,
    reducirItem,
    cobrarMesa,
    atenderLlamada,
    addCustomProduct,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current!.volume = 1;
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  useEffect(() => {
    const bc = new BroadcastChannel("pedidos_channel");
    bc.onmessage = (ev) => {
      if (ev.data?.mesas) {
        useOrderStore.setState({ mesas: ev.data.mesas });
        if (ev.data?.nuevoPedido) dingRef.current?.play().catch(() => null);
      }
    };
    return () => bc.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada
  );

  const productosFiltrados: MenuItemType[] = MENU_ITEMS.filter((p: MenuItemType) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const agregarProductoMenu = (
    mesaId: string,
    product: MenuItemType
  ) => {
    addCustomProduct(mesaId, product.name, product.price);
    setSearch("");
    setMesaAdding(null);
  };

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">
      
      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
        📢 Panel Camarero
      </h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <div className="space-y-6">
          {mesasActivas.map(([mesaId, mesa]) => {
            
            const agrupados = Object.values(
              mesa.items.reduce<Record<string, GrupoItem>>((acc, it) => {
                if (!acc[it.id]) {
                  acc[it.id] = {
                    id: it.id,
                    name: it.name,
                    price: it.price,
                    pendientes: 0,
                    servidos: 0,
                  };
                }
                it.entregado
                  ? acc[it.id].servidos++
                  : acc[it.id].pendientes++;
                return acc;
              }, {})
            );

            const totalCuenta = agrupados.reduce(
              (a, i) => a + i.price * i.servidos,
              0
            );

            const allServed = agrupados.every(i => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">

                <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

                {/* Pendientes */}
                {agrupados
                  .filter(i => i.pendientes > 0)
                  .map(item => (
                    <div key={item.id}
                      className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="bg-red-600 text-white px-2 rounded-lg"
                          onClick={() => reducirItem(mesaId, item.id)}
                        >➖</button>
                        <span className="text-lg font-bold">{item.pendientes}</span>
                        <button
                          className="bg-green-600 text-white px-2 rounded-lg"
                          onClick={() => incrementarItem(mesaId, item.id)}
                        >➕</button>
                        <button
                          onClick={() =>
                            mesa.items
                              .filter(i => i.id === item.id && !i.entregado)
                              .forEach(i => marcarServido(mesaId, i.timestamp))
                          }
                          className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                        >
                          ✅
                        </button>
                      </div>
                    </div>
                ))}

                {/* Servidos */}
                {agrupados.some(i => i.servidos > 0) && (
                  <div className="bg-green-100 p-3 rounded-xl mt-3">
                    {agrupados
                      .filter(i => i.servidos > 0)
                      .map(i => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span>{i.servidos}x {i.name}</span>
                          <span>{(i.servidos * i.price).toFixed(2)} €</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Nueva UI Agregar producto */}
                {mesaAdding === mesaId ? (
                  <div className="mt-3 p-3 bg-gray-100 rounded-xl space-y-2">

                    <input
                      type="text"
                      placeholder="Buscar o añadir producto"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full p-2 rounded-md border"
                      autoFocus
                    />

                 {search && (
  <div className="max-h-36 overflow-y-auto bg-white border rounded-xl shadow-md p-1 text-sm">
    {productosFiltrados.length > 0 ? (
      productosFiltrados.map(p => (
        <button
          key={p.id}
          onClick={() => agregarProductoMenu(mesaId, p)}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-200"
        >
          {p.name} — {p.price} €
        </button>
      ))
    ) : (
      <CrearProductoPersonalizado
        mesaId={mesaId}
        nombreInicial={search}
        onCancel={() => setSearch("")}
      />
    )}
  </div>
)}


                    <button
                      onClick={() => setMesaAdding(null)}
                      className="w-full bg-gray-300 py-2 rounded-xl font-semibold"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMesaAdding(mesaId)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold mt-3"
                  >
                    ➕ Añadir producto
                  </button>
                )}

                {allServed && (
                  <button
                    onClick={() => setMesaParaCobrar(mesaId)}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  >
                    💳 Cobrar {totalCuenta.toFixed(2)} €
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL COBRO */}
      {mesaParaCobrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">

            <h3 className="text-xl font-bold text-center mb-4">
              💳 Cobrar Mesa {mesaParaCobrar}
            </h3>

            {(() => {
              const mesa = mesas[mesaParaCobrar];

              const itemsAgrupados = Object.values(
                mesa.items.reduce<Record<string, AgrupadoProducto>>((acc, item) => {
                  if (!item.entregado) return acc;
                  if (!acc[item.id]) {
                    acc[item.id] = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      qty: 0,
                    };
                  }
                  acc[item.id].qty += 1;
                  return acc;
                }, {})
              );

              const total = itemsAgrupados.reduce(
                (acc, item) => acc + item.qty * item.price,
                0
              );

              return (
                <>
                  <div className="max-h-40 overflow-y-auto mb-4 space-y-1 text-sm">
                    {itemsAgrupados.map(i => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.qty}x {i.name}</span>
                        <span>{(i.qty * i.price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 mb-6">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </>
              );
            })()}

            <div className="flex flex-col gap-2">
              <button
                className="bg-primary text-white py-3 rounded-xl font-bold text-lg"
                onClick={() => {
                  cobrarMesa(mesaParaCobrar);
                  setMesaParaCobrar(null);
                }}
              >
                ✅ Confirmar Cobro
              </button>

              <button
                className="bg-gray-300 py-3 rounded-xl font-semibold text-lg"
                onClick={() => setMesaParaCobrar(null)}
              >
                ❌ Cancelar
              </button>

              <button
                disabled
                className="bg-blue-600 text-white py-3 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed"
              >
                🧾 Imprimir Ticket (Próx)
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
  function CrearProductoPersonalizado({
  mesaId,
  nombreInicial,
  onCancel,
}: {
  mesaId: string;
  nombreInicial: string;
  onCancel: () => void;
}) {
  const { addCustomProduct } = useOrderStore();
  const [nombre, setNombre] = useState(nombreInicial);
  const [precio, setPrecio] = useState<string>("");

  const crearProducto = () => {
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) return;

    addCustomProduct(mesaId, nombre, precioNum);
    setNombre("");
    setPrecio("");
    onCancel();
  };

  return (
    <div className="p-2 space-y-2">
      <div className="text-gray-600 pb-1 text-xs">
        👉 Producto personalizado
      </div>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Nombre del producto"
      />

      <input
        type="number"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Precio (€)"
        min="0"
        step="0.10"
      />

      <button
        className="w-full bg-primary text-white py-2 rounded-xl font-bold disabled:bg-gray-300"
        onClick={crearProducto}
        disabled={!nombre || !precio}
      >
        ✅ Crear producto
      </button>

      <button
        className="w-full bg-gray-300 text-gray-700 py-2 rounded-xl font-semibold"
        onClick={onCancel}
      >
        ❌ Cancelar
      </button>
    </div>
  );
}

}
