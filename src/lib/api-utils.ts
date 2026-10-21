import "server-only";
import { z } from "zod";
import { database } from "./db";
import { getAdmin, tokenHash } from "./admin-auth";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function checkOrigin(request: Request) {
  const expected = process.env.APP_URL ? new URL(process.env.APP_URL).origin : new URL(request.url).origin;
  if (request.headers.get("origin") !== expected) throw new ApiError(403, "This request must come from this website.");
}
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Send JSON content.");
  const buffer = await readBody(request, 1_000_000);
  let body: unknown;
  try { body = JSON.parse(buffer.toString("utf8")); } catch { throw new ApiError(400, "Invalid JSON content."); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, `${issue.path.join(" · ")}: ${issue.message}`);
  }
  return parsed.data;
}
export async function readBody(request: Request, maxBytes: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, "The submitted content is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function rateLimit(key: string, limit: number, minutes = 15) {
  const { rows } = await database().query<{ count: number }>(
    `INSERT INTO request_limits (key, count, expires_at) VALUES ($1, 1, now() + $2 * interval '1 minute')
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN request_limits.expires_at <= now() THEN 1 ELSE request_limits.count + 1 END,
       expires_at = CASE WHEN request_limits.expires_at <= now() THEN EXCLUDED.expires_at ELSE request_limits.expires_at END
     RETURNING count`, [tokenHash(key), minutes],
  );
  if (rows[0].count > limit) throw new ApiError(429, "Too many attempts. Please try again in a few minutes.");
}
export function requestClient(request: Request) {
  return process.env.TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "direct";
}
export async function apiResponse(action: () => Promise<Response>) {
  try { return await action(); }
  catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    if ((error as { code?: string }).code === "23505") return Response.json({ error: "That URL or email is already in use. Choose another." }, { status: 409 });
    console.error("Request failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn’t save your changes. Please try again." }, { status: 500 });
  }
}
export async function adminMutation(request: Request) {
  checkOrigin(request);
  const admin = await getAdmin();
  if (!admin) throw new ApiError(401, "Your session has expired. Please sign in again.");
  return admin;
}
