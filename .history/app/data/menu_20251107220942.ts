// ✅ Tipo del producto del menú
export type MenuItemType = {
  id: string;
  name: string;
  price: number;
  categoria: string;
  destino: "cocina" | "barra"; // 👈 Nuevo campo
};

// ✅ Menú completo global
export const MENU_ITEMS: MenuItemType[] = [
  // 🍹 Bebidas → barra
  { id: "1", name: "Cerveza", price: 2.0, categoria: "Bebidas", destino: "barra" },
  { id: "2", name: "Coca-Cola", price: 2.2, categoria: "Bebidas", destino: "barra" },
  { id: "3", name: "Agua", price: 1.5, categoria: "Bebidas", destino: "barra" },
  { id: "4", name: "Tinto de Verano", price: 2.8, categoria: "Bebidas", destino: "barra" },
  { id: "5", name: "Café con Leche", price: 1.5, categoria: "Bebidas", destino: "barra" },

  // 🍟 Tapas → cocina
  { id: "6", name: "Patatas Bravas", price: 4.0, categoria: "Tapas", destino: "cocina" },
  { id: "7", name: "Croquetas", price: 4.5, categoria: "Tapas", destino: "cocina" },
  { id: "8", name: "Tortilla Española", price: 3.5, categoria: "Tapas", destino: "cocina" },
  { id: "9", name: "Calamares", price: 5.5, categoria: "Tapas", destino: "cocina" },

  // 🥘 Raciones → cocina
  { id: "10", name: "Jamón Ibérico", price: 9.5, categoria: "Raciones", destino: "cocina" },
  { id: "11", name: "Gambas al Ajillo", price: 10.5, categoria: "Raciones", destino: "cocina" },
  { id: "12", name: "Huevos Rotos", price: 8.5, categoria: "Raciones", destino: "cocina" },
  { id: "19", name: "Pulpo a la Gallega", price: 14.0, categoria: "Raciones", destino: "cocina" },
  { id: "20", name: "Chistorra", price: 7.0, categoria: "Raciones", destino: "cocina" },
  { id: "21", name: "Ensaladilla Rusa", price: 6.5, categoria: "Raciones", destino: "cocina" },

  // 🥪 Bocadillos → cocina
  { id: "13", name: "Bocadillo de Lomo", price: 4.5, categoria: "Bocadillos", destino: "cocina" },
  { id: "14", name: "Bocadillo Vegetal", price: 4.2, categoria: "Bocadillos", destino: "cocina" },
  { id: "15", name: "Perrito Caliente", price: 4.0, categoria: "Bocadillos", destino: "cocina" },

  // 🍰 Postres → barra (postres fríos)
  { id: "16", name: "Tarta de Queso", price: 4.8, categoria: "Postres", destino: "barra" },
  { id: "17", name: "Helado 2 bolas", price: 3.2, categoria: "Postres", destino: "barra" },
  { id: "18", name: "Flan Casero", price: 3.5, categoria: "Postres", destino: "barra" },
];
