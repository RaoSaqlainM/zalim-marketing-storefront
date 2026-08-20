import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { EmptyState, QuantityControl } from "@/components/CommerceUI";
import { startLogin } from "@/const";
import { formatCurrency } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.cart.update.useMutation({ onSuccess: () => utils.cart.get.invalidate(), onError: error => toast.error(error.message) });
  const remove = trpc.cart.remove.useMutation({ onSuccess: () => utils.cart.get.invalidate(), onError: error => toast.error(error.message) });
  if (!isAuthenticated) return <StorefrontLayout><div className="container py-16"><EmptyState title="Your bag is waiting." text="Sign in to keep your selection together and move through checkout securely." action={{ label: "Sign in to shop", href: "/account" }} /><Button className="sr-only" onClick={startLogin}>Sign in</Button></div></StorefrontLayout>;
  if (cart.isLoading) return <StorefrontLayout><div className="container py-14"><div className="h-64 animate-pulse rounded-[1.5rem] bg-secondary" /></div></StorefrontLayout>;
  const items = cart.data?.items || [];
  const shipping = cart.data && cart.data.subtotal < 5000 ? 350 : 0;
  return <StorefrontLayout><div className="container py-10 sm:py-14"><p className="eyebrow">Your selection</p><h1 className="page-title">Shopping bag</h1>{!items.length ? <div className="mt-8"><EmptyState title="Your bag is currently empty." text="Explore the collection and add the pieces that belong on your next drive." action={{ label: "Explore products", href: "/shop" }} /></div> : <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_22rem]">{<div className="divide-y divide-border rounded-[1.5rem] border border-border bg-card px-5 sm:px-6">{items.map(item => <div className="flex gap-4 py-5" key={item.id}><Link href={`/products/${item.slug}`}><img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" className="h-24 w-20 rounded-xl object-cover sm:h-28 sm:w-24" /></Link><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">{item.sku}</p><Link href={`/products/${item.slug}`} className="mt-1 block max-w-sm font-bold tracking-tight hover:text-primary">{item.name}</Link><p className="mt-1.5 text-sm font-semibold">{formatCurrency(item.price)}</p><div className="mt-3 flex items-center justify-between gap-3"><QuantityControl compact value={item.quantity} max={item.stockQuantity} onChange={quantity => update.mutate({ cartItemId: item.id, quantity })} /><button onClick={() => remove.mutate({ cartItemId: item.id })} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" />Remove</button></div></div></div>)}</div>}<aside className="h-fit rounded-[1.5rem] bg-[#151d2b] p-6 text-white lg:sticky lg:top-24"><p className="text-lg font-bold">Order summary</p><div className="mt-6 space-y-3 border-b border-white/15 pb-5 text-sm text-slate-300"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cart.data?.subtotal || 0)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{shipping ? formatCurrency(shipping) : "Complimentary"}</span></div></div><div className="mt-5 flex justify-between text-base font-bold"><span>Total</span><span>{formatCurrency((cart.data?.subtotal || 0) + shipping)}</span></div><p className="mt-3 text-xs leading-5 text-slate-400">Final delivery details and secure payment are confirmed at checkout.</p><Button asChild className="mt-6 w-full rounded-full bg-[#d2ae68] text-[#151d2b] hover:bg-[#e4c583]"><Link href="/checkout">Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Link href="/shop" className="mt-4 block text-center text-xs font-bold text-slate-300 hover:text-white">Continue shopping</Link></aside></div>}</div></StorefrontLayout>;
}
