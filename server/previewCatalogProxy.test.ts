import { describe, expect, it } from "vitest";
import { getPreviewCatalogUrl, shouldProxyPreviewCatalog } from "./_core/previewCatalogProxy";

describe("preview catalogue proxy", () => {
  it("proxies only public catalogue reads when development has no Postgres URL", () => {
    expect(shouldProxyPreviewCatalog({ method: "GET", path: "/catalog.categories,catalog.featured", nodeEnv: "development", hasPostgresConnection: false })).toBe(true);
    expect(shouldProxyPreviewCatalog({ method: "GET", path: "/catalog.categories,auth.me", nodeEnv: "development", hasPostgresConnection: false })).toBe(false);
    expect(shouldProxyPreviewCatalog({ method: "POST", path: "/catalog.categories", nodeEnv: "development", hasPostgresConnection: false })).toBe(false);
    expect(shouldProxyPreviewCatalog({ method: "GET", path: "/catalog.categories", nodeEnv: "production", hasPostgresConnection: false })).toBe(false);
    expect(shouldProxyPreviewCatalog({ method: "GET", path: "/catalog.categories", nodeEnv: "development", hasPostgresConnection: true })).toBe(false);
  });

  it("preserves the requested procedure and query input when forwarding", () => {
    expect(getPreviewCatalogUrl("/api/trpc/catalog.list?input=%7B%7D")).toBe("https://zalim-marketing-demo.onrender.com/api/trpc/catalog.list?input=%7B%7D");
  });
});
