import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ProductCard({ product, compact = false, list = false }: { product: StoreProduct; compact?: boolean; list?: boolean }) {
  const { isAuthenticated } = useAuth();
  const [added, setAdded] = useState(false);
  const utils = trpc.useUtils();
  const add = trpc.cart.add.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); setAdded(true); window.setTimeout(() => setAdded(false), 1800); },
    onError: error => toast.error(error.message),
  });
  const sale = discountedPercent(product);
  const addToCart = () => {
    if (!isAuthenticated) return startLogin();
    add.mutate({ productId: product.id, quantity: 1 });
  };
  return (
    <article className={`group rounded-[1.35rem] border border-border/70 bg-card p-2.5 shadow-[0_10px_28px_-23px_rgba(15,23,42,.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_-23px_rgba(15,23,42,.5)] ${list ? "flex items-stretch gap-4" : ""} ${compact ? "" : ""}`}>
      <Link href={`/products/${product.slug}`} className={`relative block overflow-hidden rounded-[1rem] bg-secondary ${list ? "w-32 shrink-0 sm:w-44" : ""}`}><img src={productImage(product)} alt={product.name} loading="lazy" decoding="async" className={`lazy-media ${list ? "aspect-square" : "aspect-[.92]"} w-full object-cover transition duration-500 group-hover:scale-[1.035]`} />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">{product.isNew && <span className="badge">New</span>}{sale && <span className="badge badge-gold">-{sale}%</span>}</div>
      </Link>
      <div className={`px-1 pb-1 pt-3 ${list ? "flex min-w-0 flex-1 flex-col justify-center pr-2" : ""}`}>
        <div className="mb-1 flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{product.brand?.name || "Zalim Select"}</p><span className="spec-chip">{product.sku}</span></div>
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-bold leading-5 tracking-[-0.01em] hover:text-primary">{product.name}</Link>
        <div className="mt-3 flex items-center justify-between gap-2"><div><span className="text-sm font-extrabold">{formatCurrency(product.price)}</span>{product.compareAtPrice && <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>}</div><Button size="icon" className="h-8 w-8 rounded-full" disabled={add.isPending || product.stockQuantity < 1} onClick={addToCart} aria-label={`Add ${product.name} to cart`}>{add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</Button></div>
      </div>
    </article>
  );
}
