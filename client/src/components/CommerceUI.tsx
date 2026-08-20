import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Link } from "wouter";

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: { label: string; href: string } }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><span className="roadline" aria-hidden="true" /><p className="eyebrow">{eyebrow}</p></div><h2 className="section-title">{title}</h2>{text && <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{text}</p>}</div>{action && <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-bold text-[#805d1e] hover:gap-2 hover:text-slate-950">{action.label}<ChevronRight className="h-4 w-4" /></Link>}</div>;
}

export function BreadCrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[.1em] text-slate-500" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}{item.href ? <Link href={item.href} className="hover:text-slate-950">{item.label}</Link> : <span className="text-slate-950">{item.label}</span>}</span>)}</nav>;
}

export function QuantityControl({ value, onChange, min = 1, max = 99, compact = false }: { value: number; onChange: (value: number) => void; min?: number; max?: number; compact?: boolean }) {
  return <div className={`inline-flex items-center border border-slate-300 bg-white ${compact ? "h-8" : "h-10"}`}><button className="grid h-full w-9 place-items-center transition hover:bg-[#f5f1e7] disabled:opacity-40" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button><span className={`grid min-w-7 place-items-center font-bold text-slate-950 ${compact ? "text-xs" : "text-sm"}`}>{value}</span><button className="grid h-full w-9 place-items-center transition hover:bg-[#f5f1e7] disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return <div className="border border-dashed border-slate-300 bg-[#f8f7f3] px-6 py-14 text-center"><p className="font-display text-3xl font-bold tracking-[-.045em] text-slate-950">{title}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{text}</p>{action && <Button asChild className="mt-6 h-11 rounded-none bg-slate-950 text-white hover:bg-[#b88d3c]"><Link href={action.href}>{action.label}</Link></Button>}</div>;
}

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) { return <Link href={href} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-slate-950"><ChevronLeft className="h-4 w-4" />{label}</Link>; }
