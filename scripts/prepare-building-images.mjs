import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Used by import-building-catalog.py; inputs contain only public photo URLs.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("Pass the image import manifest path.");
const jobs = JSON.parse(await fs.readFile(manifestPath, "utf8"));
let next = 0;
let completed = 0;
const results = [];

async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    const destination = path.join(root, "public", "images", "buildings", job.slug, `${job.index + 1}.webp`);
    try {
      const url = new URL(job.sourceUrl);
      if (url.origin !== "https://storage.googleapis.com" || !url.pathname.startsWith("/estatelion-img/")) {
        throw new Error("Unexpected source image host.");
      }
      await fs.mkdir(path.dirname(destination), { recursive: true });
      let metadata;
      try {
        metadata = await sharp(destination).metadata();
      } catch {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
        const input = Buffer.from(await response.arrayBuffer());
        metadata = await sharp(input).rotate().resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(destination);
      }
      results.push({ ...job, src: `/images/buildings/${job.slug}/${job.index + 1}.webp`, width: metadata.width, height: metadata.height });
    } catch (error) {
      results.push({ ...job, error: error.message });
    }
    completed++;
    if (completed % 40 === 0 || completed === jobs.length) console.log(`Photos: ${completed}/${jobs.length}`);
  }
}

await Promise.all(Array.from({ length: 4 }, worker));
await fs.writeFile(manifestPath, JSON.stringify(results.sort((a, b) => a.row - b.row || a.index - b.index), null, 2) + "\n");
const failures = results.filter((item) => item.error);
if (failures.length) console.log(`${failures.length} source photographs unavailable; recorded in the import report.`);
