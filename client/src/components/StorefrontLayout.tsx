import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startLogin } from "@/const";
import { formatCurrency } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ChevronRight, Mail, Menu, MessageCircle, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation } from "wouter";

const menuLinks = [
  ["Shop all", "/shop"],
  ["Shop by vehicle", "/vehicle-finder"],
  ["Car care", "/collections/car-care"],
  ["Interior", "/collections/cabin-comfort"],
  ["Lighting & tech", "/collections/tech-power"],
  ["Utility & touring", "/collections/roadside-utility"],
  ["Brands", "/brands"],
] as const;

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brand-mark ${inverse ? "brand-mark--inverse" : ""}`} aria-label="Zalim-Marketing"><span className="brand-mark__icon" aria-hidden="true"><i /><i /><i /></span><span className="brand-mark__name">ZALIM</span><span className="brand-mark__divider">—</span><span className="brand-mark__sub">MARKETING</span></span>;
}

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [, setLocation] = useLocation();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = useMemo(() => ({ query: term }), [term]);
  const suggestions = trpc.catalog.suggestions.useQuery(query, { enabled: term.trim().length >= 2 });
  const items = suggestions.data || [];
  const optionId = activeIndex >= 0 ? `zalim-search-option-${items[activeIndex]?.id}` : undefined;
  const choose = (index: number) => {
    const item = items[index];
    if (!item) return;
    setLocation(`/products/${item.slug}`);
    setTerm("");
    setOpen(false);
    setActiveIndex(-1);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (activeIndex >= 0) return choose(activeIndex);
    if (term.trim()) {
      setLocation(`/search?q=${encodeURIComponent(term.trim())}`);
      setTerm("");
      setOpen(false);
    }
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(index => Math.min(index + 1, items.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
    }
  };
  return <form className={`relative ${mobile ? "w-full" : "hidden xl:block xl:w-[19rem]"}`} onSubmit={submit}>
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    <Input ref={inputRef} value={term} onFocus={() => setOpen(term.trim().length >= 2)} onChange={event => { setTerm(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={keyDown} placeholder="Search products, brands or categories" className="h-11 rounded-md border-slate-300 bg-white pl-10 text-sm shadow-none focus-visible:ring-[#b88d3c]/30" role="combobox" aria-autocomplete="list" aria-label="Search the Zalim-Marketing catalogue" aria-controls="zalim-search-results" aria-activedescendant={optionId} aria-expanded={open && term.trim().length >= 2} />
    {open && term.trim().length >= 2 && <div id="zalim-search-results" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-xl">
      {suggestions.isLoading && <p className="px-3 py-3 text-sm text-slate-500">Searching catalogue…</p>}
      {!suggestions.isLoading && !items.length && <p className="px-3 py-3 text-sm text-slate-500">No products found. Try a broader search.</p>}
      {items.map((item, index) => <button id={`zalim-search-option-${item.id}`} key={item.id} role="option" aria-selected={activeIndex === index} type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(index)} className={`flex w-full items-center gap-3 rounded px-2 py-2.5 text-left ${activeIndex === index ? "bg-amber-50" : "hover:bg-slate-50"}`}>
        <img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded object-cover" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{item.name}</span>
        <span className="text-xs font-semibold text-slate-500">{formatCurrency(item.price)}</span>
      </button>)}
    </div>}
  </form>;
}

function RouteFeedback() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 220);
    return () => window.clearTimeout(timer);
  }, [location]);
  return <div className={`route-feedback ${visible ? "route-feedback--visible" : ""}`} aria-hidden="true" />;
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const count = cart.data?.itemCount ?? 0;
  const navigate = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };
  return <div className="min-h-screen overflow-x-clip bg-[#fafafa] text-slate-950">
    <RouteFeedback />
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <div className="bg-[#0d1728] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white sm:text-[11px]">Independent automotive marketplace · EUR catalogue · Worldwide vehicle guidance</div>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="container flex h-[5.25rem] items-center gap-3 xl:h-[5.7rem]">
        <button className="grid h-10 w-10 shrink-0 place-items-center border border-slate-300 bg-white xl:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <Link href="/" className="shrink-0"><BrandMark /></Link>
        <nav className="ml-5 hidden h-full items-center gap-5 xl:flex">
          {menuLinks.slice(0, 6).map(([label, path]) => <Link href={path} key={path} className="header-link">{label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <SearchBar />
          <button className="grid h-10 w-10 place-items-center xl:hidden" onClick={() => navigate("/search")} aria-label="Search catalogue"><Search className="h-5 w-5" /></button>
          <button className="grid h-10 w-10 place-items-center" onClick={() => isAuthenticated ? navigate("/account") : startLogin()} aria-label="Open account"><UserRound className="h-5 w-5" /></button>
          <button className="relative grid h-10 w-10 place-items-center" onClick={() => navigate("/cart")} aria-label={`Open basket, ${count} products`}><ShoppingBag className="h-5 w-5" />{count > 0 && <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#b88d3c] px-1 text-[9px] font-bold text-white">{count}</span>}</button>
        </div>
      </div>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-[60] bg-slate-950/45" onClick={() => setMobileOpen(false)}>
      <aside className="flex h-full w-[min(25rem,92vw)] flex-col bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between"><BrandMark /><button className="grid h-10 w-10 place-items-center border border-slate-300" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
        <div className="mt-7"><SearchBar mobile /></div>
        <nav className="mt-7 grid border-y border-slate-200 py-3">
          {menuLinks.map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="flex items-center justify-between px-1 py-3.5 text-left text-base font-semibold text-slate-900"><span>{label}</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>)}
          <button onClick={() => navigate("/collections")} className="flex items-center justify-between px-1 py-3.5 text-left text-base font-semibold text-slate-900"><span>All categories</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
          <button onClick={() => navigate("/contact")} className="flex items-center justify-between px-1 py-3.5 text-left text-base font-semibold text-slate-900"><span>Contact & support</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
        </nav>
        <div className="mt-auto space-y-3 pt-6"><Button className="h-12 w-full rounded-none bg-[#b88d3c] font-bold hover:bg-[#9d752e]" onClick={() => isAuthenticated ? navigate("/account") : startLogin()}>{user ? "Open your account" : "Sign in or create account"}</Button><a className="flex h-11 items-center justify-center gap-2 border border-slate-300 text-sm font-bold" href="https://wa.me/923255531155" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp support</a></div>
      </aside>
    </div>}
    <main id="main-content"><div key={location} className="route-stage">{children}</div></main>
    <footer className="mt-16 bg-[#0d1728] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div><BrandMark inverse /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">A practical, independent marketplace for everyday motoring, road trips, vehicle care and useful upgrades.</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#d3ae62]">Owned & developed by Saqlain Mushtaq</p></div>
        <div><p className="footer-heading">Shop</p><div className="footer-nav"><Link href="/shop">Shop all</Link><Link href="/vehicle-finder">Shop by vehicle</Link><Link href="/collections">Categories</Link><Link href="/brands">Brands</Link></div></div>
        <div><p className="footer-heading">Information</p><div className="footer-nav"><Link href="/about">About Zalim-Marketing</Link><Link href="/faq">FAQs</Link><Link href="/shipping">Delivery information</Link><Link href="/returns">Returns policy</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms of use</Link></div></div>
        <div><p className="footer-heading">Support</p><div className="mt-4 space-y-3"><a className="footer-contact" href="https://wa.me/923255531155" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />+92 325 5531155</a><a className="footer-contact" href="mailto:raosaqlaingee@gmail.com"><Mail className="h-4 w-4" />raosaqlaingee@gmail.com</a><Link href="/contact" className="footer-contact"><ChevronRight className="h-4 w-4" />Contact & guidance</Link></div></div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Zalim-Marketing · Saqlain Mushtaq</span><span>Catalogue prices shown in EUR · Enquire before ordering</span></div></div>
    </footer>
  </div>;
}
