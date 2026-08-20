import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Link } from "wouter";

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: { label: string; href: string } }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><span className="roadline" aria-hidden="true" /><p className="eyebrow">{eyebrow}</p></div><h2 className="section-title">{title}</h2>{text && <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{text}</p>}</div>{action && <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2">{action.label}<ChevronRight className="h-4 w-4" /></Link>}</div>;
}

export function BreadCrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <ChevronRight className="h-3.5 w-3.5" />}{item.href ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span className="font-medium text-foreground">{item.label}</span>}</span>)}</nav>;
}

export function QuantityControl({ value, onChange, min = 1, max = 99, compact = false }: { value: number; onChange: (value: number) => void; min?: number; max?: number; compact?: boolean }) {
  return <div className={`inline-flex items-center rounded-full border border-border bg-background ${compact ? "h-8" : "h-10"}`}><button className="grid h-full w-9 place-items-center disabled:opacity-40" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button><span className={`grid min-w-7 place-items-center font-bold ${compact ? "text-xs" : "text-sm"}`}>{value}</span><button className="grid h-full w-9 place-items-center disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return <div className="rounded-[1.75rem] border border-dashed border-border bg-card px-6 py-14 text-center"><p className="text-xl font-bold tracking-tight">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{text}</p>{action && <Button asChild className="mt-6 rounded-full"><Link href={action.href}>{action.label}</Link></Button>}</div>;
}

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) { return <Link href={href} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground"><ChevronLeft className="h-4 w-4" />{label}</Link>; }
