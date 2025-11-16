// ✅ Tipo del producto del menú
export type MenuItemType = {
  id: string;
  name: string;
  price: number;
  categoria: string;
  destino: "cocina" | "barra";
  imagen: string;
};

// ✅ Menú completo global (con .png)
export const MENU_ITEMS: MenuItemType[] = [
  // 🍹 Bebidas → barra
  { id: "1", name: "Cerveza", price: 2.0, categoria: "Bebidas", destino: "barra", imagen: "/icons/cerveza.png" },
  { id: "2", name: "Refresco", price: 2.2, categoria: "Bebidas", destino: "barra", imagen: "/icons/refresco.png" },
  { id: "3", name: "Agua", price: 1.5, categoria: "Bebidas", destino: "barra", imagen: "/icons/agua.png" },
  { id: "4", name: "Tinto de Verano", price: 2.8, categoria: "Bebidas", destino: "barra", imagen: "/icons/tinto-verano.png" },
  { id: "5", name: "Café con Leche", price: 1.5, categoria: "Bebidas", destino: "barra", imagen: "/icons/cafe.png" },

  // 🍟 Tapas → cocina
  { id: "6", name: "Patatas Bravas", price: 4.0, categoria: "Tapas", destino: "cocina", imagen: "/icons/bravas.png" },
  { id: "7", name: "Croquetas", price: 4.5, categoria: "Tapas", destino: "cocina", imagen: "/icons/croquetas.png" },
  { id: "8", name: "Tortilla Española", price: 3.5, categoria: "Tapas", destino: "cocina", imagen: "/icons/tortilla.png" },
  { id: "9", name: "Calamares", price: 5.5, categoria: "Tapas", destino: "cocina", imagen: "/icons/calamares.png" },

  // 🥘 Raciones → cocina
  { id: "10", name: "Jamón Ibérico", price: 9.5, categoria: "Raciones", destino: "cocina", imagen: "/icons/jamon.png" },
  { id: "11", name: "Gambas al Ajillo", price: 10.5, categoria: "Raciones", destino: "cocina", imagen: "/icons/gambas.png" },
  { id: "12", name: "Huevos Rotos", price: 8.5, categoria: "Raciones", destino: "cocina", imagen: "/icons/huevos-rotos.png" },
  { id: "19", name: "Pulpo a la Gallega", price: 14.0, categoria: "Raciones", destino: "cocina", imagen: "/icons/pulpo.png" },
  { id: "20", name: "Chistorra", price: 7.0, categoria: "Raciones", destino: "cocina", imagen: "/icons/chistorra.png" },
  { id: "21", name: "Ensaladilla Rusa", price: 6.5, categoria: "Raciones", destino: "cocina", imagen: "/icons/ensaladilla.png" },

  // 🥪 Bocadillos → cocina
  { id: "13", name: "Bocadillo de Lomo", price: 4.5, categoria: "Bocadillos", destino: "cocina", imagen: "/icons/bocata-lomo.png" },
  { id: "14", name: "Bocadillo Vegetal", price: 4.2, categoria: "Bocadillos", destino: "cocina", imagen: "/icons/bocata-vegetal.png" },
  { id: "15", name: "Perrito Caliente", price: 4.0, categoria: "Bocadillos", destino: "cocina", imagen: "/icons/perrito.png" },

  // 🍰 Postres fríos → barra
  { id: "16", name: "Tarta de Queso", price: 4.8, categoria: "Postres", destino: "barra", imagen: "/icons/tarta-queso.png" },
  { id: "17", name: "Helado 2 bolas", price: 3.2, categoria: "Postres", destino: "barra", imagen: "/icons/helado.png" },
  { id: "18", name: "Flan Casero", price: 3.5, categoria: "Postres", destino: "barra", imagen: "/icons/flan.png" },
];
