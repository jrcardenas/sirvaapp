"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface ProductoPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface OrderContextValue {
  pedido: ProductoPedido[];
  agregarProducto: (producto: ProductoPedido) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<ProductoPedido[]>([]);

  const agregarProducto = (producto: ProductoPedido) => {
    setPedido((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  return (
    <OrderContext.Provider value={{ pedido, agregarProducto }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder debe usarse dentro de OrderProvider");
  return context;
}
