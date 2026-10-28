import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import sharp from "sharp";
import nextEnv from "@next/env";
import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

nextEnv.loadEnvConfig(process.cwd());
const apply = process.argv.includes("--apply");
const env = process.env;
const root = "public/All Projects Images";
let sourceBackup = { assets: [] };
try { sourceBackup = JSON.parse(await fs.readFile("src/data/project-source-backup.json", "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const mapping = JSON.parse(await fs.readFile("src/data/project-image-folders.json", "utf8"));
const catalog = JSON.parse(await fs.readFile("src/data/building-catalog.json", "utf8"));
const duplicates = JSON.parse(await fs.readFile("src/data/project-duplicates.json", "utf8"));
const imageMap = JSON.parse(await fs.readFile("r2-map.json", "utf8"));
const knownUrls = new Set(Object.values(imageMap));
const publicUrl = env.R2_PUBLIC_URL?.replace(/\/$/, "");
const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const encodePath = (src) => src.split("/").map(encodeURIComponent).join("/");
const jobs = [];
const manifest = {};
const usedFolders = new Set();

async function sourceFiles(folder) {
  try { return await fs.readdir(path.join(root, folder)); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    const files = sourceBackup.assets.filter((asset) => asset.path.startsWith(`${folder}/`)).map((asset) => asset.path.slice(folder.length + 1));
    if (!files.length) throw new Error(`No local or archived source images for ${folder}.`);
    return files;
  }
}

async function readSource(job) {
  try { return await fs.readFile(path.join(root, job.folder, job.file)); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    const source = sourceBackup.assets.find((asset) => asset.path === `${job.folder}/${job.file}`);
    if (!source) throw new Error(`No archived source image for ${job.folder}/${job.file}.`);
    const response = await fetch(source.url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`Archived source image returned HTTP ${response.status}.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== source.sha256) throw new Error(`Archived source hash mismatch: ${source.path}`);
    return bytes;
  }
}

for (const [slug, collection] of Object.entries(mapping)) {
  if (!catalog.some((building) => building.slug === slug) || duplicates[slug]) throw new Error(`Unknown current project: ${slug}`);
  const files = (await sourceFiles(collection.folder))
    .filter((file) => types[path.extname(file).toLowerCase()] && !collection.exclude?.includes(file))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (!files.includes(collection.cover)) throw new Error(`Missing cover: ${slug}/${collection.cover}`);
  files.splice(files.indexOf(collection.cover), 1);
  files.unshift(collection.cover);
  const inputs = files.map((file) => ({ folder: collection.folder, file, isInterior: collection.interiors?.includes(file) ?? false }));
  usedFolders.add(collection.folder);
  for (const additional of collection.additional ?? []) {
    usedFolders.add(additional.folder);
    for (const file of additional.files) inputs.push({ folder: additional.folder, file, isInterior: additional.interiors?.includes(file) ?? false });
  }
  manifest[slug] = { folder: collection.folder, images: new Array(inputs.length) };
  for (const [index, input] of inputs.entries()) jobs.push({ slug, index, ...input });
}

const unmatchedProjects = catalog.filter((building) => !duplicates[building.slug] && !mapping[building.slug]).map(({ slug, name, sector }) => ({ slug, name, sector }));
let sourceFolders;
try { sourceFolders = (await fs.readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  sourceFolders = [...new Set(sourceBackup.assets.map((asset) => asset.path.split("/")[0]))];
}
const unmatchedFolders = sourceFolders.filter((folder) => !usedFolders.has(folder)).sort();
console.log(`Matched ${Object.keys(mapping).length} projects and ${jobs.length} photographs. ${unmatchedProjects.length} projects have no matching folder; ${unmatchedFolders.length} folders have no current project.`);

async function saveJson(filename, value) {
  await fs.writeFile(`${filename}.tmp`, JSON.stringify(value, null, 2) + "\n");
  await fs.rename(`${filename}.tmp`, filename);
}

async function main() {
  if (!apply) { console.log("Dry run only. Add --apply to upload, verify, and update the project photos."); return; }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required to update project records.");
  if (!env.R2_ENDPOINT || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !publicUrl) throw new Error("Configure the R2 environment variables first.");
  const client = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }, maxAttempts: 3 });
  const objects = new Map();
  let uploaded = 0;
  let completed = 0;
  let cursor = 0;
  let optimizedBytes = 0;
  let originalBytes = 0;

  function ensureObject(bytes, contentType) {
    const hash = sha256(bytes);
    const extension = Object.entries(types).find(([, type]) => type === contentType)?.[0];
    if (!extension) throw new Error(`Unsupported image type: ${contentType}`);
    const key = `propmentors/images/${hash}${extension}`;
    const url = `${publicUrl}/${key}`;
    if (!objects.has(key)) objects.set(key, (async () => {
      let exists = false;
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
        exists = head.Metadata?.sha256 === hash && head.ContentLength === bytes.length;
        if (!exists) throw new Error(`Existing image has unexpected metadata: ${key}`);
      } catch (error) { if (error.$metadata?.httpStatusCode !== 404) throw error; }
      if (!exists) {
        await client.send(new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, Body: bytes, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable", Metadata: { sha256: hash }, IfNoneMatch: "*" }));
        uploaded++;
      }
      // URLs in the published migration map have already passed public hash verification.
      if (!exists || !knownUrls.has(url)) {
        const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error(`Public image verification returned HTTP ${response.status}`);
        if (sha256(Buffer.from(await response.arrayBuffer())) !== hash) throw new Error(`Public image hash mismatch: ${key}`);
      }
      return url;
    })());
    return objects.get(key);
  }

  try {
    const workers = await Promise.allSettled(Array.from({ length: 6 }, async () => {
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        const bytes = await readSource(job);
        const originalHash = sha256(bytes);
        const originalUrl = await ensureObject(bytes, types[path.extname(job.file).toLowerCase()]);
        const { data, info } = await sharp(bytes).rotate().resize({ width: 1920, height: 1440, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
        const url = await ensureObject(data, "image/webp");
        const originalPath = `/${job.folder}/${job.file}`;
        for (const alias of [`/All Projects Images${originalPath}`, `/All%20Projects%20Images/${encodePath(`${job.folder}/${job.file}`)}`]) imageMap[alias] = originalUrl;
        manifest[job.slug].images[job.index] = { file: job.file, src: url, width: info.width, height: info.height, isInterior: job.isInterior, sourceFolder: job.folder, sourceSha256: originalHash, sha256: sha256(data), bytes: info.size };
        optimizedBytes += info.size;
        originalBytes += bytes.length;
        const count = ++completed;
        if (count % 25 === 0 || count === jobs.length) console.log(`Prepared and verified ${count}/${jobs.length} photographs (${uploaded} new R2 objects).`);
      }
    }));
    const failure = workers.find((worker) => worker.status === "rejected");
    if (failure) throw failure.reason;
    for (const collection of Object.values(manifest)) {
      const seen = new Set();
      collection.images = collection.images.filter((image) => {
        if (seen.has(image.sha256)) return false;
        seen.add(image.sha256);
        return true;
      });
    }
    const report = { sourceDirectory: root, matchedProjects: Object.keys(mapping).length, photographs: Object.values(manifest).reduce((count, collection) => count + collection.images.length, 0), originalBytes, optimizedBytes, unmatchedProjects, unmatchedFolders, notes: ["Candor TechSpace photos are assigned only to Sector 135; Sector 62 keeps its existing photographs.", "ATS Bouquet is not the Sector 135 ATS Tower. Bhutani Cyberthum is not Bhutani Cyber Park.", "UTC supplementary photographs use the previously reviewed whitelist; NPX and UTP-project-11 are excluded."] };
    await saveJson("r2-map.json", Object.fromEntries(Object.entries(imageMap).sort(([a], [b]) => a.localeCompare(b))));
    await saveJson("src/data/supplied-project-images.json", manifest);
    await saveJson("docs/project-image-update-report.json", report);
    console.log(`Published ${report.photographs} optimized photographs for ${report.matchedProjects} projects (${(optimizedBytes / 1024 / 1024).toFixed(1)} MB; originals retained).`);
    // A fresh process loads the newly published manifest before changing the DB.
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/sync-project-images.ts", "--apply"], { stdio: "inherit", env: process.env });
      child.on("error", reject);
      child.on("exit", resolve);
    });
    if (code !== 0) throw new Error("Project database update failed; the verified images and manifest are ready for retry.");
  } finally { client.destroy(); }
}

try { await main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
