import { describe, expect, it } from "vitest";
import { clearDirectCheckout, guestBasketSubtotal, mergeGuestBasketItems, readDirectCheckout, saveDirectCheckout, type GuestBasketItem } from "../client/src/lib/guestBasket";

const oil: GuestBasketItem = { productId: 11, slug: "meridian-5w-30", name: "Meridian 5W-30", sku: "MRD-530", price: 42, quantity: 1, imageUrl: null };
const sessionValues = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    sessionStorage: {
      getItem: (key: string) => sessionValues.get(key) ?? null,
      removeItem: (key: string) => sessionValues.delete(key),
      setItem: (key: string, value: string) => sessionValues.set(key, value),
    },
  },
});

describe("guest basket helpers", () => {
  it("combines repeated guest additions without sign-in state", () => {
    expect(mergeGuestBasketItems([oil], { ...oil, quantity: 2 })).toEqual([{ ...oil, quantity: 3 }]);
  });

  it("calculates an itemized browser-local subtotal", () => {
    expect(guestBasketSubtotal([{ ...oil, quantity: 2 }, { ...oil, productId: 12, quantity: 1, price: 18 }])).toBe(102);
  });

  it("keeps a direct checkout selection separate from the saved guest basket", () => {
    clearDirectCheckout();
    saveDirectCheckout({ ...oil, quantity: 2 });
    expect(readDirectCheckout()).toEqual([{ ...oil, quantity: 2 }]);
    clearDirectCheckout();
    expect(readDirectCheckout()).toBeNull();
  });
});
