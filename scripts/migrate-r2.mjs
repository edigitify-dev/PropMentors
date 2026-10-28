import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Pool } from "pg";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const apply = process.argv.includes("--apply");
const env = process.env;
const publicUrl = env.R2_PUBLIC_URL?.replace(/\/$/, "");
const bucket = env.R2_BUCKET_NAME;
const progressFile = ".r2-migration-progress.json";
const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".gif": "image/gif", ".ico": "image/x-icon" };
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const encodePath = (value) => value.split("/").map(encodeURIComponent).join("/");
const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10000 }) : undefined;

async function readJson(filename, fallback) {
  try { return JSON.parse(await fs.readFile(filename, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

async function saveJson(filename, value, mode = 0o644) {
  await fs.writeFile(`${filename}.tmp`, JSON.stringify(value, null, 2) + "\n", { mode });
  await fs.rename(`${filename}.tmp`, filename);
}

function imageSources(value, visit) {
  if (Array.isArray(value)) value.forEach((item) => imageSources(item, visit));
  else if (value && typeof value === "object") {
    if (typeof value.src === "string") visit(value.src);
    Object.values(value).forEach((item) => imageSources(item, visit));
  }
}

async function main() {
  if (apply && (!publicUrl || !bucket || !env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY)) {
    throw new Error("Configure R2_ENDPOINT, R2_BUCKET_NAME, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY first.");
  }
  const sources = new Map();
  const aliases = new Map();
  const add = (source, alias = source) => { sources.set(source, source); aliases.set(alias, source); };
  async function scan(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await scan(filename);
      else if (entry.isFile() && types[path.extname(filename).toLowerCase()]) {
        const relative = path.relative("public", filename).split(path.sep).join("/");
        add(filename, `/${relative}`);
        add(filename, `/${encodePath(relative)}`);
        add(filename, relative);
      }
    }
  }
  await scan("public");
  // App-router icons are assets too, even though Next serves them outside public/.
  for (const filename of ["src/app/icon.svg", "src/app/favicon.ico"]) {
    try { await fs.access(filename); add(filename, `/${path.basename(filename)}`); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const legacy = await readJson("cloudinary-map.json", {});
  for (const [alias, url] of Object.entries(legacy)) {
    add(url);
    add(url, alias);
    add(url, `/Website Images/${alias}`);
    add(url, `/Website%20Images/${encodePath(alias)}`);
  }
  for (const entry of await readJson("src/data/archive-cloudinary-backup.json", [])) add(entry.url);
  const rows = pool ? (await pool.query("SELECT id, payload, updated_at FROM projects ORDER BY id")).rows : [];
  for (const row of rows) imageSources(row.payload, (src) => {
    if (publicUrl && src.startsWith(`${publicUrl}/`)) return;
    if (/^https:\/\//.test(src)) add(src);
    else if (src.startsWith("/") && !aliases.has(src)) {
      const local = `public/${decodeURIComponent(src.slice(1))}`;
      if (sources.has(local)) aliases.set(src, local);
      else throw new Error(`Project ${row.id} references an image with no source: ${src}`);
    }
  });
  console.log(`Inventory: ${sources.size} sources, ${aliases.size} references, ${rows.length} database projects.`);
  if (!apply) { console.log("Dry run only. Add --apply to upload, verify, and switch image references."); return; }

  const client = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }, maxAttempts: 3 });
  const previous = await readJson(progressFile, {});
  const target = `${env.R2_ENDPOINT}/${bucket}|${publicUrl}`;
  const progress = previous.target === target ? previous : { target, completed: {}, objects: {} };
  const map = {};
  let saveQueue = Promise.resolve();
  let completed = 0;
  let uploaded = 0;
  let cursor = 0;
  const queue = [...sources.keys()];
  const inFlight = new Map();

  async function verify(url, expected) {
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`Public verification returned HTTP ${response.status}`);
    if (hash(Buffer.from(await response.arrayBuffer())) !== expected) throw new Error("Public image SHA-256 does not match its source");
  }

  async function migrate(source) {
    const remote = /^https:\/\//.test(source);
    let bytes;
    let contentType;
    if (remote) {
      const response = await fetch(source, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`Source download returned HTTP ${response.status}`);
      contentType = response.headers.get("content-type")?.split(";")[0];
      if (!contentType?.startsWith("image/")) throw new Error("Remote source is not an image");
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      bytes = await fs.readFile(source);
      contentType = types[path.extname(source).toLowerCase()];
    }
    const sha256 = hash(bytes);
    // Deduplicate equal bytes and use immutable object keys so existing files are safe.
    const extension = Object.entries(types).find(([, type]) => type === contentType)?.[0] ?? ".img";
    const key = `propmentors/images/${sha256}${extension}`;
    const url = `${publicUrl}/${key}`;
    if (!inFlight.has(key)) inFlight.set(key, (async () => {
      let exists = false;
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        exists = head.Metadata?.sha256 === sha256 && head.ContentLength === bytes.length;
        if (!exists) throw new Error(`Existing object has unexpected content: ${key}`);
      } catch (error) { if (error.$metadata?.httpStatusCode !== 404) throw error; }
      if (!exists) {
        await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable", Metadata: { sha256 }, IfNoneMatch: "*" }));
        uploaded++;
      }
      await verify(url, sha256);
      progress.objects[key] = { sha256, bytes: bytes.length, url };
    })());
    await inFlight.get(key);
    progress.completed[source] = { url, sha256, bytes: bytes.length };
    const verifiedCount = ++completed;
    // Serialize snapshots and write atomically so interrupted runs are resumable.
    saveQueue = saveQueue.then(() => saveJson(progressFile, progress, 0o600));
    await saveQueue;
    if (verifiedCount % 25 === 0 || verifiedCount === queue.length) console.log(`Verified ${verifiedCount}/${queue.length} sources (${uploaded} new objects).`);
    return url;
  }

  try {
    const failures = [];
    const results = new Map();
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (cursor < queue.length) {
        const source = queue[cursor++];
        for (let attempt = 1; attempt <= 3; attempt++) {
          try { results.set(source, await migrate(source)); break; }
          catch (error) {
            // A failed promise must be replaceable on the next retry.
            for (const [key, promise] of inFlight) { try { await promise; } catch { inFlight.delete(key); } }
            if (attempt === 3) { failures.push(source); console.error(`Failed: ${source}: ${error.message}`); }
            else await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      }
    }));
    await saveQueue;
    if (failures.length) throw new Error(`${failures.length} sources failed. References have not been switched; rerun to resume.`);
    for (const [alias, source] of aliases) map[alias] = results.get(source);
    await saveJson("r2-map.json", Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))));

    if (pool) {
      const db = await pool.connect();
      try {
        await db.query("BEGIN");
        const current = (await db.query("SELECT id, payload, updated_at FROM projects ORDER BY id FOR UPDATE")).rows;
        const changes = [];
        for (const row of current) {
          const payload = structuredClone(row.payload);
          let changed = false;
          function replace(value) {
            if (Array.isArray(value)) value.forEach(replace);
            else if (value && typeof value === "object") {
              if (typeof value.src === "string" && map[value.src]) { value.src = map[value.src]; changed = true; }
              Object.values(value).forEach(replace);
            }
          }
          replace(payload);
          if (changed) changes.push({ row, payload });
        }
        if (changes.length) {
          const backup = `.r2-migration-backup-${Date.now()}.json`;
          await saveJson(backup, changes.map(({ row }) => row), 0o600);
          for (const { row, payload } of changes) await db.query("UPDATE projects SET payload=$2, updated_at=date_trunc('milliseconds', now()) WHERE id=$1", [row.id, JSON.stringify(payload)]);
          console.log(`Database backup: ${backup}`);
        }
        await db.query("COMMIT");
        console.log(`Updated image references in ${changes.length} projects; project details and publication status preserved.`);
      } catch (error) { await db.query("ROLLBACK"); throw error; }
      finally { db.release(); }
    }
    console.log(`Migration complete: ${completed} verified sources, ${Object.keys(progress.objects).length} unique objects, ${Object.keys(map).length} mapped references.`);
  } finally { client.destroy(); }
}

try { await main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await pool?.end(); }
