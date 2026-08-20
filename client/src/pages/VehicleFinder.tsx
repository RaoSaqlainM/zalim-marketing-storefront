import { BreadCrumbs } from "@/components/CommerceUI";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { ArrowRight, CarFront, CheckCircle2, CircleAlert, SearchCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";

const vehicleData = {
  "United Kingdom": {
    Ford: ["Focus", "Fiesta", "Puma", "Ranger"],
    Volkswagen: ["Golf", "Polo", "Tiguan", "Transporter"],
    Toyota: ["Yaris", "Corolla", "RAV4", "Hilux"],
    BMW: ["1 Series", "3 Series", "X3", "X5"],
    Nissan: ["Qashqai", "Juke", "X-Trail", "Navara"],
  },
  "United States": {
    Ford: ["F-150", "Explorer", "Bronco", "Mustang"],
    Toyota: ["Camry", "RAV4", "Tacoma", "Highlander"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot"],
    Chevrolet: ["Silverado", "Equinox", "Tahoe", "Malibu"],
    Jeep: ["Wrangler", "Grand Cherokee", "Gladiator", "Compass"],
  },
  Australia: {
    Toyota: ["Hilux", "Land Cruiser", "RAV4", "Corolla"],
    Ford: ["Ranger", "Everest", "Mustang", "Escape"],
    Mazda: ["CX-5", "CX-3", "BT-50", "Mazda3"],
    Hyundai: ["i30", "Tucson", "Santa Fe", "Kona"],
    Subaru: ["Outback", "Forester", "Crosstrek", "WRX"],
  },
} as const;

const years = Array.from({ length: 18 }, (_, index) => String(2026 - index));

export default function VehicleFinder() {
  const [, setLocation] = useLocation();
  const [market, setMarket] = useState<keyof typeof vehicleData>("United Kingdom");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const makes = Object.keys(vehicleData[market]);
  const models = useMemo(() => make ? vehicleData[market][make as keyof typeof vehicleData[typeof market]] || [] : [], [make, market]);
  const selectMarket = (nextMarket: keyof typeof vehicleData) => {
    setMarket(nextMarket);
    setMake("");
    setModel("");
    setYear("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!make || !model || !year) return;
    const vehicle = `${make} ${model} ${year}`;
    setLocation(`/shop?vehicle=${encodeURIComponent(vehicle)}&market=${encodeURIComponent(market)}`);
  };
  return <StorefrontLayout><div className="container py-8 sm:py-12 lg:py-16"><BreadCrumbs items={[{ label: "Home", href: "/" }, { label: "Shop by vehicle" }]} /><section className="mt-8 grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[1.05fr_.95fr]"><div className="bg-[#0d1728] px-6 py-10 text-white sm:px-10 sm:py-14"><p className="eyebrow !text-[#d8b76c]">Vehicle Finder</p><h1 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[.92] tracking-[-.065em] sm:text-6xl">Find the right starting point for your car.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Select a common vehicle from the United Kingdom, United States or Australia. We will carry it into the catalogue so you can compare relevant product notes more easily.</p><div className="mt-10 grid gap-4 border-t border-white/10 pt-7"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d8b76c]" /><p className="text-sm leading-6 text-slate-200">Vehicle context stays visible while you browse the marketplace.</p></div><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d8b76c]" /><p className="text-sm leading-6 text-slate-200">Product pages show universal or example-fit guidance where available.</p></div><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d8b76c]" /><p className="text-sm leading-6 text-slate-200">Always confirm dimensions and fit details before placing an enquiry.</p></div></div></div><form onSubmit={submit} className="p-6 sm:p-10"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center bg-amber-50 text-[#a77926]"><CarFront className="h-5 w-5" /></div><div><p className="font-bold text-slate-950">Select your vehicle</p><p className="text-sm text-slate-500">Choose market, make, model and year.</p></div></div><fieldset className="mt-8"><legend className="text-sm font-bold text-slate-950">Vehicle market</legend><div className="mt-3 grid grid-cols-3 gap-2">{(Object.keys(vehicleData) as Array<keyof typeof vehicleData>).map(item => <button type="button" key={item} onClick={() => selectMarket(item)} className={`min-h-16 border px-2 text-center text-xs font-bold leading-4 ${market === item ? "border-[#b88d3c] bg-amber-50 text-[#855f1d]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>{item === "United Kingdom" ? "United\nKingdom" : item === "United States" ? "United\nStates" : "Australia"}</button>)}</div></fieldset><div className="mt-7 grid gap-4 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold text-slate-900">Make<select value={make} onChange={event => { setMake(event.target.value); setModel(""); }} className="h-12 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-[#b88d3c]"><option value="">Select make</option>{makes.map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-slate-900">Model<select value={model} onChange={event => setModel(event.target.value)} disabled={!make} className="h-12 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-[#b88d3c] disabled:cursor-not-allowed disabled:bg-slate-100"><option value="">Select model</option>{models.map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-slate-900">Year<select value={year} onChange={event => setYear(event.target.value)} className="h-12 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-[#b88d3c]"><option value="">Select year</option>{years.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="mt-7 border-t border-slate-200 pt-6"><Button type="submit" disabled={!make || !model || !year} className="h-12 w-full rounded-none bg-[#b88d3c] font-bold hover:bg-[#9d752e]"><SearchCheck className="mr-2 h-4 w-4" />Browse products for this vehicle<ArrowRight className="ml-2 h-4 w-4" /></Button></div><div className="mt-5 flex gap-2 border-l-2 border-[#b88d3c] bg-slate-50 p-4"><CircleAlert className="h-4 w-4 shrink-0 text-[#a77926]" /><p className="text-xs leading-5 text-slate-600">Vehicle Finder helps organise browsing. It does not replace the product fit, dimensions or installation notes.</p></div></form></section></div></StorefrontLayout>;
}
