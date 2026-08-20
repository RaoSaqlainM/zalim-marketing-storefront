import { useAuth } from "@/_core/hooks/useAuth";
import ProductCard from "@/components/ProductCard";
import StorefrontLayout from "@/components/StorefrontLayout";
import { BackLink, BreadCrumbs, QuantityControl, SectionHeading } from "@/components/CommerceUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check, ChevronDown, CircleCheck, Loader2, MessageCircle, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

type DetailReview = {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  reviewerName: string | null;
  createdAt: Date;
};

type DetailProduct = StoreProduct & {
  images: Array<{ id: number; url: string; altText: string | null; position: number }>;
  reviewSummary: { reviewCount: number; averageRating: number };
  reviews: DetailReview[];
};

function Stars({ rating, label = false }: { rating: number; label?: boolean }) {
  const rounded = Math.round(rating);
  return <span className="inline-flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= rounded ? "fill-[#b88d3c] text-[#b88d3c]" : "text-slate-300"}`} />)}
    {label && <span className="ml-1 text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>}
  </span>;
}

function displayReviewerName(name: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) || [];
  if (!parts.length) return "Verified customer";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1][0]}.`;
}

export default function ProductDetail() {
  const [location] = useLocation();
  const slug = location.split("/").at(-1) || "";
  const productQuery = trpc.catalog.bySlug.useQuery({ slug });
  const featured = trpc.catalog.featured.useQuery();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const add = trpc.cart.add.useMutation({ onSuccess: () => { utils.cart.get.invalidate(); toast.success("Added to your basket."); }, onError: error => toast.error(error.message) });
  const submitReview = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      setReviewRating(5);
      setReviewTitle("");
      setReviewBody("");
      toast.success("Thank you. Your review was submitted for moderation.");
      utils.catalog.bySlug.invalidate({ slug });
    },
    onError: error => toast.error(error.message),
  });

  if (productQuery.isLoading) return <StorefrontLayout><div className="container py-10 sm:py-14"><div className="h-[35rem] animate-pulse bg-slate-100" /></div></StorefrontLayout>;
  const product = productQuery.data as DetailProduct | null;
  if (!product) return <StorefrontLayout><main className="container py-12 sm:py-16"><BackLink href="/shop" label="Back to catalogue" /><h1 className="mt-8 font-display text-5xl font-bold tracking-[-.06em] text-slate-950">That product is unavailable.</h1><p className="mt-4 max-w-xl leading-7 text-slate-600">The item you requested may no longer be part of the current Zalim-Marketing catalogue.</p><Link href="/shop" className="mt-7 inline-flex h-11 items-center bg-slate-950 px-5 text-sm font-bold text-white">Explore the catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link></main></StorefrontLayout>;

  const gallery = product.images?.length ? product.images.map(image => image.url) : [productImage(product)];
  const sale = discountedPercent(product);
  const vehicleExamples = String(product.specifications?.VehicleExamples || "Review the technical specification before ordering.");
  const enquiry = encodeURIComponent(`Hello Saqlain, I would like to ask about ${product.name} (${product.sku}). I am interested in ${quantity} item${quantity === 1 ? "" : "s"}. My vehicle is: `);
  const supportLink = `https://wa.me/923255531155?text=${enquiry}`;
  const reviewSummary = product.reviewSummary || { reviewCount: 0, averageRating: 0 };

  return <StorefrontLayout>
    <main className="container py-8 sm:py-12">
      <BreadCrumbs items={[{ label: "Home", href: "/" }, { label: "Catalogue", href: "/shop" }, ...(product.category ? [{ label: product.category.name, href: `/collections/${product.category.slug}` }] : []), { label: product.name }]} />
      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(23rem,.94fr)] lg:gap-14">
        <div>
          <div className="grid gap-3 sm:grid-cols-[5.5rem_1fr]">
            <div className="order-2 flex gap-2 sm:order-1 sm:flex-col">{gallery.map((image, index) => <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === index} className={`overflow-hidden border-2 ${activeImage === index ? "border-[#b88d3c]" : "border-slate-200"}`}><img src={image} alt="" loading="lazy" decoding="async" className="aspect-square w-16 object-cover sm:w-full" /></button>)}</div>
            <div className="order-1 overflow-hidden border border-slate-200 bg-[#f3f0e8] sm:order-2"><img src={gallery[activeImage]} alt={product.name} decoding="async" className="aspect-[.98] w-full object-cover" /></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3">
            <div className="flex gap-2"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7027]" /><p className="text-[11px] leading-4 text-slate-600"><b className="block text-slate-950">Practical delivery</b>Discuss timing and destination before confirming.</p></div>
            <div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7027]" /><p className="text-[11px] leading-4 text-slate-600"><b className="block text-slate-950">Clear information</b>Check the item details and fit notes first.</p></div>
            <div className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7027]" /><p className="text-[11px] leading-4 text-slate-600"><b className="block text-slate-950">Need help?</b>Contact us for a fit or delivery question.</p></div>
          </div>
        </div>
        <article className="lg:pt-1">
          <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{product.brand?.name || "Zalim selection"}</p>{product.isNew && <span className="bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white">New</span>}</div>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[.9] tracking-[-.065em] text-slate-950 sm:text-6xl">{product.name}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">{product.shortDescription}</p>
          <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#8c651e]">{reviewSummary.reviewCount ? <><Stars rating={reviewSummary.averageRating} label /><span className="text-slate-500">{reviewSummary.reviewCount} review{reviewSummary.reviewCount === 1 ? "" : "s"}</span></> : <><Stars rating={0} /><span className="text-slate-500">No published reviews yet</span></>}</a>
          <div className="mt-7 flex items-end gap-3 border-y border-slate-200 py-5"><span className="font-display text-4xl font-bold tracking-[-.045em] text-slate-950">{formatCurrency(product.price)}</span>{product.compareAtPrice && <span className="mb-1 text-sm text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}{sale && <span className="mb-1 bg-[#f2e7c5] px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#78551b]">Save {sale}%</span>}</div>
          <div className="border-b border-slate-200 py-5"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#9a7027]">Vehicle fit and compatibility</p><p className="mt-2 text-sm leading-6 text-slate-700">{vehicleExamples}</p><p className="mt-2 text-xs leading-5 text-slate-500">Vehicle Finder narrows your browse; always compare the product specifications, vehicle dimensions and installation requirements before sending an enquiry.</p></div>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-800">{product.stockQuantity > 0 ? <><CircleCheck className="h-4 w-4 text-[#7d9a42]" />Available to request · {product.stockQuantity} currently listed</> : <><span className="h-2 w-2 bg-red-600" />Currently unavailable</>}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]"><QuantityControl value={quantity} max={Math.max(1, product.stockQuantity)} onChange={setQuantity} /><Button className="h-12 rounded-none bg-slate-950 text-white hover:bg-[#b88d3c]" disabled={product.stockQuantity < 1 || add.isPending} onClick={() => isAuthenticated ? add.mutate({ productId: product.id, quantity }) : startLogin()}>{add.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageCheck className="mr-2 h-4 w-4" />}{product.stockQuantity < 1 ? "Currently unavailable" : "Add to basket"}</Button></div>
          <a href={supportLink} target="_blank" rel="noreferrer" className="mt-3 flex h-12 items-center justify-center border border-[#b88d3c] text-sm font-bold text-[#7b591d] transition hover:bg-[#f9f4e5]"><MessageCircle className="mr-2 h-4 w-4" />Ask about fit or delivery on WhatsApp</a>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">Zalim-Marketing takes a product enquiry first. No payment details are collected on this website.</p>
          <div className="mt-7 border-t border-slate-200"><button className="flex w-full items-center justify-between py-5 text-left font-bold text-slate-950" onClick={() => setDescriptionOpen(current => !current)}>Product detail <ChevronDown className={`h-4 w-4 transition ${descriptionOpen ? "rotate-180" : ""}`} /></button>{descriptionOpen && <p className="max-w-xl pb-5 text-sm leading-7 text-slate-600">{product.description}</p>}</div>
          <div className="border-t border-slate-200"><p className="py-5 font-bold text-slate-950">Technical specification</p><dl className="grid grid-cols-2 gap-x-6 gap-y-3 pb-6 text-sm">{Object.entries(product.specifications || {}).map(([key, value]) => <div className="border-b border-slate-200 pb-2" key={key}><dt className="text-xs text-slate-500">{key}</dt><dd className="mt-1 font-semibold text-slate-800">{String(value)}</dd></div>)}</dl></div>
          <section className="mt-4 border border-[#ddd4c2] bg-[#f5f1e7] p-5 sm:p-6"><p className="eyebrow">Before you send an enquiry</p><h2 className="mt-3 font-display text-3xl font-bold leading-[.9] tracking-[-.045em] text-slate-950">Make this part work for the way you travel.</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="border-t border-[#d7ccb7] pt-3"><b className="text-xs text-slate-950">1. Use case</b><p className="mt-2 text-xs leading-5 text-slate-600">Tell us whether this is for the daily drive, a work vehicle, touring or an emergency kit.</p></div><div className="border-t border-[#d7ccb7] pt-3"><b className="text-xs text-slate-950">2. Vehicle detail</b><p className="mt-2 text-xs leading-5 text-slate-600">Share your make, model and year wherever a fit question matters.</p></div><div className="border-t border-[#d7ccb7] pt-3"><b className="text-xs text-slate-950">3. Destination</b><p className="mt-2 text-xs leading-5 text-slate-600">Include your city or collection preference so delivery can be discussed clearly.</p></div></div></section>
        </article>
      </section>

      <section id="reviews" className="mt-16 border-y border-slate-200 bg-[#fbfaf6] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
            <div><p className="eyebrow">Customer feedback</p><h2 className="mt-3 font-display text-4xl font-bold leading-[.9] tracking-[-.055em] text-slate-950">Real notes from the road.</h2><p className="mt-4 text-sm leading-6 text-slate-600">Reviews appear here only after a customer submits them and the Zalim-Marketing team approves them. There are no pre-written or sample reviews.</p><div className="mt-6 flex items-center gap-3">{reviewSummary.reviewCount ? <><Stars rating={reviewSummary.averageRating} /><div><p className="font-display text-3xl font-bold text-slate-950">{reviewSummary.averageRating.toFixed(1)}</p><p className="text-xs text-slate-500">from {reviewSummary.reviewCount} published review{reviewSummary.reviewCount === 1 ? "" : "s"}</p></div></> : <div className="border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">No published reviews yet</div>}</div></div>
            <div className="space-y-4">{product.reviews?.length ? product.reviews.map(review => <article key={review.id} className="border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><Stars rating={review.rating} /><p className="mt-2 text-sm font-bold text-slate-950">{review.title || "Customer review"}</p></div><p className="text-xs text-slate-500">{displayReviewerName(review.reviewerName)} · {new Date(review.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p></article>) : <article className="border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">Be the first verified customer to share a genuine experience with this product. Your submission will be reviewed before publication.</article>}</div>
          </div>
          <div className="mt-10 border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Share your experience</p><h3 className="mt-2 font-display text-3xl font-bold tracking-[-.045em] text-slate-950">Write a genuine review</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Only submit feedback based on your own experience. Every review is moderated before it becomes public.</p></div>{!isAuthenticated && <Button onClick={startLogin} className="h-11 rounded-none bg-slate-950 text-white hover:bg-[#b88d3c]">Sign in to review</Button>}</div>
            {isAuthenticated && <form className="mt-6 grid gap-5" onSubmit={event => { event.preventDefault(); submitReview.mutate({ productId: product.id, rating: reviewRating, title: reviewTitle.trim() || null, body: reviewBody.trim() }); }}><div><p className="text-sm font-bold text-slate-950">Your star rating</p><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map(star => <button type="button" key={star} onClick={() => setReviewRating(star)} aria-label={`Rate ${star} out of 5`} className="rounded-sm p-1 transition hover:bg-[#f5f1e7]"><Star className={`h-7 w-7 ${star <= reviewRating ? "fill-[#b88d3c] text-[#b88d3c]" : "text-slate-300"}`} /></button>)}</div></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="review-title" className="text-sm font-bold text-slate-950">Review title <span className="font-normal text-slate-500">optional</span></label><Input id="review-title" className="mt-2 h-11 rounded-none border-slate-300" maxLength={160} value={reviewTitle} onChange={event => setReviewTitle(event.target.value)} placeholder="Summarise your experience" /></div><div className="flex items-end"><p className="pb-2 text-xs leading-5 text-slate-500">Your displayed name is shortened for privacy. A review can be submitted once per product.</p></div></div><div><label htmlFor="review-body" className="text-sm font-bold text-slate-950">Your review</label><Textarea id="review-body" className="mt-2 min-h-32 rounded-none border-slate-300" minLength={40} maxLength={3000} value={reviewBody} onChange={event => setReviewBody(event.target.value)} placeholder="Tell other drivers what you found useful, how you used the product, and any fitment context." required /><p className="mt-2 text-xs text-slate-500">{reviewBody.length}/3000 characters · minimum 40 characters</p></div><div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={submitReview.isPending || reviewBody.trim().length < 40} className="h-11 rounded-none bg-slate-950 text-white hover:bg-[#b88d3c]">{submitReview.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Submit for review</Button><p className="text-xs leading-5 text-slate-500">Submitting means you confirm this feedback is your own honest experience.</p></div></form>}
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-slate-200 pt-12"><SectionHeading eyebrow="Complete the journey" title="More useful essentials" action={{ label: "View full catalogue", href: "/shop" }} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{((featured.data || []) as StoreProduct[]).filter(item => item.id !== product.id).slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div></section>
    </main>
  </StorefrontLayout>;
}
