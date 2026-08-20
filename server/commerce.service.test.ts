import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getDb: vi.fn() }));

import { getDb } from "./db";
import { addCartItem, getCartForUser, listCatalog } from "./commerce";

const mockedGetDb = vi.mocked(getDb);

describe("commerce service safe fallbacks", () => {
  beforeEach(() => mockedGetDb.mockResolvedValue(null));

  it("returns an empty but correctly paged catalog when storage is temporarily unavailable", async () => {
    await expect(listCatalog({ page: 3, pageSize: 18, query: "mount" })).resolves.toEqual({
      products: [], total: 0, page: 1, pageSize: 18,
    });
  });

  it("returns a zero-value cart shape that storefront order summaries can safely render", async () => {
    await expect(getCartForUser(42)).resolves.toEqual({ id: null, items: [], subtotal: 0, itemCount: 0 });
  });

  it("does not silently accept cart mutations when database access is unavailable", async () => {
    await expect(addCartItem(42, 7, 1)).rejects.toThrow("Database is unavailable");
  });

  it("returns the requested page for a combined search, category, brand, price, and sort catalog query", async () => {
    const productRows = [{ id: 9, name: "Atlas mount", slug: "atlas-mount" }];
    const productQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    productQuery.from = vi.fn(() => productQuery);
    productQuery.leftJoin = vi.fn(() => productQuery);
    productQuery.where = vi.fn(() => productQuery);
    productQuery.orderBy = vi.fn(() => productQuery);
    productQuery.limit = vi.fn(() => productQuery);
    productQuery.offset = vi.fn(() => Promise.resolve(productRows));
    const countQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    countQuery.from = vi.fn(() => countQuery);
    countQuery.leftJoin = vi.fn(() => countQuery);
    countQuery.where = vi.fn(() => Promise.resolve([{ count: 1 }]));
    let selectCount = 0;
    mockedGetDb.mockResolvedValue({ select: vi.fn(() => (selectCount++ === 0 ? productQuery : countQuery)) } as never);

    await expect(listCatalog({ query: "mount", categorySlug: "tech-power", brandSlug: "atlas-supply", minPrice: 1000, maxPrice: 10000, sort: "price-desc", page: 2, pageSize: 1 })).resolves.toEqual({ products: productRows, total: 1, page: 2, pageSize: 1 });
    expect(productQuery.limit).toHaveBeenCalledWith(1);
    expect(productQuery.offset).toHaveBeenCalledWith(1);
    expect(productQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(countQuery.where).toHaveBeenCalledTimes(1);
  });

  it("preserves an explicit empty-result response so the storefront can render its no-results state", async () => {
    const productQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    productQuery.from = vi.fn(() => productQuery);
    productQuery.leftJoin = vi.fn(() => productQuery);
    productQuery.where = vi.fn(() => productQuery);
    productQuery.orderBy = vi.fn(() => productQuery);
    productQuery.limit = vi.fn(() => productQuery);
    productQuery.offset = vi.fn(() => Promise.resolve([]));
    const countQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    countQuery.from = vi.fn(() => countQuery);
    countQuery.leftJoin = vi.fn(() => countQuery);
    countQuery.where = vi.fn(() => Promise.resolve([{ count: 0 }]));
    let selectCount = 0;
    mockedGetDb.mockResolvedValue({ select: vi.fn(() => (selectCount++ === 0 ? productQuery : countQuery)) } as never);

    await expect(listCatalog({ query: "unavailable", page: 1, pageSize: 12 })).resolves.toEqual({ products: [], total: 0, page: 1, pageSize: 12 });
  });

  it("returns a matching live product row for a lowercase catalogue search term", async () => {
    const productRows = [{ id: 10, name: "Nova Emergency Beacon Light", slug: "nova-emergency-beacon-light" }];
    const productQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    productQuery.from = vi.fn(() => productQuery);
    productQuery.leftJoin = vi.fn(() => productQuery);
    productQuery.where = vi.fn(() => productQuery);
    productQuery.orderBy = vi.fn(() => productQuery);
    productQuery.limit = vi.fn(() => productQuery);
    productQuery.offset = vi.fn(() => Promise.resolve(productRows));
    const countQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    countQuery.from = vi.fn(() => countQuery);
    countQuery.leftJoin = vi.fn(() => countQuery);
    countQuery.where = vi.fn(() => Promise.resolve([{ count: 1 }]));
    let selectCount = 0;
    mockedGetDb.mockResolvedValue({ select: vi.fn(() => (selectCount++ === 0 ? productQuery : countQuery)) } as never);

    await expect(listCatalog({ query: "beacon" })).resolves.toMatchObject({ products: productRows, total: 1 });
  });

  it.each(["featured", "newest", "price-asc", "price-desc", "name"] as const)("accepts the %s catalog sort mode and runs a single ordered product query", async sort => {
    const productQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    productQuery.from = vi.fn(() => productQuery);
    productQuery.leftJoin = vi.fn(() => productQuery);
    productQuery.where = vi.fn(() => productQuery);
    productQuery.orderBy = vi.fn(() => productQuery);
    productQuery.limit = vi.fn(() => productQuery);
    productQuery.offset = vi.fn(() => Promise.resolve([]));
    const countQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    countQuery.from = vi.fn(() => countQuery);
    countQuery.leftJoin = vi.fn(() => countQuery);
    countQuery.where = vi.fn(() => Promise.resolve([{ count: 0 }]));
    let selectCount = 0;
    mockedGetDb.mockResolvedValue({ select: vi.fn(() => (selectCount++ === 0 ? productQuery : countQuery)) } as never);

    await expect(listCatalog({ sort })).resolves.toMatchObject({ products: [], total: 0, page: 1, pageSize: 12 });
    expect(productQuery.orderBy).toHaveBeenCalledTimes(1);
  });
});
