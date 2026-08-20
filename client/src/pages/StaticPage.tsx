import { BreadCrumbs } from "@/components/CommerceUI";
import StorefrontLayout from "@/components/StorefrontLayout";
import { policyContent } from "@/lib/store";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function StaticPage() {
  const [location] = useLocation();
  const slug = location.split("/").filter(Boolean).at(-1) || "about";
  const content = policyContent[slug] || policyContent.about;
  const isContact = slug === "contact";
  return <StorefrontLayout><main className="container py-9 sm:py-14"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: content.title }]} /><section className="mt-9 grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">{content.eyebrow}</p><h1 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[.9] tracking-[-.065em] text-slate-950 sm:text-7xl">{content.title}</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-600">{content.intro}</p>{isContact ? <div className="mt-8 grid gap-3"><a href="https://wa.me/923255531155" target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-[#b88d3c] bg-[#faf5e7] p-4 text-sm font-bold text-[#76531a] hover:bg-[#f2e4be]"><MessageCircle className="h-5 w-5" />WhatsApp +92 325 5531155</a><a href="mailto:raosaqlaingee@gmail.com" className="flex items-center gap-3 border border-slate-300 p-4 text-sm font-bold text-slate-950 hover:border-slate-950"><Mail className="h-5 w-5" />raosaqlaingee@gmail.com</a></div> : <Link href="/shop" className="mt-8 inline-flex h-11 items-center bg-slate-950 px-5 text-sm font-bold text-white hover:bg-[#b88d3c]">Explore the catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link>}</div><div className="border border-slate-200 bg-[#f5f1e7] p-6 sm:p-10"><div className="space-y-8">{content.sections.map((section, index) => <section key={section.heading} className={index ? "border-t border-[#ddd4c2] pt-8" : ""}><p className="font-display text-3xl font-bold tracking-[-.045em] text-slate-950">{section.heading}</p><p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{section.body}</p></section>)}</div></div></section></main></StorefrontLayout>;
}
