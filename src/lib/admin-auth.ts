import "server-only";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "./db";
import type { AdminIdentity } from "./admin-types";

const scrypt = promisify(scryptCallback);
const cookieName = "propmentors_admin";
const sessionLifetime = 60 * 60 * 24 * 7;
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  const actual = await scrypt(password, salt, 64) as Buffer;
  const buffer = Buffer.from(expected, "hex");
  return buffer.length === actual.length && timingSafeEqual(buffer, actual);
}
export async function hasAdmin() {
  const { rows } = await database().query("SELECT 1 FROM admin_users LIMIT 1");
  return rows.length > 0;
}
export async function getAdmin(): Promise<AdminIdentity | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await database().query<AdminIdentity>(
    "SELECT a.id, a.name, a.email FROM admin_sessions s JOIN admin_users a ON a.id = s.admin_id WHERE s.token_hash = $1 AND s.expires_at > now()", [tokenHash(token)],
  );
  return rows[0] ?? null;
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
export async function createSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  await database().query("DELETE FROM admin_sessions WHERE expires_at <= now()");
  await database().query("INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES ($1, $2, $3)", [tokenHash(token), adminId, new Date(Date.now() + sessionLifetime * 1000)]);
  (await cookies()).set(cookieName, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionLifetime,
  });
}
export async function deleteSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token) await database().query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash(token)]);
  store.delete(cookieName);
}
