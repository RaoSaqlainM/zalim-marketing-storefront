import { useAuth } from "@/_core/hooks/useAuth";
import { EmptyState } from "@/components/CommerceUI";
import StorefrontLayout from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type ReviewStatus = "all" | "pending" | "approved" | "rejected";

function Rating({ value }: { value: number }) {
  return <span className="inline-flex gap-1" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= value ? "fill-[#b88d3c] text-[#b88d3c]" : "text-slate-300"}`} />)}</span>;
}

export default function AdminReviews() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const utils = trpc.useUtils();
  const reviews = trpc.admin.reviews.useQuery(status === "all" ? undefined : { status }, { enabled: user?.role === "admin" });
  const moderate = trpc.admin.moderateReview.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.status === "approved" ? "Review approved and published." : "Review declined.");
      utils.admin.reviews.invalidate();
      utils.catalog.bySlug.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  if (loading) return <StorefrontLayout><main className="container py-14"><div className="h-80 animate-pulse bg-slate-100" /></main></StorefrontLayout>;
  if (user?.role !== "admin") return <StorefrontLayout><main className="container py-16"><EmptyState title="Zalim-Marketing administrator access required." text="Review moderation is reserved for authorised store administrators." action={{ label: "Return to catalogue", href: "/shop" }} /></main></StorefrontLayout>;

  return <StorefrontLayout><main className="container py-10 sm:py-14"><Link href="/admin" className="text-sm font-bold text-[#805d1e] hover:text-slate-950">← Return to operations</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Customer feedback</p><h1 className="mt-3 font-display text-5xl font-bold tracking-[-.065em] text-slate-950 sm:text-7xl">Review moderation</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Only approved submissions are visible on product pages. Do not publish promotional, misleading, copied or unrelated feedback.</p></div><div className="border border-[#d8c795] bg-[#f8f2df] px-4 py-3 text-sm text-[#73531b]"><b className="block">No synthetic reviews</b>All records below come from signed-in customer submissions.</div></div><div className="mt-9 flex flex-wrap gap-2 border-b border-slate-200 pb-5">{(["pending", "approved", "rejected", "all"] as ReviewStatus[]).map(item => <button key={item} onClick={() => setStatus(item)} className={`px-4 py-2 text-xs font-bold uppercase tracking-[.12em] transition ${status === item ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-600 hover:border-slate-950 hover:text-slate-950"}`}>{item}</button>)}</div>{reviews.isLoading ? <div className="mt-6 h-64 animate-pulse bg-slate-100" /> : reviews.data?.length ? <div className="mt-6 grid gap-4">{reviews.data.map(review => <article key={review.id} className="border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-3"><Rating value={review.rating} /><span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${review.status === "approved" ? "bg-emerald-100 text-emerald-800" : review.status === "rejected" ? "bg-red-100 text-red-800" : "bg-[#f1e5c1] text-[#78551b]"}`}>{review.status}</span></div><h2 className="mt-3 text-base font-bold text-slate-950">{review.title || "Customer review"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{review.body}</p></div><div className="min-w-48 text-xs leading-5 text-slate-500"><p><b className="text-slate-800">Product:</b> <Link href={`/products/${review.productSlug}`} className="font-semibold text-[#805d1e] hover:text-slate-950">{review.productName}</Link></p><p className="mt-1"><b className="text-slate-800">Submitted by:</b> {review.reviewerName || "Customer"}</p><p>{review.reviewerEmail || "No email available"}</p><p className="mt-1">{new Date(review.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>{review.status === "pending" && <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4"><Button size="sm" className="rounded-none bg-slate-950 text-white hover:bg-emerald-700" disabled={moderate.isPending} onClick={() => moderate.mutate({ reviewId: review.id, status: "approved" })}>{moderate.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}Approve & publish</Button><Button size="sm" variant="outline" className="rounded-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700" disabled={moderate.isPending} onClick={() => moderate.mutate({ reviewId: review.id, status: "rejected" })}><X className="mr-1.5 h-3.5 w-3.5" />Decline</Button></div>}</article>)}</div> : <div className="mt-6"><EmptyState title={`No ${status === "all" ? "customer review" : status} submissions found.`} text="Customer reviews will appear here after a signed-in customer submits one from a product page." /></div>}</main></StorefrontLayout>;
}
