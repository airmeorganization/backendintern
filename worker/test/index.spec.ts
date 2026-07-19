import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect, vi } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Worker API", () => {
    it("responds with Not Found for unknown route", async () => {
        const request = new IncomingRequest("http://example.com/unknown");
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toContain("Not Found");
    });

    it("handles OPTIONS request for CORS", async () => {
        const request = new IncomingRequest("http://example.com/api/v1/internships", {
            method: "OPTIONS",
        });
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
        expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    it("responds with 500 when Supabase throws on missing URL", async () => {
        const request = new IncomingRequest("http://example.com/api/v1/internships");
        const ctx = createExecutionContext();
        // we didn't mock env, so it will throw error
        const response = await worker.fetch(request, env as any, ctx);
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(500);
    });
});
