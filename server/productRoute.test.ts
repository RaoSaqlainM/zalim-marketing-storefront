import { describe, expect, it } from "vitest";
import { productSlugFromLocation } from "../client/src/lib/productRoute";

describe("productSlugFromLocation", () => {
  it("removes preview query parameters before reading a product slug", () => {
    expect(productSlugFromLocation("/products/clearline-screenwash-concentrate?from_webdev=1")).toBe("clearline-screenwash-concentrate");
  });

  it("ignores a hash fragment on a product route", () => {
    expect(productSlugFromLocation("/products/clearline-screenwash-concentrate#reviews")).toBe("clearline-screenwash-concentrate");
  });
});
