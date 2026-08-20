import StorefrontLayout from "@/components/StorefrontLayout";
import { BreadCrumbs } from "@/components/CommerceUI";
import { policyContent } from "@/lib/store";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function StaticPage() {
  const [location] = useLocation();
  const slug = location.split("/").filter(Boolean).at(-1) || "about";
  const content = policyContent[slug] || policyContent.about;
  return <StorefrontLayout><div className="container py-9 sm:py-14"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: content.title }]} /><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]"><div><p className="eyebrow">{content.eyebrow}</p><h1 className="mt-3 max-w-lg font-display text-5xl font-bold leading-[.98] tracking-[-.06em] text-[#131a26] sm:text-6xl">{content.title}</h1><p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">{content.intro}</p><Link href="/shop" className="mt-7 inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2">Explore the collection <ArrowRight className="h-4 w-4" /></Link></div><div className="rounded-[1.8rem] bg-[#f0ebe1] p-7 sm:p-10"><div className="space-y-8">{content.sections.map((section, index) => <section key={section.heading} className={index ? "border-t border-[#dcd4c6] pt-8" : ""}><p className="font-display text-2xl font-bold tracking-[-.035em] text-[#131a26]">{section.heading}</p><p className="mt-3 max-w-xl text-sm leading-7 text-[#556070]">{section.body}</p></section>)}</div></div></div></div></StorefrontLayout>;
}
