import "server-only";
import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function hasR2Configuration() {
  return Boolean(process.env.R2_ENDPOINT && process.env.R2_BUCKET_NAME && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_PUBLIC_URL);
}

export async function uploadImage(bytes: Buffer, contentType: string) {
  if (!hasR2Configuration()) throw new Error("R2 storage configuration is missing.");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
  const extension = extensions[contentType];
  if (!extension) throw new Error("Unsupported image type.");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const key = `propmentors/images/${sha256}.${extension}`;
  const client = new S3Client({
    region: "auto", endpoint: process.env.R2_ENDPOINT,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    maxAttempts: 3,
  });
  try {
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: bytes, ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable", Metadata: { sha256 },
    }), { abortSignal: AbortSignal.timeout(30_000) });
  } finally { client.destroy(); }
  return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}
