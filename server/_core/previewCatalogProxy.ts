const previewCatalogOrigin = "https://zalim-marketing-demo.onrender.com";

export function shouldProxyPreviewCatalog(input: { method: string; path: string; nodeEnv?: string; hasPostgresConnection: boolean }) {
  const procedures = input.path.replace(/^\//, "").split(",").filter(Boolean);
  return input.nodeEnv === "development"
    && !input.hasPostgresConnection
    && input.method === "GET"
    && procedures.length > 0
    && procedures.every(procedure => procedure.startsWith("catalog."));
}

export function getPreviewCatalogUrl(originalUrl: string) {
  return new URL(originalUrl, previewCatalogOrigin).toString();
}
