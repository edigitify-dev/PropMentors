import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let sourceBackup = [];
try { sourceBackup = JSON.parse(await fs.readFile(path.join(root, "src/data/archive-cloudinary-backup.json"), "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }

async function sourceFiles(folder) {
  try { return await fs.readdir(path.join(root, "public/Archive 2", folder)); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    const files = sourceBackup.filter((entry) => entry.path.startsWith(`${folder}/`)).map((entry) => entry.path.slice(folder.length + 1));
    if (!files.length) throw new Error(`No local or hosted source photographs for ${folder}`);
    return files;
  }
}

async function readSource(folder, file) {
  try { return await fs.readFile(path.join(root, "public/Archive 2", folder, file)); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    const source = sourceBackup.find((entry) => entry.path === `${folder}/${file}`);
    if (!source) throw new Error(`No hosted source photograph for ${folder}/${file}`);
    const response = await fetch(source.url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Source photograph HTTP ${response.status}: ${folder}/${file}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (createHash("sha256").update(buffer).digest("hex") !== source.sha256) throw new Error(`Source photograph hash mismatch: ${folder}/${file}`);
    return buffer;
  }
}

// Explicit building matches, checked against the catalogue and photo contact sheets.
// Array order sets the cover first; interiors are identified separately.
const collections = {
  "8-square": { folder: "8 Square ", interiors: ["3.png", "4.png"] },
  "add-india-tower": { folder: "ADD India Tower", cover: "1.jpg" },
  "ace-studio": { folder: "Ace Studio", interiors: ["3.png", "4.png"] },
  "add-india-centre": { folder: "Add India Centre" },
  "add-india-heights": { folder: "Add India Heights", interiors: ["4.png"], exclude: ["3.webp"] },
  "bptp-capital-city": { folder: "BPTP Capital City", cover: "1.jpg", interiors: ["2.jpg", "3.jpg", "4.jpg"] },
  "tech-boulevard": {
    folder: "Boulevard", cover: "Untitled-3.png",
    interiors: ["d6gfxz.webp", "fxgxqa.webp", "preu7a.webp", "1782118402_2qa.jpg.webp"],
    exclude: ["1769768760_12.jpg.webp", "1764935888181-9bke1fwqpr.jpeg"],
  },
  "club-125": { folder: "Club 125", cover: "1.webp" },
  "delphi-tower": { folder: "Delphi tower", interiors: ["2.png"] },
  elixir: { folder: "Elixir business park", interiors: ["3.png", "Untitled-34.png"] },
  "express-trade-tower": {
    folder: "Express Trade Tower", cover: "Untitled-3.png",
    interiors: ["ETT2-01.webp", "704869071M-1769582909794.jpg", "1762853600_cow1.jpg.webp", "1769341992_PHOTO-2026-01-24-17-07-41.jpg.webp", "coworking-express-trade-tower-noida-2-hero.jpg"],
    exclude: ["images-1675882879200.jpg"],
  },
  "fusion-square": { folder: "Fusion Square", interiors: ["3.png", "4.png"] },
  "ihdp-business-park": { folder: "IHDP Business Park", interiors: ["3.png", "4.png"] },
  "jask-tower-sector-125": {
    folder: "Jask sec 125", cover: "Jask tower.png",
    interiors: ["76373a.webp", "1764662859_1qwsdcv.jpg.webp", "images 2.jpeg"],
    exclude: ["3ee6t2.webp", "1770367019_12.jpg.webp", "g6ujyf.webp", "1726741157054-1.jpg"],
  },
  "louts-business-park": { folder: "Louts Business park", interiors: ["3.png", "4.png"] },
  "lucerna-tower-sector-125": { folder: "Lucerna Tower" },
  "maple-corporate-park": { folder: "Maple Corporate Park" },
  "pinnacle-tower-132": { folder: "Pinnacle Tower 132" },
  "pride-tower": { folder: "Pride Tower", interiors: ["4.png"] },
  "stellar-127": { folder: "Stellar 127", interiors: ["2.png"] },
  "supertech-astralis": { folder: "Supertech Astralis", cover: "1.webp.jpg", interiors: ["2.webp.jpg"] },
  "tapasya-corp-heights": { folder: "Tapasya Corp Heights" },
  "the-opus-132": { folder: "The Opus 132", interiors: ["3.png", "4.png"] },
  "tirupati-akc": { folder: "Tirupati AKC", interiors: ["2.png", "3.png", "4.png"] },
  "tradex-tower": { folder: "Tradex Tower", interiors: ["3.png", "4.png"] },
  "urbtech-one-27": { folder: "Urbtech One 27" },
  "urbtech-trade-centre": { folder: "Urbtech Trade Centre" },
  "vj-business-tower": { folder: "VJ Business Tower", interiors: ["3.png", "4.png"] },
  "windsor-it-park": { folder: "Windsor IT Park", interiors: ["4.png"] },
};

const catalogue = JSON.parse(await fs.readFile(path.join(root, "src/data/building-catalog.json"), "utf8"));
const manifest = {};
let total = 0;
let bytes = 0;

for (const [slug, collection] of Object.entries(collections)) {
  if (!catalogue.some((building) => building.slug === slug)) throw new Error(`Unknown building: ${slug}`);
  const files = (await sourceFiles(collection.folder))
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file) && !collection.exclude?.includes(file))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const cover = collection.cover ?? "1.png";
  if (!files.includes(cover)) throw new Error(`Missing cover: ${collection.folder}/${cover}`);
  files.splice(files.indexOf(cover), 1);
  files.unshift(cover);
  const inputs = files.map((file) => ({ folder: collection.folder, file, isInterior: collection.interiors?.includes(file) ?? false }));

  if (slug === "urbtech-trade-centre") {
    // UTC-Banner and the UTC entrance identify this building. NPX is a different
    // development; UTP-project-11 does not establish a match to this building.
    for (const file of ["UTC-Banner.jpg", "1.jpg", "gnh3kw.webp", "images.jpeg", "images 2.jpeg", "images 3.jpeg", "images 4.jpeg"]) {
      inputs.push({ folder: "UTC ", file, isInterior: !["UTC-Banner.jpg", "images 4.jpeg"].includes(file) });
    }
  }

  const images = [];
  const seen = new Set();
  for (const input of inputs) {
    const buffer = await readSource(input.folder, input.file);
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    if (seen.has(hash)) continue;
    seen.add(hash);
    const output = `/images/projects/${slug}/${hash}.webp`;
    const destination = path.join(root, "public", output);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const info = await sharp(buffer).rotate()
      .resize({ width: 1920, height: 1440, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).toFile(destination);
    images.push({ file: input.file, src: output, width: info.width, height: info.height, isInterior: input.isInterior });
    total++;
    bytes += info.size;
  }
  manifest[slug] = { folder: collection.folder, images };
}

await fs.writeFile(path.join(root, "src/data/archive-project-images.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Prepared ${total} photographs for ${Object.keys(manifest).length} projects (${(bytes / 1024 / 1024).toFixed(1)} MB).`);
