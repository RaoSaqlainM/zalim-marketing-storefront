import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "drizzle/0000_lumpy_pestilence.sql"), "utf8");

describe("Render Postgres baseline migration", () => {
  it("creates the order status enum before the tables that use it", () => {
    expect(migration).toContain('CREATE TYPE "public"."order_status"');
    expect(migration.indexOf('CREATE TYPE "public"."order_status"')).toBeLessThan(migration.indexOf('CREATE TABLE "orders"'));
    expect(migration.indexOf('CREATE TYPE "public"."order_status"')).toBeLessThan(migration.indexOf('CREATE TABLE "orderStatusHistory"'));
  });

  it("creates the catalogue tables and their lookup indexes", () => {
    expect(migration).toContain('CREATE TABLE "categories"');
    expect(migration).toContain('CREATE TABLE "brands"');
    expect(migration).toContain('CREATE TABLE "products"');
    expect(migration).toContain('CREATE INDEX "products_catalog_idx"');
  });
});
