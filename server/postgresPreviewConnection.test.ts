import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { getPostgresConnectionString } from "./db";

const connectionString = getPostgresConnectionString();
const pool = connectionString ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } }) : null;

afterAll(async () => {
    await pool?.end();
});

describe("Render Postgres preview connection", () => {
    it("uses a valid Postgres secret when preview access is configured", async () => {
        if (!connectionString) {
            expect(pool).toBeNull();
            return;
        }
        expect(connectionString).toMatch(/^postgres(?:ql)?:\/\//i);
        const result = await pool?.query<{ ready: number }>("select 1 as ready");
        expect(result?.rows[0]?.ready).toBe(1);
    });
});
