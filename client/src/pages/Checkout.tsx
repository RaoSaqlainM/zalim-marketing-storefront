import { EmptyState } from "@/components/CommerceUI";
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
import { ArrowRight, Building2, CheckCircle2, CreditCard, LoaderCircle, Mail, MapPin, MessageCircle, PackageCheck, RotateCcw, Store } from "lucide-react";
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
    return <StorefrontLayout><main className="container py-16"><EmptyState title="Add something before preparing a test order." text="Your product selection will appear here in a clear, ready-to-review client-demo order." action={{ label: "Explore catalogue", href: "/shop" }} /></main></StorefrontLayout>;
  }

  const paymentConfirmation = paymentPreviewConfirmation(paymentPreference);

  return <StorefrontLayout><main className="container py-10 sm:py-14">
    <div className="mb-9 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700"><span className="grid h-6 w-6 place-items-center bg-slate-950 text-white">1</span> Details <span className="h-px w-6 bg-slate-400" /><span className="grid h-6 w-6 place-items-center bg-[#f0c767] text-slate-950">2</span> Test route <span className="h-px w-6 bg-slate-400" /><span className="grid h-6 w-6 place-items-center bg-[#f1ede1] text-slate-700">3</span> Confirm</div>
    <p className="eyebrow">Browser-local checkout · no payment is taken</p>
    <h1 className="mt-3 font-display text-5xl tracking-[-.045em] text-slate-950 sm:text-7xl">Review your test order</h1>
    <p className="mt-4 max-w-2xl leading-7 text-slate-700">Sample-only details are already entered so you can test the whole journey without sharing personal or financial information. You can change them for a real enquiry later.</p>
    <section className="mt-10 grid gap-7 lg:grid-cols-[1fr_23rem]">
      <form onSubmit={submit} className="border border-slate-300 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,.06)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center bg-[#f5edda] text-[#72501b]"><MessageCircle className="h-5 w-5" /></div><div><h2 className="text-xl font-extrabold text-slate-950">Customer and delivery details</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-700">The sample data is local to this browser. It is used only to demonstrate confirmation, then you can choose whether to open a real WhatsApp enquiry.</p></div></div><Button type="button" variant="outline" onClick={restoreSampleDetails} className="h-10 rounded-none border-[#b88d3c] bg-[#fffaf0] text-xs font-extrabold text-slate-950 hover:bg-[#f0c767]"><RotateCcw className="mr-2 h-3.5 w-3.5" />Reset sample details</Button></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Sample customer name" id="enquiry-name"><Input id="enquiry-name" value={enquiry.name} onChange={event => update("name", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" autoComplete="name" required /></Field>
          <Field label="Sample WhatsApp number" id="enquiry-phone"><Input id="enquiry-phone" value={enquiry.phone} onChange={event => update("phone", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" autoComplete="tel" required /></Field>
          <Field label="Sample email address" detail="optional" id="enquiry-email"><Input id="enquiry-email" type="email" value={enquiry.email} onChange={event => update("email", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" autoComplete="email" /></Field>
          <Field label="Sample city and country" id="enquiry-location"><Input id="enquiry-location" value={enquiry.location} onChange={event => update("location", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" required /></Field>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-address">Sample delivery location</Label><Textarea id="enquiry-address" value={enquiry.address} onChange={event => update("address", event.target.value)} className="mt-2 min-h-24 rounded-none border-slate-400 text-slate-950" required /></div>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-vehicle">Vehicle details <span className="font-normal text-slate-600">optional but useful for fit checks</span></Label><Input id="enquiry-vehicle" value={enquiry.vehicle} onChange={event => update("vehicle", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" /></div>
          <div className="sm:col-span-2"><Label htmlFor="enquiry-message">Anything else we should know? <span className="font-normal text-slate-600">optional</span></Label><Textarea id="enquiry-message" value={enquiry.message} onChange={event => update("message", event.target.value)} className="mt-2 min-h-24 rounded-none border-slate-400 text-slate-950" /></div>
        </div>
        <fieldset className="mt-7 border border-[#d3b66f] bg-[#fffaf0] p-5"><legend className="px-1 text-sm font-extrabold text-slate-950">Test payment route</legend><p className="mt-1 text-sm leading-6 text-slate-700">This local demo accepts fictional test values only. It has no card-number, bank-account, expiry-date, or security-code fields and saves no payment details.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><PreferenceButton active={paymentPreference === "card"} onClick={() => setPaymentPreference("card")} icon={<CreditCard className="h-5 w-5" />} title="Test card route" text="Fictional reference only" /><PreferenceButton active={paymentPreference === "transfer"} onClick={() => setPaymentPreference("transfer")} icon={<Building2 className="h-5 w-5" />} title="Transfer preview" text="Display only" /><PreferenceButton active={paymentPreference === "collection"} onClick={() => setPaymentPreference("collection")} icon={<Store className="h-5 w-5" />} title="Collection preview" text="Display only" /></div>{paymentPreference === "card" && <div className="mt-5 grid gap-4 border-t border-[#d3b66f] pt-5 sm:grid-cols-2"><Field label="Fictional test cardholder" id="test-cardholder"><Input id="test-cardholder" value={testPayment.cardholder} onChange={event => updateTestPayment("cardholder", event.target.value)} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" autoComplete="off" /></Field><Field label="Fictional test reference" detail="format: DEMO-4242" id="test-reference"><Input id="test-reference" value={testPayment.reference} onChange={event => updateTestPayment("reference", event.target.value.toUpperCase())} className="mt-2 h-11 rounded-none border-slate-400 text-slate-950" autoComplete="off" aria-describedby={testPaymentError ? "test-payment-error" : undefined} /></Field></div>}{testPaymentError && <p id="test-payment-error" className="mt-4 text-sm font-bold text-red-800">{testPaymentError}</p>}<p className="mt-4 flex gap-2 border-t border-[#d3b66f] pt-4 text-xs font-medium leading-5 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#536a29]" />The prefilled sample reference is valid for this local visual demo. Nothing is charged, reserved, or sent to a payment provider.</p></fieldset>
        <Button type="submit" className="mt-7 h-12 w-full rounded-none bg-slate-950 text-white hover:bg-[#8f651c]"><CreditCard className="mr-2 h-4 w-4" />Confirm simulated test order</Button>
        {submitted && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#3f5d20]"><CheckCircle2 className="h-4 w-4" />Your enquiry is prepared. Review the WhatsApp message, then send only when ready.</p>}
        <a href="mailto:raosaqlaingee@gmail.com" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#72501b] hover:text-slate-950"><Mail className="h-4 w-4" />Prefer email? Contact raosaqlaingee@gmail.com</a>
      </form>
      <OrderSummary items={items} subtotal={subtotal} />
    </section>
  </main><Dialog open={paymentPreviewState !== "idle"} onOpenChange={open => { if (!open && paymentPreviewState !== "processing") setPaymentPreviewState("idle"); }}><DialogContent className="max-h-[88vh] overflow-y-auto rounded-none border-slate-950 bg-white p-7 sm:max-w-lg" showCloseButton={paymentPreviewState !== "processing"}>{paymentPreviewState === "processing" ? <div className="py-5 text-center"><LoaderCircle className="mx-auto h-10 w-10 animate-spin text-[#8f651c]" /><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#72501b]">Simulated checkout</p><DialogTitle className="mt-3 font-display text-4xl tracking-[-.045em] text-slate-950">Preparing your local test order…</DialogTitle><DialogDescription className="mt-3 leading-6 text-slate-700">This visual transition creates no payment, order, stock reservation, or delivery.</DialogDescription></div> : <><DialogHeader className="text-left"><CheckCircle2 className="h-10 w-10 text-[#536a29]" /><p className="mt-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#72501b]">Test order confirmation · {demoOrderReference}</p><DialogTitle className="font-display text-4xl tracking-[-.045em] text-slate-950">{paymentConfirmation.title}</DialogTitle><DialogDescription className="mt-2 leading-6 text-slate-700">{paymentConfirmation.detail} This browser-local simulation creates no real delivery commitment.</DialogDescription></DialogHeader><section className="mt-6 border-y border-slate-300 py-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Your selected items</p><p className="mt-1 text-sm font-extrabold text-slate-950">{items.length} item{items.length === 1 ? "" : "s"} in this test order</p></div><PackageCheck className="h-6 w-6 text-[#536a29]" /></div><div className="mt-4 space-y-3">{items.map(item => <div key={item.productId} className="flex gap-3"><img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" className="h-12 w-10 border border-slate-300 object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-extrabold text-slate-950">{item.name}</p><p className="mt-1 text-xs font-medium text-slate-700">Qty {item.quantity} · {item.sku}</p></div><p className="text-right text-sm font-extrabold text-slate-950">{formatCurrency(Number(item.price) * item.quantity)}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-slate-300 pt-4 text-sm font-extrabold text-slate-950"><span>Product subtotal</span><span>{formatCurrency(subtotal)}</span></div></section><div className="mt-5 grid gap-3 border border-[#d3b66f] bg-[#fffaf0] p-4 sm:grid-cols-2"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Planning delivery display</p><p className="mt-1 text-sm font-extrabold text-slate-950">{demoDeliveryEstimate}</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-700">Test payment route</p><p className="mt-1 text-sm font-extrabold text-slate-950">{paymentPreference === "card" ? "Fictional DEMO reference" : paymentPreferenceLabels[paymentPreference]}</p></div></div><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => setPaymentPreviewState("idle")} className="h-11 rounded-none border-slate-400 text-slate-950">Keep editing</Button><Button type="button" onClick={openWhatsAppEnquiry} className="h-11 rounded-none bg-slate-950 text-white hover:bg-[#8f651c]"><MessageCircle className="mr-2 h-4 w-4" />Open WhatsApp enquiry</Button></DialogFooter></>}</DialogContent></Dialog></StorefrontLayout>;
}

function Field({ children, detail, id, label }: { children: React.ReactNode; detail?: string; id: string; label: string }) {
  return <div><Label htmlFor={id} className="font-bold text-slate-900">{label}{detail && <span className="font-medium text-slate-600"> {detail}</span>}</Label>{children}</div>;
}

function PreferenceButton({ active, icon, onClick, text, title }: { active: boolean; icon: React.ReactNode; onClick: () => void; text: string; title: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`border p-4 text-left transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-400 bg-white text-slate-950 hover:border-[#8f651c] hover:bg-[#fffaf0]"}`}><span className={active ? "text-[#f0c767]" : "text-[#72501b]"}>{icon}</span><span className="mt-4 block text-sm font-extrabold">{title}</span><span className={active ? "mt-1 block text-xs leading-5 text-[#e2e9f1]" : "mt-1 block text-xs font-medium leading-5 text-slate-700"}>{text}</span></button>;
}

function OrderSummary({ items, subtotal }: { items: Array<{ imageUrl: string | null; name: string; price: number | string; productId: number; quantity: number; sku: string }>; subtotal: number }) {
  return <aside className="h-fit border border-[#b88d3c] bg-[#06111f] p-6 text-[#f9f5ea] shadow-[0_20px_45px_rgba(6,17,31,.2)] lg:sticky lg:top-28"><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#f0c767]">Test order summary</p><p className="mt-3 font-display text-3xl leading-none tracking-[-.025em] text-white">{items.length} selected item{items.length === 1 ? "" : "s"}</p><div className="mt-5 max-h-72 space-y-4 overflow-auto border-y border-[#f0c767]/35 py-5">{items.map(item => <div className="flex gap-3" key={item.productId}><img src={item.imageUrl || "/manus-storage/category-utility_fa340543.jpg"} alt="" loading="lazy" decoding="async" className="h-14 w-12 border border-[#f0c767]/35 object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-bold leading-5 text-[#fffdf8]">{item.name}</p><p className="mt-1 text-[11px] font-medium text-[#d2deea]">Qty {item.quantity} · {item.sku}</p></div><p className="text-right text-xs font-extrabold text-white">{formatCurrency(Number(item.price) * item.quantity)}</p></div>)}</div><div className="mt-5 flex justify-between text-base font-extrabold text-white"><span>Product subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-5 border-l-2 border-[#f0c767] bg-[#10243a] px-3 py-3 text-xs font-medium leading-5 text-[#e2eaf2]"><MapPin className="mb-1 h-4 w-4 text-[#f0c767]" /><p><span className="font-extrabold text-white">Illustrative delivery display:</span> {demoDeliveryEstimate}. It becomes a real delivery window only after stock and location are confirmed.</p></div><Link href="/cart" className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#f0c767] px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-[#ffe09a]">Return to basket <ArrowRight className="h-4 w-4" /></Link></aside>;
}
