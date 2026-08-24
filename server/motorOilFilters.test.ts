import { describe, expect, it } from "vitest";
import { filterAndSortMotorOils, oilPackSize, oilQuality } from "../client/src/lib/motorOilFilters";

const oils: any[] = [
  { id: 1, name: "Meridian 5W-30 Fully Synthetic Engine Oil 5L", price: "49", shortDescription: "", description: "", specifications: {} },
  { id: 2, name: "Meridian 5W-40 Performance Engine Oil 4L", price: "63", shortDescription: "", description: "", specifications: {} },
  { id: 3, name: "Meridian 0W-20 Hybrid & Economy Engine Oil 1L", price: "18", shortDescription: "", description: "", specifications: {} },
];

describe("motor oil filters", () => {
  it("derives quality and pack size from original catalogue information", () => {
    expect(oilQuality(oils[1])).toBe("performance-synthetic");
    expect(oilPackSize(oils[2])).toBe("1L");
  });

  it("filters by pack size and sorts by price", () => {
    expect(filterAndSortMotorOils(oils, { quality: "all", packSize: "5L", priceBand: "all", sort: "recommended" }).map(product => product.id)).toEqual([1]);
    expect(filterAndSortMotorOils(oils, { quality: "all", packSize: "all", priceBand: "all", sort: "price-high" }).map(product => product.id)).toEqual([2, 1, 3]);
  });
});
