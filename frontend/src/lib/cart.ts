import { apiFetch } from "./api";
import { getToken } from "./auth";
import {
  addToGuestCart,
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
} from "./guestCart";

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  stock: number;
}

export interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

const CART_UPDATED_EVENT = "cart:updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function onCartUpdated(callback: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, callback);
  return () => window.removeEventListener(CART_UPDATED_EVENT, callback);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function addToCart(productId: string, quantity: number) {
  if (isLoggedIn()) {
    await apiFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  } else {
    addToGuestCart(productId, quantity);
  }
  notifyCartUpdated();
}

export async function getCart(): Promise<CartLine[]> {
  if (isLoggedIn()) {
    const items = await apiFetch("/cart");
    return items;
  }

  const guestItems = getGuestCart();
  if (guestItems.length === 0) return [];

  const products = await Promise.all(
    guestItems.map((item) =>
      apiFetch(`/products/${item.productId}`).catch(() => null),
    ),
  );

  return guestItems
    .map((item, i) => {
      const product = products[i];
      if (!product) return null;
      return { id: item.productId, productId: item.productId, quantity: item.quantity, product };
    })
    .filter((line): line is CartLine => line !== null);
}

export async function removeFromCart(line: CartLine) {
  if (isLoggedIn()) {
    await apiFetch(`/cart/items/${line.id}`, { method: "DELETE" });
  } else {
    removeFromGuestCart(line.productId);
  }
  notifyCartUpdated();
}

export async function updateCartQuantity(line: CartLine, quantity: number) {
  if (isLoggedIn()) {
    await apiFetch(`/cart/items/${line.id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  } else {
    updateGuestCartQuantity(line.productId, quantity);
  }
  notifyCartUpdated();
}

export async function getCartCount(): Promise<number> {
  if (isLoggedIn()) {
    const items = await apiFetch("/cart");
    return items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  }

  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}
