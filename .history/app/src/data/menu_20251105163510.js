// ✅ Definición del tipo de producto del menú
export type MenuItemType = {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
};

// ✅ Iconos por categoría
export const ICONS_CATEGORY: Record<string, string> = {
  Bebidas: "🍹",
  Tapas: "🍟",
  Raciones: "🥘",
  Bocadillos: "🥪",
  Postres: "🍰",
};

// ✅ Menú global unificado
export const MENU_ITEMS: MenuItemType[] = [
  { id: "1", category: "Bebidas",   name: "Cerveza",            price: 2.0 },
  { id: "2", category: "Bebidas",   name: "Coca-Cola",          price: 2.2 },
  { id: "3", category: "Bebidas",   name: "Agua",               price: 1.5 },
  { id: "4", category: "Bebidas",   name: "Tinto de Verano",    price: 2.8 },
  { id: "5", category: "Bebidas",   name: "Café con Leche",     price: 1.5 },

  { id: "6", category: "Tapas",     name: "Patatas Bravas",     price: 4.0 },
  { id: "7", category: "Tapas",     name: "Croquetas",          price: 4.5 },
  { id: "8", category: "Tapas",     name: "Tortilla Española",  price: 3.5 },
  { id: "9", category: "Tapas",     name: "Calamares",          price: 5.5 },

  { id: "10", category: "Raciones", name: "Jamón Ibérico",      price: 9.5 },
  { id: "11", category: "Raciones", name: "Gambas al Ajillo",   price: 10.5 },
  { id: "12", category: "Raciones", name: "Huevos Rotos",       price: 8.5 },
  { id: "19", category: "Raciones", name: "Pulpo a la Gallega", price: 14.0 },
  { id: "20", category: "Raciones", name: "Chistorra",          price: 7.0 },
  { id: "21", category: "Raciones", name: "Ensaladilla Rusa",   price: 6.5 },

  { id: "13", category: "Bocadillos", name: "Bocadillo de Lomo", price: 4.5 },
  { id: "14", category: "Bocadillos", name: "Bocadillo Vegetal", price: 4.2 },
  { id: "15", category: "Bocadillos", name: "Perrito Caliente", price: 4.0 },

  { id: "16", category: "Postres", name: "Tarta de Queso",      price: 4.8 },
  { id: "17", category: "Postres", name: "Helado 2 bolas",      price: 3.2 },
  { id: "18", category: "Postres", name: "Flan Casero",         price: 3.5 },
];

// ✅ Inyectar iconos automáticamente
MENU_ITEMS.forEach((p) => {
  p.icon = ICONS_CATEGORY[p.category] ?? "🍽️";
});
