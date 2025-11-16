"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, PedidoItem } from "@/store/orderStore";
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
    confirmarItem,
  } = useOrderStore();

  const [mesaParaCobrar, setMesaParaCobrar] = useState<string | null>(null);
  const [mesaAdding, setMesaAdding] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const dingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingRef.current = new Audio("/sounds/ding.mp3");
    dingRef.current.volume = 1;
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // 🔄 Sincronización en tiempo real
  useEffect(() => {
    const pedidos = new BroadcastChannel("pedidos_channel");
    pedidos.onmessage = (ev) => {
      const data = ev.data;
      if (!data?.mesas) return;

      useOrderStore.setState({ mesas: structuredClone(data.mesas) });

      if (["nuevoPedido", "llamada", "cuenta"].includes(data.tipo)) {
        dingRef.current?.play().catch(() => null);
      }
    };
    return () => pedidos.close();
  }, []);

  function enviarAvisoCliente(mesaId: string, mensaje: string) {
    const notify = new BroadcastChannel("notify_channel");
    notify.postMessage({ mesaId, mensaje });
    notify.close();
  }

  const mesasIds = Array.from({ length: 10 }).map((_, i) => (i + 1).toString());

  const mesasOrdenadas = mesasIds.sort((a, b) => {
    const ma =
      mesas[a] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };
    const mb =
      mesas[b] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };

    const pendientesA = ma.items?.filter((i) => !i.entregado).length ?? 0;
    const pendientesB = mb.items?.filter((i) => !i.entregado).length ?? 0;

    if (ma.llamada !== mb.llamada) return ma.llamada ? -1 : 1;
    if (ma.cuentaSolicitada !== mb.cuentaSolicitada)
      return ma.cuentaSolicitada ? -1 : 1;
    if (pendientesA !== pendientesB) return pendientesB - pendientesA;

    const servidosA = ma.items?.filter((i) => i.entregado).length ?? 0;
    const servidosB = mb.items?.filter((i) => i.entregado).length ?? 0;
    return servidosB - servidosA;
  });

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

      <h1 className="text-3xl font-bold text-center mb-6">🏪 Administrador del bar</h1>

      <div className="space-y-6">
        {mesasOrdenadas.map((mesaId) => {
          const mesa =
            mesas[mesaId] ?? { items: [] as PedidoItem[], llamada: false, cuentaSolicitada: false };

          const agrupados = Object.values(
            (mesa.items ?? []).reduce<Record<string, GrupoItem>>((acc, it) => {
              if (!acc[it.id]) {
                acc[it.id] = { id: it.id, name: it.name, price: it.price, pendientes: 0, servidos: 0 };
              }
              it.entregado ? acc[it.id].servidos++ : acc[it.id].pendientes++;
              return acc;
            }, {})
          );

          const allServed = agrupados.every((i) => i.pendientes === 0);
          const totalCuenta = agrupados.reduce((a, i) => a + i.price * i.servidos, 0);

          return (
            <div key={mesaId} className="p-4 rounded-2xl border shadow bg-white">
              <h2 className="text-xl font-bold mb-3">Mesa {mesaId}</h2>

              {/* 🚨 Llamada */}
              {mesa.llamada && (
                <div className="bg-red-600 text-white p-3 rounded-xl mb-3 animate-pulse flex justify-between">
                  🚨 Llamando al camarero
                  <button
                    className="bg-white text-red-600 px-2 py-1 rounded-lg font-bold"
                    onClick={() => {
                      atenderLlamada(mesaId);
                      enviarAvisoCliente(mesaId, "camareroEnCamino");
                    }}
                  >
                    ✅
                  </button>
                </div>
              )}

              {/* 💳 Cuenta */}
              {mesa.cuentaSolicitada && (
                <div className="bg-blue-600 text-white p-3 rounded-xl mb-3 animate-pulse flex justify-between">
                  💳 Ha pedido la cuenta
                  <button
                    className="bg-white text-blue-700 px-2 py-1 rounded-lg font-bold"
                    onClick={() => {
                      atenderCuenta(mesaId);
                      enviarAvisoCliente(mesaId, "cuentaEnCamino");
                    }}
                  >
                    ✅
                  </button>
                </div>
              )}

              {/* 🟡 Pendientes */}
{(agrupados.filter((i) => i.pendientes > 0) ?? []).map((item) => {
  const pendientes = (mesa.items ?? []).filter(
    (i) => i.id === item.id && !i.entregado && i.estado === "pendiente"
  );
  const enColaCocina = (mesa.items ?? []).filter(
    (i) => i.id === item.id && !i.entregado && i.estado === "pendienteCocina"
  );
  const preparando = (mesa.items ?? []).filter(
    (i) => i.id === item.id && !i.entregado && i.estado === "preparando"
  );
  const preparados = (mesa.items ?? []).filter(
    (i) => i.id === item.id && !i.entregado && i.estado === "preparado"
  );

  const producto = MENU_ITEMS.find((p) => p.id === item.id);
  const destino = producto?.destino ?? "cocina";

  // 🔒 Si el producto está siendo gestionado por cocina, bloqueamos los controles
  const bloqueado =
    destino === "cocina" &&
    (enColaCocina.length > 0 || preparando.length > 0 || preparados.length > 0);

  return (
    <div
    key={item.id}
  className={`flex justify-between items-center p-3 rounded-xl mb-2 ${
    bloqueado ? "bg-gray-100" : "bg-yellow-100"
  }`}
    >
      <div className="flex flex-col">
        <span className="font-semibold">{item.name}</span>
        <div className="mt-1 text-xs text-gray-700 flex gap-2">
          {pendientes.length > 0 && <span>🟡 {pendientes.length} pendientes</span>}
          {enColaCocina.length > 0 && <span>🟨 {enColaCocina.length} en cocina</span>}
          {preparando.length > 0 && <span>🟠 {preparando.length} preparando</span>}
          {preparados.length > 0 && <span>🟢 {preparados.length} preparados</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* ➖ / ➕ bloqueados si está en cocina */}
        <button
          className={`bg-red-600 text-white px-2 rounded-lg ${
            bloqueado ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={bloqueado}
          onClick={() => !bloqueado && reducirItem(mesaId, item.id)}
        >
          ➖
        </button>

        <span className="text-lg font-bold">{item.pendientes}</span>

        <button
          className={`bg-green-600 text-white px-2 rounded-lg ${
            bloqueado ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={bloqueado}
          onClick={() => !bloqueado && incrementarItem(mesaId, item.id)}
        >
          ➕
        </button>

        {/* 📤 Confirmar o 🍷 Servir (si barra) */}
        {destino === "cocina" ? (
<button
  className={`px-3 py-1 rounded-lg font-bold text-white transition-all duration-200 ${
    pendientes.length === 0 || bloqueado
      ? "bg-blue-400/50 cursor-not-allowed"
      : "bg-blue-600 shadow-md"
  }`}
  disabled={pendientes.length === 0 || bloqueado}
  onClick={() => {
    // ✅ Enviar a cocina y bloquear visualmente de inmediato
    pendientes.forEach((i) => confirmarItem(mesaId, i.timestamp));
  }}
  title="Enviar a cocina"
>
  📤 Prep
</button>

        ) : (
          <button
            className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold"
            disabled={pendientes.length === 0}
            onClick={() => {
              pendientes.forEach((i) => marcarServido(mesaId, i.timestamp));
              enviarAvisoCliente(mesaId, "pedidoServido");
            }}
            title="Servir directamente (barra)"
          >
            🍷 Servir
          </button>
        )}

{/* ✅ Servir (solo si ya está preparado en cocina) */}
{destino === "cocina" && (
  <button
    className={`bg-primary text-white px-3 py-1 rounded-lg font-bold ${
      preparados.length === 0 ? "opacity-50 cursor-not-allowed" : ""
    }`}
    disabled={preparados.length === 0}
    onClick={() => {
      preparados.forEach((i) => marcarServido(mesaId, i.timestamp));
      enviarAvisoCliente(mesaId, "pedidoEnCamino");
    }}
    title="Marcar como servido lo ya preparado" 
  >
    ✅ Servir
  </button>
)}

      </div>
    </div>
  );
})}


              {/* ✅ Servidos */}
              {agrupados.some((i) => i.servidos > 0) && (
                <div className="bg-green-100 p-3 rounded-xl mt-3">
                  {agrupados
                    .filter((i) => i.servidos > 0)
                    .map((i) => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span>
                          {i.servidos}x {i.name}
                        </span>
                        <span>{(i.servidos * i.price).toFixed(2)} €</span>
                      </div>
                    ))}
                </div>
              )}

              {/* ➕ Añadir producto */}
              {mesaAdding === mesaId ? (
                <AgregarProducto mesaId={mesaId} search={search} setSearch={setSearch} setMesaAdding={setMesaAdding} />
              ) : (
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold mt-3"
                  onClick={() => setMesaAdding(mesaId)}
                >
                  ➕ Añadir producto
                </button>
              )}

              {/* 💳 Cobrar */}
              {allServed && agrupados.some((i) => i.servidos > 0) && (
                <button
                  className="w-full mt-4 bg-primary text-white py-2 rounded-xl font-bold animate-pulse"
                  onClick={() => setMesaParaCobrar(mesaId)}
                >
                  💳 Cobrar {totalCuenta.toFixed(2)} €
                </button>
              )}
            </div>
          );
        })}
      </div>

      {mesaParaCobrar && <ModalCobroEditable mesaId={mesaParaCobrar} setMesaParaCobrar={setMesaParaCobrar} />}
    </main>
  );
}

