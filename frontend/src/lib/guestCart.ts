const GUEST_CART_KEY = "guest_cart";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

export function getGuestCart(): GuestCartItem[] {
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function addToGuestCart(productId: string, quantity: number) {
  const items = getGuestCart();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  saveGuestCart(items);
  return items;
}

export function removeFromGuestCart(productId: string) {
  const items = getGuestCart().filter((item) => item.productId !== productId);
  saveGuestCart(items);
  return items;
}

export function updateGuestCartQuantity(productId: string, quantity: number) {
  let items = getGuestCart();

  if (quantity <= 0) {
    items = items.filter((item) => item.productId !== productId);
  } else {
    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity = quantity;
    } else {
      items.push({ productId, quantity });
    }
  }

  saveGuestCart(items);
  return items;
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}
