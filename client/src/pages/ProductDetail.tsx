import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import StorefrontLayout from "@/components/StorefrontLayout";
import { BackLink, BreadCrumbs, QuantityControl, SectionHeading } from "@/components/CommerceUI";
import { startLogin } from "@/const";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Check, ChevronDown, Loader2, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ProductDetail() {
  const [location] = useLocation();
  const slug = location.split("/").at(-1) || "";
  const productQuery = trpc.catalog.bySlug.useQuery({ slug });
  const featured = trpc.catalog.featured.useQuery();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const add = trpc.cart.add.useMutation({ onSuccess: () => { utils.cart.get.invalidate(); toast.success("Added to your bag."); }, onError: error => toast.error(error.message) });
  if (productQuery.isLoading) return <StorefrontLayout><div className="container py-14"><div className="h-[32rem] animate-pulse rounded-[2rem] bg-secondary" /></div></StorefrontLayout>;
  const product = productQuery.data as (StoreProduct & { images: Array<{ id: number; url: string; altText: string | null; position: number }> }) | null;
  if (!product) return <StorefrontLayout><div className="container py-14"><BackLink href="/shop" label="Back to shop" /><p className="page-title">That product has moved on.</p><p className="mt-3 text-muted-foreground">The page you requested is unavailable or no longer part of the collection.</p></div></StorefrontLayout>;
  const gallery = product.images?.length ? product.images.map(image => image.url) : [productImage(product)];
  const sale = discountedPercent(product);
  return <StorefrontLayout><div className="container py-8 sm:py-12"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, ...(product.category ? [{ label: product.category.name, href: `/collections/${product.category.slug}` }] : []), { label: product.name }]} /><div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(24rem,.88fr)] lg:gap-14"><div className="grid gap-3 sm:grid-cols-[5.5rem_1fr]"><div className="order-2 flex gap-2 sm:order-1 sm:flex-col">{gallery.map((image, index) => <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} className={`overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-primary" : "border-transparent"}`}><img src={image} alt="" className="aspect-square w-16 object-cover sm:w-full" /></button>)}</div><div className="order-1 overflow-hidden rounded-[1.75rem] bg-secondary sm:order-2"><img src={gallery[activeImage]} alt={product.name} className="aspect-[.94] w-full object-cover" /></div></div><div className="lg:pt-2"><p className="eyebrow">{product.brand?.name || "AutoGear Select"}</p><h1 className="mt-2 font-display text-4xl font-bold leading-[1.02] tracking-[-.055em] sm:text-5xl">{product.name}</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p><div className="mt-6 flex items-end gap-3"><span className="text-2xl font-extrabold tracking-tight">{formatCurrency(product.price)}</span>{product.compareAtPrice && <span className="mb-0.5 text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}{sale && <span className="mb-0.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">Save {sale}%</span>}</div><div className="mt-6 flex items-center gap-2 text-sm font-semibold">{product.stockQuantity > 0 ? <><span className="h-2 w-2 rounded-full bg-emerald-500" />In stock — ready to dispatch</> : <><span className="h-2 w-2 rounded-full bg-destructive" />Currently unavailable</>}</div><div className="mt-7 flex flex-wrap gap-3"><QuantityControl value={quantity} max={Math.max(1, product.stockQuantity)} onChange={setQuantity} /><Button className="h-10 min-w-48 flex-1 rounded-full" disabled={product.stockQuantity < 1 || add.isPending} onClick={() => isAuthenticated ? add.mutate({ productId: product.id, quantity }) : startLogin()}>{add.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageCheck className="mr-2 h-4 w-4" />}{product.stockQuantity < 1 ? "Out of stock" : "Add to bag"}</Button></div><div className="mt-8 grid gap-3 border-y border-border py-5 sm:grid-cols-3">{[[Truck, "Thoughtful delivery", "Calculated at checkout"], [ShieldCheck, "Secure payment", "Stripe protected"], [Check, "Clear returns", "Simple support"]].map(([Icon, title, text]) => { const IconComponent = Icon as typeof Truck; return <div className="flex gap-2.5" key={title as string}><IconComponent className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs font-bold">{title as string}</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{text as string}</p></div></div>; })}</div><div className="border-b border-border"><button className="flex w-full items-center justify-between py-5 text-left font-bold" onClick={() => setDescriptionOpen(!descriptionOpen)}>The detail <ChevronDown className={`h-4 w-4 transition ${descriptionOpen ? "rotate-180" : ""}`} /></button>{descriptionOpen && <p className="pb-5 text-sm leading-7 text-muted-foreground">{product.description}</p>}</div><div className="border-b border-border"><p className="py-5 font-bold">Specifications</p><dl className="grid grid-cols-2 gap-x-6 gap-y-3 pb-6 text-sm">{Object.entries(product.specifications || {}).map(([key, value]) => <div className="border-b border-border/70 pb-2" key={key}><dt className="text-xs text-muted-foreground">{key}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl></div></div></div>
    <section className="mt-20"><SectionHeading eyebrow="Complete the edit" title="You may also like" action={{ label: "See all", href: "/shop" }} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{((featured.data || []) as StoreProduct[]).filter(item => item.id !== product.id).slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div></section>
  </div></StorefrontLayout>;
}