/* 🔧 Componente reutilizable de búsqueda/agregar */
function AgregarProducto({
  mesaId,
  search,
  setSearch,
  setMesaAdding,
}: {
  mesaId: string;
  search: string;
  setSearch: (v: string) => void;
  setMesaAdding: (v: string | null) => void;
}) {
  const { addCustomProduct } = useOrderStore();

  const productosFiltrados = MENU_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-3 p-3 bg-gray-100 rounded-xl space-y-2">
      <input
        type="text"
        placeholder="Buscar producto…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded-md border"
        autoFocus
      />

      {search && (
        <div className="max-h-36 overflow-y-auto bg-white border rounded-xl shadow-md p-1 text-sm">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => addCustomProduct(mesaId, p.name, p.price)}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-200"
              >
                {p.name} — {p.price} €
              </button>
            ))
          ) : (
            <CrearProductoPersonalizado mesaId={mesaId} nombreInicial={search} onCancel={() => setSearch("")} />
          )}
        </div>
      )}

      <button
        className="w-full bg-gray-300 py-2 rounded-xl font-semibold"
        onClick={() => setMesaAdding(null)}
      >
        ❌ Cancelar
      </button>
    </div>
  );
}

/* ✅ Crear producto personalizado */
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
  const [precio, setPrecio] = useState("");

  return (
    <div className="p-2 space-y-2">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 border rounded-md"
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
        className="w-full bg-primary text-white py-2 rounded-xl font-bold"
        disabled={!nombre || !precio}
        onClick={() => {
          const precNum = parseFloat(precio);
          if (!precNum || precNum <= 0) return;
          addCustomProduct(mesaId, nombre, precNum);
          onCancel();
        }}
      >
        ✅ Añadir
      </button>
    </div>
  );
}

