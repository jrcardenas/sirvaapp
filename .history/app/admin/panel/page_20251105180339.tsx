"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { MENU_ITEMS } from "@/data/menu";

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
    atenderCuenta,
    addCustomProduct,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") router.replace("/admin");
  }, [router]);

  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");

    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;

      if (data.mesas) useOrderStore.setState({ mesas: data.mesas });

      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo)) {
        dingRef.current?.play().catch(() => null);
      }
    };

    return () => pedidos.close();
  }, []);

  const mesasActivas = Object.entries(mesas).filter(
    ([, m]) => m.items.length > 0 || m.llamada || m.cuentaSolicitada
  );

  const productosFiltrados: MenuItemType[] = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">
      <button
        onClick={() => {
          localStorage.removeItem("admin-auth");
          router.push("/admin");
        }}
        className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-lg font-bold"
      >
        🔓 Salir
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">📢 Panel Camarero</h1>

      {mesasActivas.length === 0 ? (
        <p className="text-center text-textMuted">No hay pedidos 😴</p>
      ) : (
        <>
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
                it.entregado ? acc[it.id].servidos++ : acc[it.id].pendientes++;
                return acc;
              }, {})
            );

            const totalCuenta = agrupados.reduce(
              (a, i) => a + i.price * i.servidos,
              0
            );

            const allServed = agrupados.every((i) => i.pendientes === 0);

            return (
              <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
                <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

                {/* ✅ Aviso llamada */}
                {mesa.llamada && (
                  <AvisoCamarero mesaId={mesaId} atender={atenderLlamada} tipo="llamada" />
                )}

                {/* ✅ Aviso cuenta */}
                {mesa.cuentaSolicitada && (
                  <AvisoCamarero mesaId={mesaId} atender={atenderCuenta} tipo="cuenta" />
                )}

                {/* ✅ Pendientes */}
                {agrupados
                  .filter((i) => i.pendientes > 0)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl mb-2"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="bg-red-600 text-white px-2 rounded-lg"
                          onClick={() => reducirItem(mesaId, item.id)}
                        >
                          ➖
                        </button>

                        <span className="text-lg font-bold">{item.pendientes}</span>

                        <button
                          className="bg-green-600 text-white px-2 rounded-lg"
                          onClick={() => incrementarItem(mesaId, item.id)}
                        >
                          ➕
                        </button>

                        <button
                          onClick={() => {
                            mesa.items
                              .filter((i) => i.id === item.id && !i.entregado)
                              .forEach((i) => marcarServido(mesaId, i.timestamp));

                            enviarAviso(mesaId, "pedidoEnCamino");
                          }}
                          className="bg-primary text-white px-3 py-1 rounded-lg font-bold"
                        >
                          ✅
                        </button>
                      </div>
                    </div>
                  ))}

                {/* ✅ Servidos */}
                {agrupados.some((i) => i.servidos > 0) && (
                  <div className="bg-green-100 p-3 rounded-xl mt-3">
                    {agrupados
                      .filter((i) => i.servidos > 0)
                      .map((i) => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span>{i.servidos}x {i.name}</span>
                          <span>{(i.servidos * i.price).toFixed(2)} €</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* ✅ Añadir productos */}
                <AddProductUI
                  mesaId={mesaId}
                  mesaAdding={mesaAdding}
                  setMesaAdding={setMesaAdding}
                  search={search}
                  setSearch={setSearch}
                  productosFiltrados={productosFiltrados}
                />

                {/* ✅ Cobrar */}
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
        </>
      )}

      {/* ✅ Modal cobro */}
      {mesaParaCobrar && <ModalCobro mesaParaCobrar={mesaParaCobrar} setMesaParaCobrar={setMesaParaCobrar} />}
    </main>
  );
}

/* ✅ Aviso */
function AvisoCamarero({
  mesaId,
  atender,
  tipo,
}: {
  mesaId: string;
  atender: (mesaId: string) => void;
  tipo: "llamada" | "cuenta";
}) {
  return (
    <div
      className={`${
        tipo === "llamada" ? "bg-red-600" : "bg-blue-600"
      } text-white p-3 rounded-xl mb-3 text-center font-bold animate-pulse flex justify-between items-center`}
    >
      {tipo === "llamada"
        ? "🚨 Mesa llamando al camarero"
        : "💳 Mesa ha pedido la cuenta"}
      <button
        onClick={() => {
          atender(mesaId);
          enviarAviso(mesaId, tipo === "llamada" ? "camareroEnCamino" : "cuentaEnCamino");
        }}
        className="bg-white text-black px-2 py-1 rounded-lg font-bold"
      >
        ✅ Atender
      </button>
    </div>
  );
}

/* ✅ Modal de cobro */
function ModalCobro({
  mesaParaCobrar,
  setMesaParaCobrar,
}: {
  mesaParaCobrar: string;
  setMesaParaCobrar: (id: string | null) => void;
}) {
  const { mesas, cobrarMesa } = useOrderStore();

  const mesa = mesas[mesaParaCobrar];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">
        <h3 className="text-xl font-bold text-center mb-4">
          💳 Cobrar Mesa {mesaParaCobrar}
        </h3>

        <div className="max-h-40 overflow-y-auto mb-4 space-y-1 text-sm">
          {mesa.items
            .filter((i) => i.entregado)
            .map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>✅ {i.name}</span>
                <span>{i.price.toFixed(2)} €</span>
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="bg-primary text-white py-3 rounded-xl font-bold text-lg"
            onClick={() => {
              cobrarMesa(mesaParaCobrar);
              setMesaParaCobrar(null);
              enviarAviso(mesaParaCobrar, "mesaCobrada");
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
        </div>
      </div>
    </div>
  );
}

/* ✅ Crear producto personalizado */
type CrearProductoProps = {
  mesaId: string;
  nombreInicial: string;
  onCancel: () => void;
};

function CrearProductoPersonalizado({
  mesaId,
  nombreInicial,
  onCancel,
}: CrearProductoProps) {
  const { addCustomProduct } = useOrderStore();
  const [nombre, setNombre] = useState(nombreInicial);
  const [precio, setPrecio] = useState<string>("");

  return (
    <div className="p-2 space-y-2">
      <div className="text-gray-600 pb-1 text-xs">👉 Producto personalizado</div>

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
        onClick={() => {
          const precioNum = parseFloat(precio);
          if (!precioNum || precioNum <= 0) return;
          addCustomProduct(mesaId, nombre, precioNum);
          onCancel();
        }}
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

/* ✅ Avisos cliente */
function enviarAviso(mesaId: string, mensaje: string) {
  const notify = new BroadcastChannel("notify_channel");
  notify.postMessage({ mesaId, mensaje });
  notify.close();
}
