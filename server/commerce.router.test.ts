import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "user" | "admin" = "user", authenticated = true): TrpcContext {
  return {
    user: authenticated
      ? {
          id: 7,
          openId: "commerce-test-user",
          name: "Commerce Test",
          email: "commerce@example.com",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("commerce router protections", () => {
  it("rejects cart access before any store operation when no user is authenticated", async () => {
    const caller = appRouter.createCaller(createContext("user", false));

    await expect(caller.cart.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("strictly denies regular users from the administrative order workspace", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.orders()).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Administrator access is required.",
    });
  });

  it("validates catalog route slugs before querying the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.catalog.bySlug({ slug: "Not A Valid Slug" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates a cart quantity before attempting to add an item", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.cart.add({ productId: 4, quantity: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects malformed order preparation input before creating an order", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.orders.prepare({ addressId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects out-of-range catalog pages before running a product query", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.catalog.list({ page: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