/* ✅ Modal de cobro */
function ModalCobroEditable({
  mesaId,
  setMesaParaCobrar,
}: {
  mesaId: string;
  setMesaParaCobrar: (v: string | null) => void;
}) {
  const { mesas, incrementarItem, reducirItem, cobrarMesa } = useOrderStore();
  const mesa = mesas[mesaId] ?? { items: [] as PedidoItem[] };

  const agrupados = Object.values(
    (mesa.items ?? [])
      .filter((i) => i.entregado)
      .reduce<Record<string, { id: string; name: string; price: number; qty: number }>>(
        (acc, item) => {
          if (!acc[item.id])
            acc[item.id] = { id: item.id, name: item.name, price: item.price, qty: 0 };
          acc[item.id].qty++;
          return acc;
        },
        {}
      )
  );

  const total = agrupados.reduce((a, i) => a + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-gray-900 shadow-xl">
        <h3 className="text-xl font-bold text-center mb-4">
          🧾 Revisar Cuenta — Mesa {mesaId}
        </h3>

        <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
          {agrupados.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
            >
              <span className="flex-1">{i.name}</span>

              <div className="flex items-center gap-1">
                <button
                  className="bg-red-600 text-white w-7 h-7 rounded-lg"
                  onClick={() => reducirItem(mesaId, i.id)}
                >
                  ➖
                </button>

                <span className="text-lg font-bold w-7 text-center">{i.qty}</span>

                <button
                  className="bg-green-600 text-white w-7 h-7 rounded-lg"
                  onClick={() => incrementarItem(mesaId, i.id)}
                >
                  ➕
                </button>
              </div>

              <span className="ml-3 w-14 text-right font-semibold">
                {(i.price * i.qty).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg mb-6 border-t pt-2">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>

        <button
          className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg"
          onClick={() => {
            cobrarMesa(mesaId);
            const notify = new BroadcastChannel("notify_channel");
            notify.postMessage({ mesaId, mensaje: "mesaCobrada" });
            notify.close();
            setMesaParaCobrar(null);
          }}
        >
          ✅ Confirmar Cobro
        </button>

        <button
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold text-lg mt-2"
          onClick={() => setMesaParaCobrar(null)}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}
