export type GuestBasketItem = {
  imageUrl: string | null;
  name: string;
  price: number;
  productId: number;
  quantity: number;
  sku: string;
  slug: string;
};

const guestBasketKey = "zalim-marketing-guest-basket";
export const guestBasketChangedEvent = "zalim-marketing-guest-basket-changed";

export function mergeGuestBasketItems(items: GuestBasketItem[], incoming: GuestBasketItem) {
  const existing = items.find(item => item.productId === incoming.productId);
  if (!existing) return [...items, incoming];
  return items.map(item => item.productId === incoming.productId ? { ...item, quantity: item.quantity + incoming.quantity } : item);
}

export function guestBasketSubtotal(items: GuestBasketItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function emitGuestBasketChange() {
  window.dispatchEvent(new Event(guestBasketChangedEvent));
}

export function readGuestBasket(): GuestBasketItem[] {
  try {
    const stored = window.localStorage.getItem(guestBasketKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as GuestBasketItem[];
    return Array.isArray(parsed) ? parsed.filter(item => item && item.productId && item.quantity > 0) : [];
  }
  catch {
    return [];
  }
}

export function saveGuestBasket(items: GuestBasketItem[]) {
  window.localStorage.setItem(guestBasketKey, JSON.stringify(items));
  emitGuestBasketChange();
}

export function addGuestBasketItem(incoming: GuestBasketItem) {
  const next = mergeGuestBasketItems(readGuestBasket(), incoming);
  saveGuestBasket(next);
  return next;
}

export function updateGuestBasketQuantity(productId: number, quantity: number) {
  const next = readGuestBasket().map(item => item.productId === productId ? { ...item, quantity } : item).filter(item => item.quantity > 0);
  saveGuestBasket(next);
  return next;
}

export function removeGuestBasketItem(productId: number) {
  const next = readGuestBasket().filter(item => item.productId !== productId);
  saveGuestBasket(next);
  return next;
}

export function clearGuestBasket() {
  saveGuestBasket([]);
}
