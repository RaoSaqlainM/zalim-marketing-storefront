import type { StoreProduct } from "@/lib/store";

export type OilQuality = "all" | "fully-synthetic" | "performance-synthetic" | "hybrid-economy";
export type OilPackSize = "all" | "1L" | "4L" | "5L";
export type OilPriceBand = "all" | "under-40" | "40-to-60" | "over-60";
export type OilSort = "recommended" | "quality" | "pack-size" | "price-low" | "price-high";

export type OilFilters = {
  quality: OilQuality;
  packSize: OilPackSize;
  priceBand: OilPriceBand;
  sort: OilSort;
};

export const defaultOilFilters: OilFilters = { quality: "all", packSize: "all", priceBand: "all", sort: "recommended" };

function productText(product: StoreProduct) {
  return `${product.name} ${product.shortDescription || ""} ${product.description || ""} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
}

export function oilQuality(product: StoreProduct): Exclude<OilQuality, "all"> {
  const text = productText(product);
  if (text.includes("hybrid") || text.includes("economy")) return "hybrid-economy";
  if (text.includes("performance") || text.includes("5w-40")) return "performance-synthetic";
  return "fully-synthetic";
}

export function oilPackSize(product: StoreProduct): Exclude<OilPackSize, "all"> {
  const text = productText(product);
  if (text.includes("5l") || text.includes("5 l")) return "5L";
  if (text.includes("4l") || text.includes("4 l")) return "4L";
  return "1L";
}

function oilPrice(product: StoreProduct) {
  return Number(product.price);
}

function matchesPriceBand(product: StoreProduct, priceBand: OilPriceBand) {
  const price = oilPrice(product);
  if (priceBand === "under-40") return price < 40;
  if (priceBand === "40-to-60") return price >= 40 && price <= 60;
  if (priceBand === "over-60") return price > 60;
  return true;
}

const qualityRank = { "fully-synthetic": 0, "performance-synthetic": 1, "hybrid-economy": 2 };
const packRank = { "1L": 0, "4L": 1, "5L": 2 };

export function filterAndSortMotorOils(products: StoreProduct[], filters: OilFilters) {
  const filtered = products.filter(product => (filters.quality === "all" || oilQuality(product) === filters.quality) && (filters.packSize === "all" || oilPackSize(product) === filters.packSize) && matchesPriceBand(product, filters.priceBand));
  return filtered.sort((left, right) => {
    if (filters.sort === "price-low") return oilPrice(left) - oilPrice(right);
    if (filters.sort === "price-high") return oilPrice(right) - oilPrice(left);
    if (filters.sort === "quality") return qualityRank[oilQuality(left)] - qualityRank[oilQuality(right)] || oilPrice(left) - oilPrice(right);
    if (filters.sort === "pack-size") return packRank[oilPackSize(left)] - packRank[oilPackSize(right)] || oilPrice(left) - oilPrice(right);
    return 0;
  });
}
