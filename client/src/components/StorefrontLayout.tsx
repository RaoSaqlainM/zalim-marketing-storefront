import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useMemo, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/store";

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [, setLocation] = useLocation();
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const input = useMemo(() => ({ query: term }), [term]);
  const suggestions = trpc.catalog.suggestions.useQuery(input, { enabled: term.trim().length >= 2 });
  const items = suggestions.data || [];
  const choose = (index: number) => { const item = items[index]; if (!item) return; setLocation(`/products/${item.slug}`); setTerm(""); setIsOpen(false); setActiveIndex(-1); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeIndex >= 0) return choose(activeIndex);
    if (term.trim()) {
      setLocation(`/search?q=${encodeURIComponent(term.trim())}`);
      setTerm("");
      setIsOpen(false);
    }
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !items.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex(current => Math.min(current + 1, items.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex(current => Math.max(current - 1, 0)); }
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); setActiveIndex(-1); inputRef.current?.focus(); }
  };

  return (
    <form className={`relative ${mobile ? "w-full" : "hidden min-[980px]:block w-[18rem]"}`} onSubmit={submit}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input ref={inputRef} value={term} onFocus={() => term.trim().length >= 2 && setIsOpen(true)} onChange={event => { setTerm(event.target.value); setIsOpen(true); setActiveIndex(-1); }} onKeyDown={onKeyDown} placeholder="Search the collection" className="h-10 rounded-full border-border/80 bg-secondary/50 pl-9 pr-4 text-sm shadow-none focus-visible:ring-primary/30" role="combobox" aria-label="Search products" aria-autocomplete="list" aria-expanded={isOpen && term.trim().length >= 2} aria-controls="autogear-search-suggestions" aria-activedescendant={activeIndex >= 0 ? `autogear-search-option-${items[activeIndex]?.id}` : undefined} />
      {isOpen && term.trim().length >= 2 && (
        <div id="autogear-search-suggestions" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background p-1 shadow-2xl">
          {suggestions.isLoading && <p className="px-3 py-3 text-sm text-muted-foreground">Finding considered options…</p>}
          {!suggestions.isLoading && !suggestions.data?.length && <p className="px-3 py-3 text-sm text-muted-foreground">No matching products yet.</p>}
          {items.map((item, index) => (
            <button id={`autogear-search-option-${item.id}`} key={item.id} role="option" aria-selected={activeIndex === index} type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(index)} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${activeIndex === index ? "bg-secondary" : "hover:bg-secondary"}`}>
              <img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(item.price)}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const count = cart.data?.itemCount ?? 0;
  const navigate = (path: string) => { setLocation(path); setMobileOpen(false); };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="border-b border-primary/10 bg-[#111722] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4f0e7]">Complimentary standard delivery on orders over PKR 5,000</div>
      <header className="sticky top-0 z-40 border-b border-border/75 bg-background/95 backdrop-blur-xl">
        <div className="container flex h-[4.75rem] items-center justify-between gap-4">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border min-[980px]:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <Link href="/" className="group relative flex shrink-0 items-center gap-1.5 text-[1.08rem] font-extrabold tracking-[-0.065em] text-[#151c29]"><span className="roadmark" aria-hidden="true"><i /><i /><i /></span><span>AUTO<span className="text-primary">GEAR</span><span className="ml-1 text-[0.52em] tracking-[0.12em] text-muted-foreground">MARKET</span></span></Link>
          <nav className="hidden items-center gap-6 min-[980px]:flex">
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/collections/car-care" className="nav-link">Car Care</Link>
            <Link href="/collections/cabin-comfort" className="nav-link">Cabin</Link>
            <Link href="/collections/roadside-utility" className="nav-link">Utility</Link>
            <Link href="/brands" className="nav-link">Brands</Link>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <SearchBar />
            <button className="icon-button min-[980px]:hidden" onClick={() => navigate("/search")} aria-label="Search"><Search className="h-[18px] w-[18px]" /></button>
            <button className="icon-button" onClick={() => isAuthenticated ? navigate("/account") : startLogin()} aria-label="Account"><UserRound className="h-[18px] w-[18px]" /></button>
            <button className="icon-button relative" onClick={() => navigate("/cart")} aria-label={`Shopping bag, ${count} items`}><ShoppingBag className="h-[18px] w-[18px]" />{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{count}</span>}</button>
          </div>
        </div>
      </header>
      {mobileOpen && <div className="fixed inset-0 z-[60] bg-[#151c29]/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)}>
        <div className="h-full w-[min(23rem,88vw)] bg-background p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
          <div className="mb-9 flex items-center justify-between"><p className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight"><span className="roadmark" aria-hidden="true"><i /><i /><i /></span>AUTO<span className="text-primary">GEAR</span></p><button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
          <SearchBar mobile />
          <nav className="mt-7 grid gap-1">
            {[['Shop all', '/shop'], ['Car care', '/collections/car-care'], ['Cabin & comfort', '/collections/cabin-comfort'], ['Roadside utility', '/collections/roadside-utility'], ['Brands', '/brands'], ['Our story', '/about']].map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="rounded-xl px-3 py-3 text-left text-base font-semibold transition hover:bg-secondary">{label}</button>)}
          </nav>
          <div className="mt-8 border-t pt-6"><Button className="w-full rounded-full" onClick={() => isAuthenticated ? navigate("/account") : startLogin()}>{user ? "Your account" : "Sign in"}</Button></div>
        </div>
      </div>}
      <main>{children}</main>
      <footer className="mt-20 border-t border-white/10 bg-[#111722] text-[#f7f5f0]">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div><p className="flex items-center gap-1.5 text-xl font-extrabold tracking-[-0.06em]"><span className="roadmark roadmark-light" aria-hidden="true"><i /><i /><i /></span>AUTO<span className="text-[#c6a368]">GEAR</span></p><p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">A measured collection of tools, details and road-ready essentials for better journeys.</p></div>
          <div><p className="footer-title">Explore</p><div className="footer-links"><Link href="/shop">Shop all</Link><Link href="/collections/car-care">Car care</Link><Link href="/collections/cabin-comfort">Cabin & comfort</Link><Link href="/brands">Brands</Link></div></div>
          <div><p className="footer-title">Support</p><div className="footer-links"><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link></div></div>
          <div><p className="footer-title">A considered drive</p><p className="text-sm leading-6 text-slate-300">Product notes, practical advice and thoughtful offers, delivered occasionally.</p><div className="mt-4 flex"><Input placeholder="Your email" className="h-10 rounded-r-none border-0 bg-white/10 text-white placeholder:text-slate-400" /><Button className="h-10 rounded-l-none bg-[#c6a368] px-4 text-[#111722] hover:bg-[#d8b87c]">Join</Button></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>© 2026 AutoGear Market. Original catalog experience.</span><span>Secure checkout powered by Stripe when configured.</span></div></div>
      </footer>
    </div>
  );
}
