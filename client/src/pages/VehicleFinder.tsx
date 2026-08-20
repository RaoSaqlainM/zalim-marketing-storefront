import { Button } from "@/components/ui/button";
import { BreadCrumbs } from "@/components/CommerceUI";
import StorefrontLayout from "@/components/StorefrontLayout";
import { ArrowRight, CarFront, CircleAlert, SearchCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const vehicleData: Record<string, string[]> = { Honda: ["Civic", "City", "BR-V"], Suzuki: ["Alto", "Cultus", "Swift"], Toyota: ["Corolla", "Yaris", "Hilux"], Kia: ["Sportage", "Picanto", "Stonic"] };
const years = Array.from({ length: 13 }, (_, index) => String(2014 + index));

export default function VehicleFinder() {
  const [, setLocation] = useLocation();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const models = useMemo(() => vehicleData[make] || [], [make]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!make || !model || !year) return;
    const fit = `${make} ${model} ${year}`;
    setLocation(`/shop?vehicle=${encodeURIComponent(fit)}`);
  };
  return <StorefrontLayout><div className="container py-8 sm:py-12"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: "Vehicle finder" }]} /><div className="grid gap-9 lg:grid-cols-[.85fr_1.15fr]"><div><p className="eyebrow">Start with your vehicle</p><h1 className="page-title">A clearer way to begin.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">Choose your vehicle to carry its details into the marketplace. Use product specifications to confirm exact fit before ordering—some essentials are universal, while others are vehicle-specific.</p><div className="mt-8 rounded-[1.35rem] bg-[#151d2b] p-5 text-slate-100"><div className="flex gap-3"><CircleAlert className="h-5 w-5 shrink-0 text-[#d2ae68]" /><p className="text-sm leading-6">Vehicle Finder is an organising tool, not a fitment guarantee. Always read the fit notes on the product page.</p></div></div></div><form onSubmit={submit} className="rounded-[1.7rem] border border-border bg-card p-6 shadow-[0_18px_48px_-36px_rgba(15,23,42,.5)] sm:p-9"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><CarFront className="h-5 w-5" /></div><div><p className="font-bold">Your vehicle</p><p className="text-sm text-muted-foreground">Pick make, model and year.</p></div></div><div className="mt-8 grid gap-4"><label className="grid gap-2 text-sm font-bold">Make<select value={make} onChange={event => { setMake(event.target.value); setModel(""); }} className="h-12 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary"><option value="">Select make</option>{Object.keys(vehicleData).map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Model<select value={model} onChange={event => setModel(event.target.value)} disabled={!make} className="h-12 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"><option value="">Select model</option>{models.map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Year<select value={year} onChange={event => setYear(event.target.value)} className="h-12 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary"><option value="">Select year</option>{years.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div><Button type="submit" disabled={!make || !model || !year} className="mt-8 w-full rounded-full"><SearchCheck className="mr-2 h-4 w-4" />Browse the marketplace <ArrowRight className="ml-2 h-4 w-4" /></Button></form></div></div></StorefrontLayout>;
}
