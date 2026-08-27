import "dotenv/config";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { confirmStripeOrder } from "./commerce";
import { parseStripeWebhookEvent, stripeWebhookConfigured, verifyStripeWebhookSignature } from "./payments";
import { getPostgresConnectionString } from "./db";
import { getPreviewCatalogUrl, shouldProxyPreviewCatalog } from "./_core/previewCatalogProxy";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.get(["/health", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = req.headers["stripe-signature"];
    const configured = stripeWebhookConfigured();
    if (!configured || !Buffer.isBuffer(rawBody) || !verifyStripeWebhookSignature(rawBody, typeof signature === "string" ? signature : undefined, process.env.STRIPE_WEBHOOK_SECRET || "")) {
      res.status(400).json({ error: "Invalid Stripe webhook signature." });
      return;
    }
    const event = parseStripeWebhookEvent(rawBody);
    if (!event) {
      res.status(400).json({ error: "Invalid Stripe webhook payload." });
      return;
    }
    try {
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const orderId = Number(event.data.object.metadata?.orderId);
        if (Number.isInteger(orderId) && orderId > 0) await confirmStripeOrder({ orderId, checkoutSessionId: event.data.object.id, paymentIntentId: event.data.object.payment_intent });
      }
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Stripe] Webhook handling failed", error);
      res.status(500).json({ error: "Webhook processing failed." });
    }
  });
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", async (req, res, next) => {
    if (!shouldProxyPreviewCatalog({ method: req.method, path: req.path, nodeEnv: process.env.NODE_ENV, hasPostgresConnection: Boolean(getPostgresConnectionString()) })) {
      next();
      return;
    }
    try {
      const response = await fetch(getPreviewCatalogUrl(req.originalUrl));
      const body = await response.text();
      res.status(response.status).type(response.headers.get("content-type") || "application/json").send(body);
    } catch (error) {
      console.error("[Preview catalogue proxy]", error);
      res.status(502).json({ error: "The preview catalogue is temporarily unavailable." });
    }
  });
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    console.error("[Server] Unhandled request error", error);
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(500).json({ error: "Unexpected server error." });
  });
  return app;
}

const app = createApp();

export default app;
