import { describe, expect, it } from "vitest";
import { distinctSpecificationProducts, isMotorOilProduct } from "../client/src/lib/productOptions";

const oil = {
  id: 1,
  name: "Meridian 5W-30 Fully Synthetic Engine Oil",
  slug: "meridian-5w-30-fully-synthetic-engine-oil",
  category: { slug: "fluids-maintenance" },
  specifications: { Grade: "5W-30", Volume: "5 litres", Quality: "Fully synthetic" },
};

describe("motor-oil product options", () => {
  it("identifies oils in the fluids and maintenance department", () => {
    expect(isMotorOilProduct(oil as never)).toBe(true);
    expect(isMotorOilProduct({ ...oil, name: "Meridian Long-Life Coolant" } as never)).toBe(false);
  });

  it("keeps the current product when a grade is available in more than one pack size", () => {
    const choices = distinctSpecificationProducts([
      { ...oil, id: 2, slug: "meridian-5w-30-top-up-oil", specifications: { Grade: "5W-30", Volume: "1 litre" } },
      oil,
      { ...oil, id: 3, slug: "meridian-0w-20-engine-oil", specifications: { Grade: "0W-20", Volume: "5 litres" } },
    ], "Grade", oil.slug);

    expect(choices).toEqual([
      { value: "5W-30", product: oil },
      { value: "0W-20", product: expect.objectContaining({ slug: "meridian-0w-20-engine-oil" }) },
    ]);
  });
});
