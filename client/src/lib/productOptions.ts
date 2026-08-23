import type { StoreProduct } from "@/lib/store";

type ProductOptionSource = Pick<StoreProduct, "id" | "name" | "slug" | "specifications">;

export function isMotorOilProduct(product: Pick<StoreProduct, "name" | "category"> | null | undefined) {
  return product?.category?.slug === "fluids-maintenance" && product.name.toLowerCase().includes("oil");
}

export function distinctSpecificationProducts(products: ProductOptionSource[], specification: string, currentSlug: string) {
  const choices = new Map<string, ProductOptionSource>();
  for (const product of products) {
    const value = product.specifications?.[specification];
    if (!value) continue;
    const current = choices.get(value);
    if (!current || product.slug === currentSlug) choices.set(value, product);
  }
  return Array.from(choices.entries()).map(([value, product]) => ({ value, product }));
}
