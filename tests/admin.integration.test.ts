import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import { userInfo } from "node:os";
import { Pool } from "pg";
import { projects } from "../src/data/projects";
import { defaultContactDetails } from "../src/lib/admin-types";
import { newProject } from "../src/lib/new-project";

// Always uses a separate database. The configured application DATABASE_URL is never used.
const controlUrl = process.env.TEST_DATABASE_URL || `postgresql://${encodeURIComponent(userInfo().username)}@localhost:5432/postgres`;
const control = new Pool({ connectionString: controlUrl });
const name = `propmentors_test_${randomBytes(6).toString("hex")}`;
const testUrl = new URL(controlUrl); testUrl.pathname = `/${name}`;
const port = Number(process.env.TEST_PORT || 3117);
const origin = `http://localhost:${port}`;
const setupKey = randomBytes(32).toString("hex");
const password = randomBytes(24).toString("hex");
const email = "admin@example.test";
let pool: Pool;
let server: ChildProcess | undefined;
let cookie = "";
let logs = "";
let created = false;

async function request(path: string, method = "GET", body?: unknown, authenticated = true, requestOrigin = origin) {
  return fetch(`${origin}${path}`, {
    method, redirect: "manual",
    headers: { Origin: requestOrigin, ...(body ? { "Content-Type": "application/json" } : {}), ...(authenticated && cookie ? { Cookie: cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

before(async () => {
  await control.query(`CREATE DATABASE "${name}"`); created = true;
  pool = new Pool({ connectionString: testUrl.toString() });
  await pool.query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
  await pool.query("INSERT INTO contact_settings (id, payload) VALUES (1,$1)", [JSON.stringify(defaultContactDetails)]);
  const p = projects[0];
  await pool.query("INSERT INTO projects (id,slug,name,location,space_type,status,payload) VALUES ($1,$2,$3,$4,$5,'published',$6)", [p.id, p.slug, p.name, p.location, p.spaceType || p.category, JSON.stringify(p)]);
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
    cwd: process.cwd(), env: { ...process.env, NODE_ENV: "production", DATABASE_URL: testUrl.toString(), ADMIN_SETUP_TOKEN: setupKey, APP_URL: origin, CLOUDINARY_API_KEY: "", CLOUDINARY_API_SECRET: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", (data) => { logs = (logs + data).slice(-12000); });
  server.stderr?.on("data", (data) => { logs = (logs + data).slice(-12000); });
  for (let i = 0; i < 100; i++) {
    try { if ((await request("/admin/login")).status < 500) return; } catch {}
    if (server.exitCode !== null) throw new Error(`Test server stopped: ${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Test server did not start: ${logs}`);
}, { timeout: 30_000 });

after(async () => {
  if (server && server.exitCode === null) {
    const stopped = new Promise<void>((resolve) => server!.once("exit", () => resolve()));
    server.kill("SIGTERM");
    await stopped;
  }
  if (pool) await pool.end();
  if (created) await control.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  await control.end();
});

test("PostgreSQL admin and public website workflows", async (t) => {
  await t.test("unauthenticated pages and every mutation are protected", async () => {
    for (const path of ["/admin", "/admin/projects", "/admin/enquiries", "/admin/contact"]) {
      const response = await request(path);
      assert.equal(response.status, 307); assert.equal(response.headers.get("location"), "/admin/login");
    }
    for (const [path, method] of [["/api/admin/projects", "POST"], ["/api/admin/projects/unknown", "PUT"], ["/api/admin/contact", "PUT"], [`/api/admin/enquiries/${randomUUID()}`, "PATCH"], ["/api/admin/uploads", "POST"], ["/api/migrate-cloudinary", "POST"]]) {
      assert.equal((await request(path, method, {})).status, 401, path);
    }
  });
  await t.test("first-run setup requires a key, hashes the password, and closes permanently", async () => {
    assert.equal((await request("/api/admin/auth?setup=true", "POST", { name: "Test Admin", email, password, setupKey: "wrong" })).status, 403);
    const response = await request("/api/admin/auth?setup=true", "POST", { name: "Test Admin", email, password, setupKey });
    assert.equal(response.status, 200, await response.text());
    const setCookie = response.headers.get("set-cookie")!;
    assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=lax/i); assert.match(setCookie, /Secure/i);
    cookie = setCookie.split(";")[0];
    const { rows } = await pool.query("SELECT password_hash FROM admin_users");
    assert.notEqual(rows[0].password_hash, password); assert.match(rows[0].password_hash, /^[a-f0-9]+:[a-f0-9]+$/);
    assert.equal((await request("/api/admin/auth?setup=true", "POST", { name: "Other", email: "other@example.test", password, setupKey })).status, 409);
    assert.equal((await request("/admin")).status, 200);
  });
  await t.test("cross-origin requests and invalid project input are rejected", async () => {
    assert.equal((await request("/api/admin/contact", "PUT", defaultContactDetails, true, "https://untrusted.example")).status, 403);
    assert.equal((await request("/api/admin/projects", "POST", { project: {}, status: "published" })).status, 400);
  });
  const draft = newProject(randomUUID());
  draft.name = "Integration Studio"; draft.slug = "integration-studio"; draft.locationLabel = "Sector 125, Noida";
  draft.detail.description = "A quiet studio for focused work and thoughtful teams.";
  draft.detail.location.address = "Sector 125, Noida"; draft.detail.location.directionsQuery = "Sector 125, Noida";
  let updatedAt: string;
  await t.test("drafts persist in PostgreSQL and remain hidden publicly", async () => {
    const response = await request("/api/admin/projects", "POST", { project: draft, status: "draft" });
    assert.equal(response.status, 201, await response.text());
    const { rows } = await pool.query("SELECT payload, status, updated_at FROM projects WHERE id=$1", [draft.id]);
    assert.equal(rows[0].payload.name, draft.name); assert.equal(rows[0].status, "draft"); updatedAt = rows[0].updated_at.toISOString();
    assert.equal((await request(`/projects/${draft.slug}`)).status, 404);
    assert(!(await (await request("/projects")).text()).includes(draft.name));
  });
  await t.test("publishing updates listings, detail pages, metadata, and homepage", async () => {
    const response = await request(`/api/admin/projects/${draft.id}`, "PUT", { project: draft, status: "published", updatedAt });
    assert.equal(response.status, 200, await response.clone().text()); updatedAt = (await response.json()).updatedAt;
    const page = await request(`/projects/${draft.slug}`); assert.equal(page.status, 200);
    const html = await page.text(); assert(html.includes(draft.name)); assert(html.includes(draft.detail.description));
    assert((await (await request("/projects")).text()).includes(draft.name));
    assert((await (await request("/")).text()).includes(draft.name));
  });
  await t.test("URL conflicts and stale saves are rejected; old URLs survive renaming", async () => {
    assert.equal((await request("/api/admin/projects", "POST", { project: { ...draft, id: randomUUID() }, status: "draft" })).status, 409);
    const previousSlug = draft.slug;
    draft.slug = "integration-studio-renamed";
    const response = await request(`/api/admin/projects/${draft.id}`, "PUT", { project: draft, status: "published", updatedAt });
    assert.equal(response.status, 200); const version = (await response.json()).updatedAt;
    assert.equal((await request(`/projects/${previousSlug}`)).status, 200);
    assert.equal((await request(`/projects/${draft.slug}`)).status, 200);
    assert.equal((await request(`/api/admin/projects/${draft.id}`, "PUT", { project: draft, status: "published", updatedAt })).status, 409);
    updatedAt = version;
  });
  let enquiryId: string;
  await t.test("contact and project enquiries are validated and saved", async () => {
    assert.equal((await request("/api/enquiries", "POST", { email: "invalid" }, false)).status, 400);
    const enquiry = { name: "Aditi Rao", email: "aditi@example.test", phone: "+91 9999999999", subject: "A new workspace", message: "We need room for a team of 20.", source: "project", projectId: draft.id };
    assert.equal((await request("/api/enquiries", "POST", enquiry, false)).status, 201);
    assert.equal((await request("/api/enquiries", "POST", { ...enquiry, source: "contact", projectId: undefined, email: "contact@example.test" }, false)).status, 201);
    const { rows } = await pool.query("SELECT id, status FROM enquiries WHERE email=$1", [enquiry.email]);
    assert.equal(rows[0].status, "new"); enquiryId = rows[0].id;
    assert((await (await request("/admin/enquiries")).text()).includes(enquiry.message));
  });
  await t.test("enquiry notes and status persist; contact settings appear on the public site", async () => {
    assert.equal((await request(`/api/admin/enquiries/${enquiryId}`, "PATCH", { status: "contacted", notes: "Site visit on Friday" })).status, 200);
    const { rows } = await pool.query("SELECT status, notes FROM enquiries WHERE id=$1", [enquiryId]); assert.equal(rows[0].status, "contacted"); assert.equal(rows[0].notes, "Site visit on Friday");
    const details = { ...defaultContactDetails, phone: "+91 9876543210", email: "updated@example.test", heading: "Let’s find your space", address: "Studio 42, New Delhi" };
    assert.equal((await request("/api/admin/contact", "PUT", details)).status, 200);
    const html = await (await request("/contact")).text(); assert(html.includes(details.heading)); assert(html.includes(details.email)); assert(html.includes(details.address));
    assert((await (await request("/")).text()).includes(details.email));
  });
  await t.test("archived projects disappear and reject new project enquiries", async () => {
    const response = await request(`/api/admin/projects/${draft.id}`, "PUT", { project: draft, status: "archived", updatedAt }); assert.equal(response.status, 200);
    assert.equal((await request(`/projects/${draft.slug}`)).status, 404);
    assert.equal((await request("/api/enquiries", "POST", { name: "Test", email: "archived@example.test", phone: "9999999999", subject: "Visit", message: "Please arrange a visit", source: "project", projectId: draft.id }, false)).status, 400);
  });
  await t.test("login rejects wrong passwords and sign-out revokes the server session", async () => {
    assert.equal((await request("/api/admin/auth", "POST", { email, password: "incorrect" }, false)).status, 401);
    const login = await request("/api/admin/auth", "POST", { email, password }, false); assert.equal(login.status, 200);
    const newCookie = login.headers.get("set-cookie")!.split(";")[0]; assert.notEqual(newCookie, cookie);
    cookie = newCookie;
    assert.equal((await request("/api/admin/auth", "DELETE")).status, 200);
    assert.equal((await request("/admin")).status, 307);
    assert.equal((await request("/api/admin/contact", "PUT", defaultContactDetails)).status, 401);
  });
  await t.test("login and enquiry attempts are rate limited in PostgreSQL", async () => {
    for (let i = 0; i < 10; i++) assert.equal((await request("/api/admin/auth", "POST", { email: "missing@example.test", password: "wrong" }, false)).status, 401);
    assert.equal((await request("/api/admin/auth", "POST", { email: "missing@example.test", password: "wrong" }, false)).status, 429);
    const enquiry = { name: "Test", email: "limit@example.test", phone: "9999999999", subject: "Test", message: "Test message", source: "contact" };
    for (let i = 0; i < 5; i++) assert.equal((await request("/api/enquiries", "POST", enquiry, false)).status, 201);
    assert.equal((await request("/api/enquiries", "POST", enquiry, false)).status, 429);
  });
  if (process.env.ADMIN_BROWSER_CHECK) await t.test("browser workflow and responsive presentation", async () => {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [process.env.ADMIN_BROWSER_CHECK!], { stdio: "inherit", env: { ...process.env, ADMIN_TEST_ORIGIN: origin, ADMIN_TEST_EMAIL: email, ADMIN_TEST_PASSWORD: password } });
      child.on("error", reject); child.on("exit", (code) => code === 0 ? resolve() : reject(new Error("Browser checks failed")));
    });
  });
});
