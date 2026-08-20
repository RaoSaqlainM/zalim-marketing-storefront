import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startLogin } from "@/const";
import { formatCurrency } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation } from "wouter";

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [, setLocation] = useLocation();
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const input = useMemo(() => ({ query: term }), [term]);
  const suggestions = trpc.catalog.suggestions.useQuery(input, { enabled: term.trim().length >= 2 });
  const items = suggestions.data || [];
  const choose = (index: number) => {
    const item = items[index];
    if (!item) return;
    setLocation(`/products/${item.slug}`);
    setTerm("");
    setIsOpen(false);
    setActiveIndex(-1);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (activeIndex >= 0) return choose(activeIndex);
    if (term.trim()) {
      setLocation(`/search?q=${encodeURIComponent(term.trim())}`);
      setTerm("");
      setIsOpen(false);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !items.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(current => Math.min(current + 1, items.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(current => Math.max(current - 1, 0));
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    }
  };

  return (
    <form className={`relative ${mobile ? "w-full" : "hidden w-[18rem] min-[980px]:block"}`} onSubmit={submit}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input ref={inputRef} value={term} onFocus={() => term.trim().length >= 2 && setIsOpen(true)} onChange={event => { setTerm(event.target.value); setIsOpen(true); setActiveIndex(-1); }} onKeyDown={onKeyDown} placeholder="Search the marketplace" className="h-10 rounded-full border-border/80 bg-secondary/50 pl-9 pr-4 text-sm shadow-none focus-visible:ring-primary/30" role="combobox" aria-label="Search products" aria-autocomplete="list" aria-expanded={isOpen && term.trim().length >= 2} aria-controls="zalim-search-suggestions" aria-activedescendant={activeIndex >= 0 ? `zalim-search-option-${items[activeIndex]?.id}` : undefined} />
      {isOpen && term.trim().length >= 2 && (
        <div id="zalim-search-suggestions" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background p-1 shadow-2xl">
          {suggestions.isLoading && <p className="px-3 py-3 text-sm text-muted-foreground">Finding useful options…</p>}
          {!suggestions.isLoading && !suggestions.data?.length && <p className="px-3 py-3 text-sm text-muted-foreground">No matching products yet.</p>}
          {items.map((item, index) => (
            <button id={`zalim-search-option-${item.id}`} key={item.id} role="option" aria-selected={activeIndex === index} type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(index)} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${activeIndex === index ? "bg-secondary" : "hover:bg-secondary"}`}>
              <img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(item.price)}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

function SiteMotion() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 260);
    const updateProgress = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);
  return <><div aria-hidden="true" className="site-scroll-progress"><span style={{ transform: `scaleX(${progress})` }} /></div><div aria-hidden="true" className={`site-intro ${ready ? "site-intro--ready" : ""}`}><div className="site-intro__mark"><span className="roadmark roadmark-light"><i /><i /><i /></span><b>ZALIM</b><em>MARKETING</em></div></div></>;
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const count = cart.data?.itemCount ?? 0;
  const isAdmin = user?.role === "admin";
  const navigate = (path: string) => { setLocation(path); setMobileOpen(false); };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteMotion />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="border-b border-primary/10 bg-[#111722] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4f0e7]">Free standard delivery on orders over PKR 5,000</div>
      <header className="sticky top-0 z-40 border-b border-border/75 bg-background/95 backdrop-blur-xl">
        <div className="container flex h-[4.75rem] items-center justify-between gap-4">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border min-[980px]:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <Link href="/" className="group relative flex shrink-0 items-center gap-1.5 text-[1.08rem] font-extrabold tracking-[-0.065em] text-[#151c29]"><span className="roadmark" aria-hidden="true"><i /><i /><i /></span><span>ZALIM<span className="ml-1 text-[0.52em] tracking-[0.12em] text-primary">MARKETING</span></span></Link>
          <nav className="hidden items-center gap-6 min-[980px]:flex">
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/vehicle-finder" className="nav-link">Vehicle finder</Link>
            <Link href="/collections/car-care" className="nav-link">Care</Link>
            <Link href="/collections/cabin-comfort" className="nav-link">Interior</Link>
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
          <div className="mb-9 flex items-center justify-between"><p className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight"><span className="roadmark" aria-hidden="true"><i /><i /><i /></span>ZALIM<span className="text-primary">MARKETING</span></p><button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
          <SearchBar mobile />
          <nav className="mt-7 grid gap-1">
            {[['Shop all', '/shop'], ['Vehicle finder', '/vehicle-finder'], ['Car care', '/collections/car-care'], ['Interior', '/collections/cabin-comfort'], ['Roadside utility', '/collections/roadside-utility'], ['Brands', '/brands'], ['Our story', '/about']].map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="rounded-xl px-3 py-3 text-left text-base font-semibold transition hover:bg-secondary">{label}</button>)}
          </nav>
          <div className="mt-8 border-t pt-6"><Button className="w-full rounded-full" onClick={() => isAuthenticated ? navigate("/account") : startLogin()}>{user ? "Your account" : "Sign in"}</Button></div>
        </div>
      </div>}
      <main id="main-content" className={location === "/admin" && isAdmin ? "admin-context-active" : undefined}>
        {location === "/admin" && isAdmin && <section className="zalim-admin-context border-b border-border bg-secondary/30"><div className="container py-9 sm:py-12"><p className="eyebrow">Zalim Marketing · Saqlain Mushtaq</p><h1 className="mt-2 font-display text-5xl font-bold leading-[.98] tracking-[-.06em] text-[#111722] sm:text-6xl">Zalim control room</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">A protected workspace for Saqlain Mushtaq to shape the Zalim Marketing catalog, stock and order journey.</p></div></section>}
        <div key={location} className="route-stage">{children}</div>
      </main>
      <footer className="mt-20 border-t border-white/10 bg-[#111722] text-[#f7f5f0]">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div><p className="flex items-center gap-1.5 text-xl font-extrabold tracking-[-0.06em]"><span className="roadmark roadmark-light" aria-hidden="true"><i /><i /><i /></span>ZALIM<span className="text-[#c6a368]">MARKETING</span></p><p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Original automotive essentials arranged around the way real people drive, care for and use their vehicles.</p></div>
          <div><p className="footer-title">Explore</p><div className="footer-links"><Link href="/shop">Shop all</Link><Link href="/vehicle-finder">Vehicle finder</Link><Link href="/collections/car-care">Car care</Link><Link href="/brands">Brands</Link></div></div>
          <div><p className="footer-title">Store help</p><div className="footer-links"><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/about">About Zalim</Link></div></div>
          <div><p className="footer-title">Independently owned</p><p className="text-sm leading-6 text-slate-300">Zalim Marketing is led by Saqlain Mushtaq. Payment options will appear once the store’s secure provider connection is enabled.</p></div>
        </div>
        <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>Zalim Marketing · Saqlain Mushtaq</span><span>Road-ready essentials, without the clutter.</span></div></div>
      </footer>
    </div>
  );
}
