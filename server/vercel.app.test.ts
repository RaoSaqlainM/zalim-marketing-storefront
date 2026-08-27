import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { readFile } from "node:fs/promises";
import app, { createApp } from "./app";

let server: Server;
let baseUrl = "";

beforeAll(async () => {
  server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

describe("Vercel application entry", () => {
  it("constructs an Express app without starting a listener", () => {
    expect(typeof createApp()).toBe("function");
  });

  it("serves the root and function health routes", async () => {
    const [rootResponse, apiResponse] = await Promise.all([fetch(`${baseUrl}/health`), fetch(`${baseUrl}/api/health`)]);
    expect(rootResponse.status).toBe(200);
    expect(apiResponse.status).toBe(200);
    await expect(rootResponse.json()).resolves.toEqual({ status: "ok" });
    await expect(apiResponse.json()).resolves.toEqual({ status: "ok" });
  });

  it("keeps the Vite SPA output and API routes separate in Vercel configuration", async () => {
    const rawConfig = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
    const config = JSON.parse(rawConfig) as { framework?: string; buildCommand?: string; outputDirectory?: string; rewrites?: Array<{ source: string; destination: string }> };
    expect(config.framework).toBe("vite");
    expect(config.buildCommand).toBe("pnpm build:client");
    expect(config.outputDirectory).toBe("dist/public");
    expect(config.rewrites).toEqual(expect.arrayContaining([
      { source: "/health", destination: "/api/health" },
      { source: "/:path((?!api(?:/|$)|health(?:/|$)).*)", destination: "/index.html" },
    ]));
  });
});
