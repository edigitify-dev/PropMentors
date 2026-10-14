import fs from "fs";
import path from "path";
import crypto from "crypto";

// 1. Load environment variables from .env.local if present
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "jkcxw0xq";
const apiKey = process.env.CLOUDINARY_API_KEY || "947729994467911";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "QWrtjiu6M9K-5XuBqUGyYMx9M9w";

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing Cloudinary credentials in .env.local or environment.");
  process.exit(1);
}

const MAP_FILE = path.join(process.cwd(), "cloudinary-map.json");
const WEBSITE_IMAGES_DIR = path.join(process.cwd(), "public", "Website Images");

const SUPPORTED_EXTS = new Set([".webp", ".jpeg", ".jpg", ".png", ".avif", ".svg"]);

function loadMap() {
  if (fs.existsSync(MAP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveMap(map) {
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf-8");
}

async function uploadFileWithRetry(filePath, folderName, fileName, maxRetries = 3) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const folderPath = `propmentors/${folderName.trim().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    folder: folderPath,
    public_id: nameWithoutExt,
    timestamp,
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(stringToSign + apiSecret).digest("hex");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const formData = new FormData();
      formData.append("file", new Blob([fileBuffer]));
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("folder", folderPath);
      formData.append("public_id", nameWithoutExt);
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || `HTTP ${res.status}`);
      }

      return result.secure_url;
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      const waitTime = attempt * 1500;
      console.warn(`[Retry ${attempt}/${maxRetries}] for ${fileName} after ${waitTime}ms: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

async function main() {
  console.log("=========================================");
  console.log("   Cloudinary Image Migration Script     ");
  console.log("=========================================");
  console.log(`Cloud Name : ${cloudName}`);
  console.log(`API Key    : ${apiKey}`);
  console.log(`Directory  : ${WEBSITE_IMAGES_DIR}\n`);

  if (!fs.existsSync(WEBSITE_IMAGES_DIR)) {
    console.error(`Website Images directory not found at: ${WEBSITE_IMAGES_DIR}`);
    process.exit(1);
  }

  const map = loadMap();
  const existingCount = Object.keys(map).length;
  console.log(`Found ${existingCount} already uploaded images in cloudinary-map.json`);

  const folders = fs.readdirSync(WEBSITE_IMAGES_DIR).filter((f) => {
    return fs.statSync(path.join(WEBSITE_IMAGES_DIR, f)).isDirectory() && !f.startsWith(".");
  });

  const queue = [];

  for (const folder of folders) {
    const folderPath = path.join(WEBSITE_IMAGES_DIR, folder);
    const files = fs.readdirSync(folderPath).filter((f) => !f.startsWith("."));
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!SUPPORTED_EXTS.has(ext)) {
        // Skip non-image files such as videos (.mp4)
        continue;
      }
      const fullPath = path.join(folderPath, file);
      if (fs.statSync(fullPath).isFile()) {
        const key = `${folder}/${file}`;
        if (!map[key]) {
          queue.push({ folder, file, fullPath, key });
        }
      }
    }
  }

  console.log(`Total images pending upload: ${queue.length}\n`);

  if (queue.length === 0) {
    console.log("All images are already transferred to Cloudinary!");
    return;
  }

  let completed = 0;
  let errors = 0;
  const CONCURRENCY = 4;

  let queueIndex = 0;

  async function worker(workerId) {
    while (queueIndex < queue.length) {
      const currentIndex = queueIndex++;
      const item = queue[currentIndex];
      try {
        const url = await uploadFileWithRetry(item.fullPath, item.folder, item.file);
        map[item.key] = url;
        saveMap(map);
        completed++;
        const percent = (((existingCount + completed) / (existingCount + queue.length)) * 100).toFixed(1);
        console.log(`[${existingCount + completed}/${existingCount + queue.length}] (${percent}%) [Worker ${workerId}] Uploaded: ${item.key}`);
      } catch (err) {
        errors++;
        console.error(`[Worker ${workerId}] ERROR uploading ${item.key}: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log("\n=========================================");
  console.log("   Migration Completed                   ");
  console.log("=========================================");
  console.log(`Successfully uploaded: ${completed}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total in cloudinary-map.json: ${Object.keys(map).length}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
