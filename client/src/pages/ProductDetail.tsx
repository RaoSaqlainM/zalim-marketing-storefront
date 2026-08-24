import { useAuth } from "@/_core/hooks/useAuth";
import ProductCard from "@/components/ProductCard";
import StorefrontLayout from "@/components/StorefrontLayout";
import { BackLink, BreadCrumbs, QuantityControl, SectionHeading } from "@/components/CommerceUI";
import { Button } from "@/components/ui/button";
import { addGuestBasketItem } from "@/lib/guestBasket";
import { distinctSpecificationProducts, isMotorOilProduct } from "@/lib/productOptions";
import { discountedPercent, formatCurrency, productImage, type StoreProduct } from "@/lib/store";
import { productSlugFromLocation } from "@/lib/productRoute";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ChevronDown, CircleCheck, MessageCircle, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
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
  const slug = productSlugFromLocation(location);
  const productQuery = trpc.catalog.bySlug.useQuery({ slug });
  const productForOptions = productQuery.data as DetailProduct | null | undefined;
  const motorOil = isMotorOilProduct(productForOptions);
  const oilCatalogue = trpc.catalog.list.useQuery({ categorySlug: "fluids-maintenance", sort: "name", page: 1, pageSize: 48 }, { enabled: motorOil });
  const featured = trpc.catalog.featured.useQuery();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  if (productQuery.isLoading) return <StorefrontLayout><main className="container py-8 sm:py-12" aria-busy="true" aria-label="Loading product details"><div className="h-3 w-48 animate-pulse bg-slate-200" /><section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(23rem,.94fr)] lg:gap-14"><div><div className="aspect-[.98] animate-pulse border border-slate-200 bg-[#f3f0e8]" /><div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3">{[0, 1, 2].map(item => <div className="h-10 animate-pulse bg-slate-100" key={item} />)}</div></div><article className="lg:pt-1"><div className="h-3 w-24 animate-pulse bg-slate-200" /><div className="mt-5 h-20 max-w-xl animate-pulse bg-slate-200" /><div className="mt-5 h-5 w-40 animate-pulse bg-slate-100" /><div className="mt-7 h-16 animate-pulse border-y border-slate-200 bg-slate-50" /><div className="mt-6 h-24 animate-pulse border-y border-slate-200 bg-slate-50" /><div className="mt-6 h-12 animate-pulse bg-slate-950" /><p className="mt-4 text-sm font-semibold text-slate-500">Loading product details and availability…</p></article></section></main></StorefrontLayout>;
  const product = productQuery.data as DetailProduct | null;
  if (!product) return <StorefrontLayout><main className="container py-12 sm:py-16"><BackLink href="/shop" label="Back to catalogue" /><h1 className="mt-8 font-display text-5xl font-bold tracking-[-.06em] text-slate-950">That product is unavailable.</h1><p className="mt-4 max-w-xl leading-7 text-slate-600">The item you requested may no longer be part of the current Zalim-Marketing catalogue.</p><Link href="/shop" className="mt-7 inline-flex h-11 items-center bg-slate-950 px-5 text-sm font-bold text-white">Explore the catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link></main></StorefrontLayout>;

  const gallery = product.images?.length ? product.images.map(image => image.url) : [productImage(product)];
  const sale = discountedPercent(product);
  const vehicleExamples = String(product.specifications?.VehicleExamples || "Review the technical specification before ordering.");
  const enquiry = encodeURIComponent(`Hello Saqlain, I would like to ask about ${product.name} (${product.sku}). I am interested in ${quantity} item${quantity === 1 ? "" : "s"}. My vehicle is: `);
  const supportLink = `https://wa.me/923255531155?text=${enquiry}`;
  const reviewSummary = product.reviewSummary || { reviewCount: 0, averageRating: 0 };
  const oilProducts = ((oilCatalogue.data?.products || []) as StoreProduct[]).filter(candidate => isMotorOilProduct(candidate) && candidate.brand?.slug === product.brand?.slug);
  const oilGradeChoices = distinctSpecificationProducts(oilProducts, "Grade", product.slug);
  const oilCapacityChoices = distinctSpecificationProducts(oilProducts, "Volume", product.slug);
  const oilQualityChoices = distinctSpecificationProducts(oilProducts, "Quality", product.slug);

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
          <div className="border-b border-slate-200 py-5"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#9a7027]">Vehicle fit and compatibility</p><p className="mt-2 text-sm leading-6 text-slate-700">{vehicleExamples}</p><p className="mt-2 text-xs leading-5 text-slate-500">Vehicle Finder helps you browse. Before you enquire, compare the product details with your vehicle and installation needs.</p></div>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-800">{product.stockQuantity > 0 ? <><CircleCheck className="h-4 w-4 text-[#7d9a42]" />Available to request · {product.stockQuantity} currently listed</> : <><span className="h-2 w-2 bg-red-600" />Currently unavailable</>}</div>
          {motorOil && <section className="mt-6 border border-[#ddd4c2] bg-[#fbfaf6] p-5 sm:p-6"><p className="eyebrow">Choose the right oil</p><h2 className="mt-2 font-display text-3xl font-bold leading-[.92] tracking-[-.045em] text-slate-950">Match grade, pack size and quality first.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Each choice opens a separately listed product with its own price and stock. Confirm your handbook specification before adding an oil to your enquiry.</p>{oilCatalogue.isLoading ? <p className="mt-5 text-sm font-semibold text-slate-500">Loading oil choices…</p> : <div className="mt-5 grid gap-5"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-slate-500">Oil grade</p><div className="mt-2 flex flex-wrap gap-2">{oilGradeChoices.map(choice => <Link key={choice.value} href={`/products/${choice.product.slug}`} aria-current={choice.product.slug === product.slug ? "page" : undefined} className={`border px-3 py-2 text-sm font-bold transition ${choice.product.slug === product.slug ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-[#b88d3c]"}`}>{choice.value}</Link>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.13em] text-slate-500">Pack size</p><div className="mt-2 flex flex-wrap gap-2">{oilCapacityChoices.map(choice => <Link key={choice.value} href={`/products/${choice.product.slug}`} aria-current={choice.product.slug === product.slug ? "page" : undefined} className={`border px-3 py-2 text-sm font-bold transition ${choice.product.slug === product.slug ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-[#b88d3c]"}`}>{choice.value}</Link>)}</div></div>{oilQualityChoices.length > 1 && <div><p className="text-xs font-bold uppercase tracking-[.13em] text-slate-500">Quality</p><div className="mt-2 flex flex-wrap gap-2">{oilQualityChoices.map(choice => <Link key={choice.value} href={`/products/${choice.product.slug}`} aria-current={choice.product.slug === product.slug ? "page" : undefined} className={`border px-3 py-2 text-sm font-bold transition ${choice.product.slug === product.slug ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-[#b88d3c]"}`}>{choice.value}</Link>)}</div></div>}</div>}</section>}
          <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-[auto_1fr] sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-slate-500">Quantity</p><div className="mt-2 flex items-center gap-3"><QuantityControl value={quantity} max={Math.max(1, product.stockQuantity)} onChange={setQuantity} /><span className="text-xs leading-5 text-slate-500">Choose up to the listed stock.</span></div></div><Button className="h-12 rounded-none bg-slate-950 text-white hover:bg-[#b88d3c]" disabled={product.stockQuantity < 1} onClick={() => { addGuestBasketItem({ productId: product.id, slug: product.slug, name: product.name, sku: product.sku, price: Number(product.price), quantity, imageUrl: product.imageUrl || productImage(product) }); toast.success(`Added ${quantity} item${quantity === 1 ? "" : "s"} to your guest basket.`); }}><PackageCheck className="mr-2 h-4 w-4" />{product.stockQuantity < 1 ? "Currently unavailable" : `Add ${quantity} to guest basket`}</Button></div>
          <a href={supportLink} target="_blank" rel="noreferrer" className="mt-3 flex h-12 items-center justify-center border border-[#b88d3c] text-sm font-bold text-[#7b591d] transition hover:bg-[#f9f4e5]"><MessageCircle className="mr-2 h-4 w-4" />Ask a quick question on WhatsApp</a>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">No payment is taken here. Add items, then we confirm stock, fit and delivery with you.</p>
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
          <div className="mt-10 border border-slate-200 bg-white p-5 sm:p-7"><p className="eyebrow">Share your experience</p><h3 className="mt-2 font-display text-3xl font-bold tracking-[-.045em] text-slate-950">Verified feedback only</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">To keep this store genuine, feedback is accepted only after a confirmed purchase and moderation. Email the team with your order reference and product experience.</p><a href="mailto:raosaqlaingee@gmail.com?subject=Verified%20product%20feedback" className="mt-5 inline-flex h-11 items-center border border-slate-950 px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-950 hover:text-white">Email verified feedback</a></div>
        </div>
      </section>

      <section className="mt-16 border-t border-slate-200 pt-12"><SectionHeading eyebrow="Complete the journey" title="More useful essentials" action={{ label: "View full catalogue", href: "/shop" }} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{((featured.data || []) as StoreProduct[]).filter(item => item.id !== product.id).slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div></section>
    </main>
  </StorefrontLayout>;
}
