import { describe, expect, it } from "vitest";
import { getPostgresConnectionString } from "./db";

describe("getPostgresConnectionString", () => {
    it("prefers a Render Postgres URL over the managed local MySQL URL", () => {
        expect(getPostgresConnectionString({
            DATABASE_URL: "mysql://managed-preview.example/database",
            RENDER_DATABASE_URL: "postgresql://render.example/zalim",
        })).toBe("postgresql://render.example/zalim");
    });

    it("accepts a Postgres DATABASE_URL in production", () => {
        expect(getPostgresConnectionString({
            DATABASE_URL: "postgres://render.example/zalim",
        })).toBe("postgres://render.example/zalim");
    });

    it("rejects a MySQL URL when no Postgres connection is supplied", () => {
        expect(getPostgresConnectionString({
            DATABASE_URL: "mysql://managed-preview.example/database",
        })).toBeUndefined();
    });
});
