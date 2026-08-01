import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// Deux lignes de panier sont "identiques" si même produit + même couleur + même taille
function sameLine(a: { productId: string; color?: string; size?: string }, b: { productId: string; color?: string; size?: string }) {
  return a.productId === b.productId && (a.color || "") === (b.color || "") && (a.size || "") === (b.size || "");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, { productId, color, size })),
        }));
      },

      updateQuantity: (productId, quantity, color, size) => {
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => !sameLine(i, { productId, color, size }))
            : state.items.map((i) =>
                sameLine(i, { productId, color, size }) ? { ...i, quantity } : i
              ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "sm-cart" }
  )
);
