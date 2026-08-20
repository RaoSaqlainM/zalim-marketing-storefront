import { BreadCrumbs, EmptyState } from "@/components/CommerceUI";
import StorefrontLayout from "@/components/StorefrontLayout";

export default function NotFound() {
  return <StorefrontLayout><main className="container py-9 sm:py-14"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: "Page not found" }]} /><section className="mt-9 grid gap-8 border-y border-slate-200 py-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="eyebrow">Zalim-Marketing</p><h1 className="mt-4 max-w-md font-display text-5xl font-bold leading-[.92] tracking-[-.06em] text-slate-950 sm:text-7xl">This road leads nowhere.</h1><p className="mt-5 max-w-md text-base leading-7 text-slate-600">The page may have moved, or the link may no longer be available. The catalogue, vehicle finder and support desk are all one step away.</p></div><EmptyState title="We could not find that page." text="Return to the Zalim-Marketing catalogue or choose your vehicle to begin with relevant fit guidance." action={{ label: "Browse the catalogue", href: "/shop" }} /></section></main></StorefrontLayout>;
}
