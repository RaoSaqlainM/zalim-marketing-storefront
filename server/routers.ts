import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as commerce from "./commerce";
import { isStripeConfigured } from "./payments";
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
    }
    return next({ ctx });
});
const slug = z.string().trim().min(2).max(240).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const addressInput = z.object({
    id: z.number().int().positive().optional(),
    label: z.string().trim().min(2).max(80),
    recipientName: z.string().trim().min(2).max(160),
    phone: z.string().trim().min(7).max(50),
    line1: z.string().trim().min(4).max(255),
    line2: z.string().trim().max(255).nullable().optional(),
    city: z.string().trim().min(2).max(120),
    region: z.string().trim().max(120).nullable().optional(),
    postalCode: z.string().trim().max(40).nullable().optional(),
    country: z.string().trim().length(2).default("PK"),
    isDefault: z.boolean().default(false),
});
const productInput = z.object({
    name: z.string().trim().min(3).max(220),
    slug,
    sku: z.string().trim().min(2).max(80),
    shortDescription: z.string().trim().max(500).nullable().optional(),
    description: z.string().trim().max(12000).nullable().optional(),
    specifications: z.record(z.string(), z.string()).nullable().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price."),
    compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    stockQuantity: z.number().int().min(0).default(0),
    imageUrl: z.string().url().nullable().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    brandId: z.number().int().positive().nullable().optional(),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isActive: z.boolean().default(true),
});
const reviewInput = z.object({
    productId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().min(3).max(160).nullable().optional(),
    body: z.string().trim().min(40).max(3000),
});
export const appRouter = router({
    system: systemRouter,
    auth: router({
        me: publicProcedure.query(opts => opts.ctx.user),
        logout: publicProcedure.mutation(({ ctx }) => {
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
            return {
                success: true,
            } as const;
        }),
    }),
    catalog: router({
        list: publicProcedure
            .input(z.object({
            query: z.string().trim().max(120).optional(),
            categorySlug: slug.optional(),
            brandSlug: slug.optional(),
            minPrice: z.number().min(0).optional(),
            maxPrice: z.number().min(0).optional(),
            sort: z.enum(["featured", "newest", "price-asc", "price-desc", "name"]).optional(),
            page: z.number().int().min(1).optional(),
            pageSize: z.number().int().min(1).max(48).optional(),
        }))
            .query(({ input }) => commerce.listCatalog(input)),
        bySlug: publicProcedure.input(z.object({ slug })).query(({ input }) => commerce.getProductBySlug(input.slug)),
        featured: publicProcedure.query(() => commerce.getFeaturedCatalog("featured")),
        newArrivals: publicProcedure.query(() => commerce.getFeaturedCatalog("new")),
        suggestions: publicProcedure.input(z.object({ query: z.string().trim().max(120) })).query(({ input }) => commerce.searchSuggestions(input.query)),
        categories: publicProcedure.query(() => commerce.listCategories()),
        brands: publicProcedure.query(() => commerce.listBrands()),
    }),
    reviews: router({
        forProduct: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => Promise.all([commerce.getProductReviewSummary(input.productId), commerce.listApprovedProductReviews(input.productId)]).then(([summary, reviews]) => ({ summary, reviews }))),
        submit: protectedProcedure.input(reviewInput).mutation(({ ctx, input }) => commerce.submitProductReview(ctx.user.id, input)),
    }),
    cart: router({
        get: protectedProcedure.query(({ ctx }) => commerce.getCartForUser(ctx.user.id)),
        add: protectedProcedure.input(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).mutation(({ ctx, input }) => commerce.addCartItem(ctx.user.id, input.productId, input.quantity)),
        update: protectedProcedure.input(z.object({ cartItemId: z.number().int().positive(), quantity: z.number().int().min(0).max(99) })).mutation(({ ctx, input }) => commerce.updateCartItem(ctx.user.id, input.cartItemId, input.quantity)),
        remove: protectedProcedure.input(z.object({ cartItemId: z.number().int().positive() })).mutation(({ ctx, input }) => commerce.removeCartItem(ctx.user.id, input.cartItemId)),
    }),
    addresses: router({
        list: protectedProcedure.query(({ ctx }) => commerce.listAddresses(ctx.user.id)),
        save: protectedProcedure.input(addressInput).mutation(({ ctx, input }) => commerce.saveAddress(ctx.user.id, input)),
        remove: protectedProcedure.input(z.object({ addressId: z.number().int().positive() })).mutation(({ ctx, input }) => commerce.deleteAddress(ctx.user.id, input.addressId)),
    }),
    orders: router({
        prepare: protectedProcedure.input(z.object({ addressId: z.number().int().positive() })).mutation(({ ctx, input }) => commerce.createPendingOrder(ctx.user.id, input.addressId)),
        mine: protectedProcedure.query(({ ctx }) => commerce.listOrdersForUser(ctx.user.id)),
        detail: protectedProcedure.input(z.object({ orderNumber: z.string().trim().min(6).max(40) })).query(({ ctx, input }) => commerce.getOrderForUser(ctx.user.id, input.orderNumber)),
    }),
    payments: router({
        status: publicProcedure.query(() => ({ stripeConfigured: isStripeConfigured() })),
        startCheckout: protectedProcedure.input(z.object({ addressId: z.number().int().positive() })).mutation(({ ctx, input }) => {
            const forwardedHost = String(ctx.req.headers["x-forwarded-host"] || ctx.req.headers.host || "").split(",")[0];
            const forwardedProto = String(ctx.req.headers["x-forwarded-proto"] || ctx.req.protocol || "https").split(",")[0];
            if (!forwardedHost)
                throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The checkout return URL could not be determined." });
            return commerce.startStripeCheckout(ctx.user.id, input.addressId, `${forwardedProto}://${forwardedHost}`);
        }),
    }),
    admin: router({
        catalog: adminProcedure.input(z.object({ page: z.number().int().min(1).optional(), pageSize: z.number().int().min(1).max(48).optional() })).query(({ input }) => commerce.listCatalog({ ...input, includeInactive: true, sort: "newest" })),
        orders: adminProcedure.query(() => commerce.listAdminOrders()),
        reviews: adminProcedure.input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).optional()).query(({ input }) => commerce.listAdminProductReviews(input?.status)),
        moderateReview: adminProcedure.input(z.object({ reviewId: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(({ ctx, input }) => commerce.moderateProductReview(ctx.user.id, input.reviewId, input.status)),
        createCategory: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(120), slug, description: z.string().trim().max(4000).nullable().optional(), imageUrl: z.string().url().nullable().optional(), isFeatured: z.boolean().optional(), sortOrder: z.number().int().min(0).optional() })).mutation(({ input }) => commerce.createCategory(input)),
        createBrand: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(120), slug, description: z.string().trim().max(4000).nullable().optional(), logoUrl: z.string().url().nullable().optional() })).mutation(({ input }) => commerce.createBrand(input)),
        createProduct: adminProcedure.input(productInput).mutation(({ input }) => commerce.createProduct(input)),
        updateProduct: adminProcedure.input(z.object({ id: z.number().int().positive(), changes: productInput.partial() })).mutation(({ input }) => commerce.updateProduct(input.id, input.changes)),
        updateOrderStatus: adminProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]), note: z.string().trim().max(500).optional(), trackingNumber: z.string().trim().max(255).optional() })).mutation(({ input }) => commerce.updateOrderStatus(input.orderId, input.status, input.note, input.trackingNumber)),
    }),
});
export type AppRouter = typeof appRouter;
