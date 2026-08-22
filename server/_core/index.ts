import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { confirmStripeOrder } from "../commerce";
import { parseStripeWebhookEvent, stripeWebhookConfigured, verifyStripeWebhookSignature } from "../payments";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.get("/health", (_req, res) => {
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
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
