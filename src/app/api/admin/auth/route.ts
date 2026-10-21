import { randomUUID, timingSafeEqual } from "node:crypto";
import { database } from "@/lib/db";
import { createSession, deleteSession, hashPassword, tokenHash, verifyPassword } from "@/lib/admin-auth";
import { ApiError, apiResponse, checkOrigin, rateLimit, readJson, requestClient } from "@/lib/api-utils";
import { loginSchema, setupSchema } from "@/lib/admin-validation";

export async function POST(request: Request) {
  return apiResponse(async () => {
    checkOrigin(request);
    const setup = new URL(request.url).searchParams.get("setup") === "true";
    if (setup) {
      await rateLimit(`setup:${requestClient(request)}`, 10);
      const data = await readJson(request, setupSchema);
      const configuredKey = process.env.ADMIN_SETUP_TOKEN;
      if (!configuredKey || !timingSafeEqual(Buffer.from(tokenHash(data.setupKey)), Buffer.from(tokenHash(configuredKey)))) throw new ApiError(403, "The setup key is incorrect.");
      const client = await database().connect();
      const id = randomUUID();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(83749201)");
        const existing = await client.query("SELECT 1 FROM admin_users LIMIT 1");
        if (existing.rowCount) throw new ApiError(409, "An administrator already exists. Please sign in.");
        await client.query("INSERT INTO admin_users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)", [id, data.name, data.email, await hashPassword(data.password)]);
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
      await createSession(id);
    } else {
      const data = await readJson(request, loginSchema);
      await rateLimit(`login:${data.email}`, 10);
      await rateLimit(`login-client:${requestClient(request)}`, 100);
      const { rows } = await database().query("SELECT id, password_hash FROM admin_users WHERE email = $1", [data.email]);
      // An unknown account still performs the same password derivation.
      const fallback = "7b5a41ff06d11809fcbdd09a01367a2e:" + "0".repeat(128);
      const valid = await verifyPassword(data.password, rows[0]?.password_hash ?? fallback);
      if (!rows[0] || !valid) throw new ApiError(401, "The email or password is incorrect.");
      await createSession(rows[0].id);
    }
    return Response.json({ ok: true });
  });
}

export async function DELETE(request: Request) {
  return apiResponse(async () => { checkOrigin(request); await deleteSession(); return Response.json({ ok: true }); });
}
