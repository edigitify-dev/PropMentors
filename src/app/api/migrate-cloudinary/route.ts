import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "jkcxw0xq";
const apiKey = process.env.CLOUDINARY_API_KEY || "947729994467911";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "QWrtjiu6M9K-5XuBqUGyYMx9M9w";

const MAP_FILE = path.join(process.cwd(), "cloudinary-map.json");

function loadMap(): Record<string, string> {
  if (fs.existsSync(MAP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveMap(map: Record<string, string>) {
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf-8");
}

async function uploadFile(filePath: string, folderName: string, fileName: string) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const folderPath = `propmentors/${folderName.trim().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder: folderPath,
    public_id: nameWithoutExt,
    timestamp,
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(stringToSign + apiSecret).digest("hex");

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

  return result.secure_url as string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : Infinity;

  const websiteImagesDir = path.join(process.cwd(), "public", "Website Images");
  if (!fs.existsSync(websiteImagesDir)) {
    const map = loadMap();
    return NextResponse.json({
      success: true,
      message: "All images have been migrated to Cloudinary and local Website Images directory has been cleaned up.",
      totalUploaded: Object.keys(map).length,
    });
  }

  const map = loadMap();
  const folders = fs.readdirSync(websiteImagesDir).filter((f) => {
    return fs.statSync(path.join(websiteImagesDir, f)).isDirectory() && !f.startsWith(".");
  });

  const SUPPORTED_EXTS = new Set([".webp", ".jpeg", ".jpg", ".png", ".avif", ".svg"]);
  const filesToUpload: { folder: string; file: string; fullPath: string; key: string }[] = [];

  for (const folder of folders) {
    const folderPath = path.join(websiteImagesDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => !f.startsWith("."));
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!SUPPORTED_EXTS.has(ext)) {
        continue;
      }
      const fullPath = path.join(folderPath, file);
      if (fs.statSync(fullPath).isFile()) {
        const key = `${folder}/${file}`;
        if (!map[key]) {
          filesToUpload.push({ folder, file, fullPath, key });
        }
      }
    }
  }

  const totalRemaining = filesToUpload.length;
  const targetBatch = filesToUpload.slice(0, limit);
  const uploaded: { key: string; url: string }[] = [];
  const errors: { key: string; error: string }[] = [];

  for (const item of targetBatch) {
    try {
      const url = await uploadFile(item.fullPath, item.folder, item.file);
      map[item.key] = url;
      saveMap(map);
      uploaded.push({ key: item.key, url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ key: item.key, error: msg });
    }
  }

  return NextResponse.json({
    success: true,
    totalUploadedSoFar: Object.keys(map).length,
    remainingAfterThisBatch: totalRemaining - uploaded.length,
    uploadedCount: uploaded.length,
    uploaded,
    errors,
  });
}
