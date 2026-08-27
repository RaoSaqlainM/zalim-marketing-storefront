import StorefrontLayout from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDemoOrder, demoCheckoutSample, demoDeliveryEstimate, saveDemoOrder, type TestPaymentDetails, validateTestPayment } from "@/lib/demoOrder";
import { clearDirectCheckout, guestBasketChangedEvent, guestBasketSubtotal, readDirectCheckout, readGuestBasket, type GuestBasketItem } from "@/lib/guestBasket";
import { paymentPreferenceLabels, paymentPreviewConfirmation, paymentPreviewDelayMs, type PaymentPreference } from "@/lib/paymentPreview";
import { formatCurrency } from "@/lib/store";
import { ArrowRight, Building2, CheckCircle2, CreditCard, Home, LoaderCircle, Mail, MapPin, MessageCircle, PackageCheck, RotateCcw, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type Enquiry = { name: string; email: string; phone: string; location: string; address: string; vehicle: string; message: string };

const sampleEnquiry: Enquiry = { ...demoCheckoutSample.enquiry };
const sampleTestPayment: TestPaymentDetails = { ...demoCheckoutSample.payment };

export default function Checkout() {
  const [usesDirectCheckout] = useState(() => Boolean(readDirectCheckout()));
  const [items, setItems] = useState<GuestBasketItem[]>(() => readDirectCheckout() || readGuestBasket());
  const [enquiry, setEnquiry] = useState<Enquiry>(sampleEnquiry);
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("card");
  const [testPayment, setTestPayment] = useState<TestPaymentDetails>(sampleTestPayment);
  const [testPaymentError, setTestPaymentError] = useState<string | null>(null);
  const [demoOrderReference, setDemoOrderReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paymentPreviewState, setPaymentPreviewState] = useState<"idle" | "processing" | "confirmed">("idle");

  const update = (field: keyof Enquiry, value: string) => setEnquiry(current => ({ ...current, [field]: value }));
  const updateTestPayment = (field: keyof TestPaymentDetails, value: string) => setTestPayment(current => ({ ...current, [field]: value }));

  const restoreSampleDetails = () => {
    setEnquiry({ ...sampleEnquiry });
    setTestPayment({ ...sampleTestPayment });
    setPaymentPreference("card");
    setTestPaymentError(null);
  };

  useEffect(() => {
    if (usesDirectCheckout) return;
    const sync = () => setItems(readGuestBasket());
    window.addEventListener(guestBasketChangedEvent, sync);
    return () => window.removeEventListener(guestBasketChangedEvent, sync);
  }, [usesDirectCheckout]);

  const subtotal = guestBasketSubtotal(items);
  const messageLines = items.map(item => `• ${item.name} (${item.sku}) × ${item.quantity} — ${formatCurrency(Number(item.price) * item.quantity)}`).join("\n");
  const whatsappText = `Hello Saqlain, I would like to send an order enquiry to Zalim-Marketing.\n\nName: ${enquiry.name}\nEmail: ${enquiry.email || "Not provided"}\nWhatsApp: ${enquiry.phone}\nLocation: ${enquiry.location}\nDelivery address: ${enquiry.address}\nVehicle: ${enquiry.vehicle || "Not provided"}\nPayment route shown: ${paymentPreferenceLabels[paymentPreference]}\nPlanning delivery estimate: ${demoDeliveryEstimate}\n\nSelected items:\n${messageLines}\n\nProduct subtotal: ${formatCurrency(subtotal)}\n\nAdditional note: ${enquiry.message || "None"}`;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (paymentPreference === "card") {
      const error = validateTestPayment(testPayment);
      if (error) {
        setTestPaymentError(error);
        return;
      }
    }
    setTestPaymentError(null);
    const order = createDemoOrder(items.map(item => ({ name: item.name, quantity: item.quantity, price: Number(item.price), sku: item.sku })));
    saveDemoOrder(order);
    clearDirectCheckout();
    setDemoOrderReference(order.reference);
    setPaymentPreviewState("processing");
    window.setTimeout(() => setPaymentPreviewState("confirmed"), paymentPreviewDelayMs);
  };

  const openWhatsAppEnquiry = () => {
    setPaymentPreviewState("idle");
    setSubmitted(true);
    window.open(`https://wa.me/923255531155?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener,noreferrer");
  };

  if (!items.length) {
    return <StorefrontLayout><main className="container py-16"><EmptyState title="Choose an item before opening the local order preview." text="Your selection appears here in a browser-local review flow. No payment or delivery is created." action={{ label: "Explore products", href: "/shop" }} /></main></StorefrontLayout>;
  }

  const paymentConfirmation = paymentPreviewConfirmation(paymentPreference);

  return <StorefrontLayout><main className="container py-10 sm:py-14">
    <div className="mb-9 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-800"><span className="grid h-6 w-6 place-items-center bg-[#071323] text-white">1</span> Details <span className="h-px w-6 bg-slate-500" /><span className="grid h-6 w-6 place-items-center bg-[#d8b760] text-[#071323]">2</span> Preview route <span className="h-px w-6 bg-slate-500" /><span className="grid h-6 w-6 place-items-center bg-[#d7e0e7] text-slate-800">3</span> Confirm</div>
    <p className="eyebrow">Browser-local preview · no payment is taken</p>
    <h1 className="mt-3 font-display text-5xl tracking-[-.045em] text-[#071323] sm:text-7xl">Review your order preview</h1>
    <p className="mt-4 max-w-2xl leading-7 text-slate-800">Sample-only details are already entered so you can inspect the complete journey without sharing personal or financial information. You can edit them before preparing a genuine enquiry.</p>
    <section className="mt-10 grid gap-7 lg:grid-cols-[1fr_23rem]">
      <form onSubmit={submit} className="border border-slate-400 bg-[#edf1f4] p-5 shadow-[0_18px_42px_rgba(7,19,35,.12)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-400 pb-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center bg-[#dce5eb] text-[#70511c]"><MessageCircle className="h-5 w-5" /></div><div><h2 className="text-xl font-extrabold text-[#071323]">Customer and delivery details</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-800">The example data stays in this browser. It demonstrates confirmation only, then you can choose whether to open a real WhatsApp enquiry.</p></div></div><Button type="button" variant="outline" onClick={restoreSampleDetails} className="h-10 rounded-none border-[#8e681f] bg-[#f5e6b6] text-xs font-extrabold text-[#071323] hover:bg-[#d8b760]"><RotateCcw className="mr-2 h-3.5 w-3.5" />Restore sample details</Button></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Preview customer name" id="enquiry-name"><Input id="enquiry-name" value={enquiry.name} onChange={event => update("name", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" autoComplete="name" required /></Field>
          <Field label="Preview WhatsApp number" id="enquiry-phone"><Input id="enquiry-phone" value={enquiry.phone} onChange={event => update("phone", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" autoComplete="tel" required /></Field>
          <Field label="Preview email address" detail="optional" id="enquiry-email"><Input id="enquiry-email" type="email" value={enquiry.email} onChange={event => update("email", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" autoComplete="email" /></Field>
          <Field label="Preview city and country" id="enquiry-location"><Input id="enquiry-location" value={enquiry.location} onChange={event => update("location", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" required /></Field>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-address">Preview delivery location</Label><Textarea id="enquiry-address" value={enquiry.address} onChange={event => update("address", event.target.value)} className="mt-2 min-h-24 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" required /></div>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-vehicle">Vehicle details <span className="font-normal text-slate-700">optional but useful for fit checks</span></Label><Input id="enquiry-vehicle" value={enquiry.vehicle} onChange={event => update("vehicle", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" /></div>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-message">Anything else we should know? <span className="font-normal text-slate-700">optional</span></Label><Textarea id="enquiry-message" value={enquiry.message} onChange={event => update("message", event.target.value)} className="mt-2 min-h-24 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" /></div>
        </div>
        <fieldset className="mt-7 border border-[#b5964d] bg-[#f7ecd0] p-5"><legend className="px-1 text-sm font-extrabold text-[#071323]">Payment route preview</legend><p className="mt-1 text-sm leading-6 text-slate-800">This local preview accepts fictional display values only. There are no card-number, bank-account, expiry-date, or security-code fields, and payment information is never saved.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><PreferenceButton active={paymentPreference === "card"} onClick={() => setPaymentPreference("card")} icon={<CreditCard className="h-5 w-5" />} title="Demo card route" text="Fictional reference only" /><PreferenceButton active={paymentPreference === "transfer"} onClick={() => setPaymentPreference("transfer")} icon={<Building2 className="h-5 w-5" />} title="Transfer preview" text="Display only" /><PreferenceButton active={paymentPreference === "collection"} onClick={() => setPaymentPreference("collection")} icon={<Store className="h-5 w-5" />} title="Collection preview" text="Display only" /></div>{paymentPreference === "card" && <div className="mt-5 grid gap-4 border-t border-[#b5964d] pt-5 sm:grid-cols-2"><Field label="Fictional display name" id="test-cardholder"><Input id="test-cardholder" value={testPayment.cardholder} onChange={event => updateTestPayment("cardholder", event.target.value)} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" autoComplete="off" /></Field><Field label="Fictional display reference" detail="format: DEMO-4242" id="test-reference"><Input id="test-reference" value={testPayment.reference} onChange={event => updateTestPayment("reference", event.target.value.toUpperCase())} className="mt-2 h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323]" autoComplete="off" aria-describedby={testPaymentError ? "test-payment-error" : undefined} /></Field></div>}{testPaymentError && <p id="test-payment-error" className="mt-4 text-sm font-bold text-red-800">{testPaymentError}</p>}<p className="mt-4 flex gap-2 border-t border-[#b5964d] pt-4 text-xs font-semibold leading-5 text-slate-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3f5d20]" />The sample reference is valid for this local display. Nothing is charged, reserved, or sent to a payment provider.</p></fieldset>
        <Button type="submit" className="mt-7 h-12 w-full rounded-none bg-[#071323] text-white hover:bg-[#8f651c]"><CreditCard className="mr-2 h-4 w-4" />Show local order confirmation</Button>
        {submitted && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#315d32]"><CheckCircle2 className="h-4 w-4" />Your enquiry is prepared. Review the WhatsApp message, then send only when ready.</p>}
        <a href="mailto:raosaqlaingee@gmail.com" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#70511c] hover:text-[#071323]"><Mail className="h-4 w-4" />Prefer email? Contact raosaqlaingee@gmail.com</a>
      </form>
      <OrderSummary items={items} subtotal={subtotal} />
    </section>
  </main><Dialog open={paymentPreviewState !== "idle"} onOpenChange={open => { if (!open && paymentPreviewState !== "processing") setPaymentPreviewState("idle"); }}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-[#071323] bg-[#edf1f4] p-6 text-[#071323] sm:max-w-2xl sm:p-7" showCloseButton={paymentPreviewState !== "processing"}>{paymentPreviewState === "processing" ? <div className="py-8 text-center"><LoaderCircle className="mx-auto h-10 w-10 animate-spin text-[#8f651c]" /><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#70511c]">Local preview transition</p><DialogTitle className="mt-3 font-display text-4xl tracking-[-.045em] text-[#071323]">Preparing your order preview…</DialogTitle><DialogDescription className="mt-3 leading-6 text-slate-800">This visual transition creates no payment, order, stock reservation, shipment, or delivery.</DialogDescription></div> : <ConfirmedPreview reference={demoOrderReference} items={items} subtotal={subtotal} paymentPreference={paymentPreference} paymentTitle={paymentConfirmation.title} paymentDetail={paymentConfirmation.detail} onEdit={() => setPaymentPreviewState("idle")} onWhatsAppEnquiry={openWhatsAppEnquiry} />}</DialogContent></Dialog></StorefrontLayout>;
}

function ConfirmedPreview({ items, onEdit, onWhatsAppEnquiry, paymentDetail, paymentPreference, paymentTitle, reference, subtotal }: { items: GuestBasketItem[]; onEdit: () => void; onWhatsAppEnquiry: () => void; paymentDetail: string; paymentPreference: PaymentPreference; paymentTitle: string; reference: string; subtotal: number }) {
  return <><DialogHeader className="text-left"><CheckCircle2 className="h-10 w-10 text-[#315d32]" /><p className="mt-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#70511c]">Browser-local order preview · {reference}</p><DialogTitle className="font-display text-4xl tracking-[-.045em] text-[#071323]">{paymentTitle}</DialogTitle><DialogDescription className="mt-2 leading-6 text-slate-800">{paymentDetail} This is an illustrative browser-local display only; it creates no payment or delivery commitment.</DialogDescription></DialogHeader><section className="mt-6 border-y border-slate-400 py-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Selected items</p><p className="mt-1 text-sm font-extrabold text-[#071323]">{items.length} item{items.length === 1 ? "" : "s"} in this preview</p></div><PackageCheck className="h-6 w-6 text-[#315d32]" /></div><div className="mt-4 space-y-3">{items.map(item => <div key={item.productId} className="flex gap-3"><img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" className="h-12 w-10 border border-slate-400 object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-extrabold text-[#071323]">{item.name}</p><p className="mt-1 text-xs font-medium text-slate-700">Qty {item.quantity} · {item.sku}</p></div><p className="text-right text-sm font-extrabold text-[#071323]">{formatCurrency(Number(item.price) * item.quantity)}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-slate-400 pt-4 text-sm font-extrabold text-[#071323]"><span>Product subtotal</span><span>{formatCurrency(subtotal)}</span></div></section><SimulatedDeliveryRoute reference={reference} /><div className="mt-5 grid gap-3 border border-[#b5964d] bg-[#f7ecd0] p-4 sm:grid-cols-2"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Planning display</p><p className="mt-1 text-sm font-extrabold text-[#071323]">{demoDeliveryEstimate}</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Preview payment route</p><p className="mt-1 text-sm font-extrabold text-[#071323]">{paymentPreference === "card" ? "Fictional DEMO reference" : paymentPreferenceLabels[paymentPreference]}</p></div></div><DialogFooter className="mt-6 gap-3 sm:gap-2"><Button type="button" variant="outline" onClick={onEdit} className="h-11 rounded-none border-slate-500 bg-[#f9fbfc] text-[#071323] hover:bg-[#dce5eb]">Keep editing</Button><Link href="/demo-order" className="inline-flex h-11 items-center justify-center gap-2 border border-[#8f651c] bg-[#f5e6b6] px-4 text-sm font-extrabold text-[#071323] hover:bg-[#d8b760]"><Truck className="h-4 w-4" />View local journey</Link><Button type="button" onClick={onWhatsAppEnquiry} className="h-11 rounded-none bg-[#071323] text-white hover:bg-[#8f651c]"><MessageCircle className="mr-2 h-4 w-4" />Open WhatsApp enquiry</Button></DialogFooter></>;
}

function SimulatedDeliveryRoute({ reference }: { reference: string }) {
  return <section className="checkout-route-map mt-6 overflow-hidden border border-[#304a67] bg-[#071323] p-4 text-[#eff6fc] sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#e8c56f]">Illustrative route animation</p><h3 className="mt-1 font-display text-2xl tracking-[-.03em] text-white">Previewing the route to a demo destination</h3></div><span className="shrink-0 border border-[#e8c56f]/40 bg-[#0e2742] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#f7df9d]">{reference}</span></div><p className="mt-2 max-w-xl text-xs leading-5 text-[#c7d6e5]">This moving vehicle is a visual demo. It has no carrier connection, live location, dispatch record, or delivery effect.</p><div className="relative mt-5 h-44 overflow-hidden border border-white/15 bg-[radial-gradient(circle_at_16%_18%,rgba(113,181,229,.18),transparent_26%),linear-gradient(135deg,#102b47,#091827)]"><div className="absolute inset-x-0 top-[23%] h-px bg-white/10" /><div className="absolute inset-x-0 top-[67%] h-px bg-white/10" /><div className="absolute bottom-0 left-[26%] top-0 w-px bg-white/10" /><div className="absolute bottom-0 left-[68%] top-0 w-px bg-white/10" /><svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true"><path d="M35 132 C96 127 104 64 183 84 S261 145 351 48" fill="none" stroke="rgba(232,197,111,.26)" strokeWidth="11" /><path className="checkout-route-map__path" d="M35 132 C96 127 104 64 183 84 S261 145 351 48" fill="none" stroke="#e8c56f" strokeLinecap="round" strokeWidth="3" /></svg><span className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#dce9f4]"><PackageCheck className="h-3.5 w-3.5 text-[#e8c56f]" />Demo dispatch</span><span className="absolute right-4 top-4 inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#dce9f4]"><Home className="h-3.5 w-3.5 text-[#e8c56f]" />Demo destination</span><span className="checkout-route-map__vehicle absolute bottom-[19%] left-[7%] grid h-8 w-8 place-items-center rounded-full border border-[#f7df9d] bg-[#d4ad50] text-[#071323] shadow-[0_0_0_6px_rgba(212,173,80,.14)]"><Truck className="h-4 w-4" /></span></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><RouteStage label="Processing" text="Preview prepared" active /><RouteStage label="Shipped" text="Illustrative dispatch" active /><RouteStage label="Out for delivery" text="Demo route animation" active /></div></section>;
}

function RouteStage({ active, label, text }: { active: boolean; label: string; text: string }) {
  return <div className="border border-white/15 bg-white/5 p-3"><span className={`inline-block h-1.5 w-1.5 rounded-full ${active ? "bg-[#e8c56f]" : "bg-slate-500"}`} /><p className="mt-2 text-xs font-extrabold text-white">{label}</p><p className="mt-1 text-[11px] leading-4 text-[#c7d6e5]">{text}</p></div>;
}

function Field({ children, detail, id, label }: { children: React.ReactNode; detail?: string; id: string; label: string }) {
  return <div><Label htmlFor={id} className="font-bold text-[#071323]">{label}{detail && <span className="font-medium text-slate-700"> {detail}</span>}</Label>{children}</div>;
}

function PreferenceButton({ active, icon, onClick, text, title }: { active: boolean; icon: React.ReactNode; onClick: () => void; text: string; title: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`border p-4 text-left transition ${active ? "border-[#071323] bg-[#071323] text-white" : "border-slate-500 bg-[#f9fbfc] text-[#071323] hover:border-[#8f651c] hover:bg-[#f5e6b6]"}`}><span className={active ? "text-[#f0c767]" : "text-[#70511c]"}>{icon}</span><span className="mt-4 block text-sm font-extrabold">{title}</span><span className={active ? "mt-1 block text-xs leading-5 text-[#d5e2ec]" : "mt-1 block text-xs font-semibold leading-5 text-slate-800"}>{text}</span></button>;
}

function OrderSummary({ items, subtotal }: { items: Array<{ imageUrl: string | null; name: string; price: number | string; productId: number; quantity: number; sku: string }>; subtotal: number }) {
  return <aside className="h-fit border border-[#b88d3c] bg-[#06111f] p-6 text-[#f9f5ea] shadow-[0_20px_45px_rgba(6,17,31,.28)] lg:sticky lg:top-28"><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#f0c767]">Order preview</p><p className="mt-3 font-display text-3xl leading-none tracking-[-.025em] text-white">{items.length} selected item{items.length === 1 ? "" : "s"}</p><p className="mt-3 border-l-2 border-[#f0c767] pl-3 text-xs font-semibold leading-5 text-[#dbe6f0]">Local simulation only. No payment, inventory reservation, shipment, or delivery is created.</p><div className="mt-5 max-h-72 space-y-4 overflow-auto border-y border-[#f0c767]/35 py-5">{items.map(item => <div className="flex gap-3" key={item.productId}><img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" loading="lazy" decoding="async" className="h-14 w-12 border border-[#f0c767]/35 object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-bold leading-5 text-[#fffdf8]">{item.name}</p><p className="mt-1 text-[11px] font-medium text-[#d2deea]">Qty {item.quantity} · {item.sku}</p></div><p className="text-right text-xs font-extrabold text-white">{formatCurrency(Number(item.price) * item.quantity)}</p></div>)}</div><div className="mt-5 flex justify-between text-base font-extrabold text-white"><span>Product subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-5 border-l-2 border-[#f0c767] bg-[#10243a] px-3 py-3 text-xs font-medium leading-5 text-[#e2eaf2]"><MapPin className="mb-1 h-4 w-4 text-[#f0c767]" /><p><span className="font-extrabold text-white">Illustrative planning display:</span> {demoDeliveryEstimate}. A real delivery window needs stock and location confirmation.</p></div><Link href="/cart" className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#f0c767] px-4 py-3 text-sm font-extrabold text-[#071323] hover:bg-[#ffe09a]">Back to basket <ArrowRight className="h-4 w-4" /></Link></aside>;
}

function EmptyState({ action, text, title }: { action: { href: string; label: string }; text: string; title: string }) {
  return <section className="border border-dashed border-slate-500 bg-[#e7edf1] px-6 py-14 text-center sm:px-10"><p className="eyebrow">Local order preview</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.05em] text-[#071323]">{title}</h1><p className="mx-auto mt-4 max-w-xl leading-7 text-slate-800">{text}</p><Link href={action.href} className="mt-7 inline-flex h-11 items-center justify-center bg-[#071323] px-5 text-sm font-bold text-white hover:bg-[#8f651c]">{action.label}</Link></section>;
}
