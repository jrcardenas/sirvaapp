"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface ProductoPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  nota?: string;
}

interface OrderContextValue {
  pedido: ProductoPedido[];
  agregarProducto: (producto: ProductoPedido) => void;
  cambiarCantidad: (id: number, accion: "sumar" | "restar") => void;
  eliminarProducto: (id: number) => void;
  vaciarPedido: () => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<ProductoPedido[]>([]);

  const agregarProducto = (producto: ProductoPedido) => {
    setPedido((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + producto.cantidad }
            : p
        );
      }
      return [...prev, producto];
    });
  };

  const cambiarCantidad = (id: number, accion: "sumar" | "restar") => {
    setPedido((prev) =>
      prev
        .map((p) => {
          if (p.id !== id) return p;
          if (accion === "sumar") return { ...p, cantidad: p.cantidad + 1 };
          if (p.cantidad === 1) return p; // no bajar de 1
          return { ...p, cantidad: p.cantidad - 1 };
        })
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminarProducto = (id: number) => {
    setPedido((prev) => prev.filter((p) => p.id !== id));
  };

  const vaciarPedido = () => {
    setPedido([]);
  };

  return (
    <OrderContext.Provider
      value={{ pedido, agregarProducto, cambiarCantidad, eliminarProducto, vaciarPedido }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder debe usarse dentro de OrderProvider");
  return context;
}
