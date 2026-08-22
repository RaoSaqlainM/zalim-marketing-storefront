import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

function ProductVisualFallback({ sku }: { sku: string }) {
  return <span aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[linear-gradient(145deg,#14233b_0%,#0d1728_58%,#a77a2a_180%)] p-4 text-white"><span className="absolute -right-6 -top-6 h-36 w-36 rounded-full border border-[#dfc47e]/35" /><span className="absolute right-7 top-7 h-16 w-16 rounded-full border border-white/20" /><span className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#dfc47e]/35" /><span className="relative flex h-full flex-col justify-between"><span className="w-fit border border-[#dfc47e]/50 px-2 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#f1d485]">Zalim selection</span><span><span className="block text-[10px] font-bold uppercase tracking-[.17em] text-[#f1d485]">Garage standard</span><span className="mt-2 block font-display text-3xl font-bold leading-none tracking-[-.05em]">Road-ready</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.15em] text-slate-300">{sku}</span></span></span></span>;
}

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
  return <article className={`group relative border border-slate-200 bg-white p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#c8ad70] hover:shadow-[0_20px_38px_-28px_rgba(15,23,42,.65)] ${list ? "flex items-stretch gap-4" : ""}`}>
    <Link href={`/products/${product.slug}`} className={`relative block overflow-hidden bg-[#f3f0e8] ${list ? "w-32 shrink-0 sm:w-44" : ""}`}>
      <ProductVisualFallback sku={product.sku} />
      <img src={productImage(product)} alt={product.name} loading="lazy" decoding="async" onError={event => { event.currentTarget.style.display = "none"; }} className={`lazy-media relative ${list ? "aspect-square" : "aspect-[.93]"} w-full object-cover transition duration-500 group-hover:scale-[1.035]`} />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2"><div className="flex gap-1.5">{product.isNew && <span className="bg-slate-950 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white">New in</span>}{sale && <span className="bg-[#e5c266] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#594315]">-{sale}%</span>}</div><span className="grid h-7 w-7 place-items-center bg-white/90 text-[#6d4e17] opacity-0 transition group-hover:opacity-100"><ArrowUpRight className="h-3.5 w-3.5" /></span></div>
    </Link>
    <div className={`px-1 pb-1 pt-3 ${list ? "flex min-w-0 flex-1 flex-col justify-center pr-2" : ""}`}><div className="mb-1 flex items-center justify-between gap-2"><p className="truncate text-[9px] font-bold uppercase tracking-[.14em] text-[#8a6726]">{product.brand?.name || "Zalim selection"}</p><span className="text-[9px] font-bold text-slate-400">{product.sku}</span></div><Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-bold leading-5 tracking-[-0.01em] text-slate-950 hover:text-[#8a601d]">{product.name}</Link>{!list && <p className="mt-2 truncate text-[10px] font-medium text-slate-500">{product.category?.name || "Automotive essential"}</p>}<div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><div><span className="text-sm font-extrabold text-slate-950">{formatCurrency(product.price)}</span>{product.compareAtPrice && <span className="ml-1.5 text-xs text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}</div><Button size="icon" className="h-8 w-8 rounded-none bg-[#b88d3c] text-white hover:bg-slate-950" disabled={add.isPending || product.stockQuantity < 1} onClick={addToCart} aria-label={`Add ${product.name} to basket`}>{add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</Button></div></div>
  </article>;
}
