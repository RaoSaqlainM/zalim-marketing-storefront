import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ProductCard({ product, list = false }: { product: StoreProduct; compact?: boolean; list?: boolean }) {
  const { isAuthenticated } = useAuth();
  const [added, setAdded] = useState(false);
  const utils = trpc.useUtils();
  const add = trpc.cart.add.useMutation({ onSuccess: () => { utils.cart.get.invalidate(); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }, onError: error => toast.error(error.message) });
  const sale = discountedPercent(product);
  const addToCart = () => {
    if (!isAuthenticated) return startLogin();
    add.mutate({ productId: product.id, quantity: 1 });
  };
  return <article className={`group border border-slate-200 bg-white p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#c8ad70] hover:shadow-[0_14px_28px_-22px_rgba(15,23,42,.55)] ${list ? "flex items-stretch gap-4" : ""}`}><Link href={`/products/${product.slug}`} className={`relative block overflow-hidden bg-[#f3f0e8] ${list ? "w-32 shrink-0 sm:w-44" : ""}`}><img src={productImage(product)} alt={product.name} loading="lazy" decoding="async" className={`lazy-media ${list ? "aspect-square" : "aspect-[.92]"} w-full object-cover transition duration-500 group-hover:scale-[1.025]`} /><div className="absolute left-2 top-2 flex gap-1.5">{product.isNew && <span className="bg-slate-950 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white">New</span>}{sale && <span className="bg-[#e5c266] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#594315]">-{sale}%</span>}</div></Link><div className={`px-1 pb-1 pt-3 ${list ? "flex min-w-0 flex-1 flex-col justify-center pr-2" : ""}`}><div className="mb-1 flex items-center justify-between gap-2"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">{product.brand?.name || "Zalim selection"}</p><span className="text-[9px] font-bold text-slate-400">{product.sku}</span></div><Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-bold leading-5 tracking-[-0.01em] text-slate-950 hover:text-[#8a601d]">{product.name}</Link><div className="mt-3 flex items-center justify-between gap-2"><div><span className="text-sm font-extrabold text-slate-950">{formatCurrency(product.price)}</span>{product.compareAtPrice && <span className="ml-1.5 text-xs text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}</div><Button size="icon" className="h-8 w-8 rounded-none bg-[#b88d3c] text-white hover:bg-slate-950" disabled={add.isPending || product.stockQuantity < 1} onClick={addToCart} aria-label={`Add ${product.name} to basket`}>{add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</Button></div></div></article>;
}
