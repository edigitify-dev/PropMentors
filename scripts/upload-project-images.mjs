import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !key || !secret) throw new Error("Configure Cloudinary in .env.local first.");

const manifest = JSON.parse(await fs.readFile("src/data/archive-project-images.json", "utf8"));
const map = JSON.parse(await fs.readFile("cloudinary-map.json", "utf8"));
let uploaded = 0;
let pendingSave = Promise.resolve();

function saveProgress(filename, value) {
  const contents = JSON.stringify(value, null, 2) + "\n";
  pendingSave = pendingSave.then(async () => {
    await fs.writeFile(`${filename}.tmp`, contents);
    await fs.rename(`${filename}.tmp`, filename);
  });
  return pendingSave;
}

async function forEachImage(items, work) {
  let cursor = 0;
  const workers = await Promise.allSettled(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (cursor < items.length) await work(items[cursor++]);
  }));
  const failure = workers.find((result) => result.status === "rejected");
  if (failure) throw failure.reason;
}

async function uploadFile(filename, publicId, contentType) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHash("sha1").update(`overwrite=false&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
  const data = new FormData();
  data.set("file", new Blob([await fs.readFile(filename)], { type: contentType }), path.basename(filename));
  data.set("api_key", key);
  data.set("public_id", publicId);
  data.set("overwrite", "false");
  data.set("timestamp", timestamp);
  data.set("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
    method: "POST", body: data, signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Image upload failed for ${filename}: HTTP ${response.status}`);
  const result = await response.json();
  if (!result.secure_url?.startsWith("https://res.cloudinary.com/")) throw new Error(`Unexpected upload response for ${filename}`);
  uploaded++;
  return result;
}

async function verifyCopy(url, expectedHash) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Hosted image verification failed: HTTP ${response.status}`);
  const hash = createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex");
  if (hash !== expectedHash) throw new Error("Hosted image differs from its local source; keep the archive.");
}

if (process.argv.includes("--archive")) {
  const backupPath = "src/data/archive-cloudinary-backup.json";
  let backup = [];
  try { backup = JSON.parse(await fs.readFile(backupPath, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const folders = (await fs.readdir("public/Archive 2", { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  let checked = 0;
  for (const folder of folders) {
    const files = (await fs.readdir(path.join("public/Archive 2", folder))).sort()
      .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file));
    await forEachImage(files, async (file) => {
      const relativePath = `${folder}/${file}`;
      const filename = path.join("public/Archive 2", relativePath);
      const buffer = await fs.readFile(filename);
      const sha256 = createHash("sha256").update(buffer).digest("hex");
      const existing = backup.find((entry) => entry.sha256 === sha256);
      const contentType = /\.png$/i.test(file) ? "image/png" : /\.webp$/i.test(file) ? "image/webp" : /\.avif$/i.test(file) ? "image/avif" : "image/jpeg";
      const result = existing ?? await uploadFile(filename, `propmentors/archive-2/${sha256}`, contentType);
      const url = (result.secure_url ?? result.url).replace(/^http:/, "https:");
      await verifyCopy(url, sha256);
      const entry = { path: relativePath, sha256, bytes: buffer.length, url };
      backup = backup.filter((item) => item.path !== relativePath);
      backup.push(entry);
      map[`Archive 2/${relativePath}`] = url;
      await saveProgress(backupPath, backup);
      await saveProgress("cloudinary-map.json", map);
      checked++;
    });
    console.log(`Originals backed up and verified: ${folder} (${checked} photographs total)`);
  }
  console.log(`Verified ${checked} original photographs in Cloudinary against their source SHA-256 hashes.`);
}

for (const [slug, collection] of Object.entries(manifest)) {
  await forEachImage(collection.images, async (image) => {
    const mapKey = image.src.slice(1);
    const filename = path.join("public", image.src);
    const sha256 = createHash("sha256").update(await fs.readFile(filename)).digest("hex");
    if (map[mapKey]) {
      await verifyCopy(map[mapKey], sha256);
      return;
    }
    const publicId = `propmentors/projects/${slug}/${path.basename(image.src, ".webp")}`;
    // Content hashes give these photographs new IDs; overwrite=false preserves
    // any existing upload and makes interrupted runs safe to repeat.
    const result = await uploadFile(filename, publicId, "image/webp");
    if (result.width !== image.width || result.height !== image.height) {
      throw new Error(`Unexpected upload response for ${slug}/${image.file}`);
    }
    await verifyCopy(result.secure_url, sha256);
    map[mapKey] = result.secure_url;
    await saveProgress("cloudinary-map.json", map);
  });
  console.log(`Image hosting ready: ${slug} (${collection.images.length} photographs)`);
}
console.log(`Uploaded ${uploaded} new photographs. Existing hosted images were preserved.`);
