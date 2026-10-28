import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import { S3Client, HeadObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

nextEnv.loadEnvConfig(process.cwd());
const root = "public/All Projects Images";
const manifestFile = "src/data/project-source-backup.json";
const progressFile = ".r2-migration-video-progress.json";
const apply = process.argv.includes("--apply");
const remove = process.argv.includes("--remove-local");
const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".mp4": "video/mp4" };
const env = process.env;
const publicUrl = env.R2_PUBLIC_URL?.replace(/\/$/, "");

async function readJson(filename, fallback) {
  try { return JSON.parse(await fs.readFile(filename, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
async function writeJson(filename, value, mode = 0o644) {
  await fs.writeFile(`${filename}.tmp`, JSON.stringify(value, null, 2) + "\n", { mode });
  await fs.rename(`${filename}.tmp`, filename);
}
async function digest(stream) {
  const hash = createHash("sha256");
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
}
async function inventory(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await inventory(filename));
    else if (entry.isFile() && types[path.extname(filename).toLowerCase()]) {
      const stat = await fs.stat(filename);
      files.push({ path: path.relative(root, filename).split(path.sep).join("/"), bytes: stat.size, mtimeMs: stat.mtimeMs });
    } else throw new Error(`Unexpected file; keep the source folder for review: ${filename}`);
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function main() {
  let stat;
  try { stat = await fs.lstat(root); }
  catch (error) {
    if (error.code === "ENOENT" && await readJson(manifestFile, undefined)) { console.log("Local source folder is already archived and removed."); return; }
    throw error;
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("The source must be the expected real directory.");
  const files = await inventory(root);
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`Source inventory: ${files.length} assets (${(totalBytes / 1024 ** 3).toFixed(2)} GiB), including ${files.filter((file) => /\.mp4$/i.test(file.path)).length} videos.`);
  if (!apply) { console.log("Dry run only. Use --apply to archive; add --remove-local to delete only after every asset is verified."); return; }
  for (const name of ["R2_ENDPOINT", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL"]) if (!env[name]) throw new Error(`${name} is missing.`);
  const imageMap = await readJson("r2-map.json", {});
  const target = `${env.R2_ENDPOINT}/${env.R2_BUCKET_NAME}`;
  const previous = await readJson(progressFile, {});
  const progress = previous.target === target ? previous : { target, uploads: {}, completed: {} };
  let saves = Promise.resolve();
  const saveProgress = () => { saves = saves.then(() => writeJson(progressFile, progress, 0o600)); return saves; };
  const client = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }, maxAttempts: 3 });
  const results = [];
  let cursor = 0;
  let checked = 0;

  async function archive(file) {
    const filename = path.join(root, file.path);
    const hash = await digest(createReadStream(filename));
    const contentType = types[path.extname(filename).toLowerCase()];
    const video = contentType === "video/mp4";
    let url;
    let key;
    if (video) {
      key = `propmentors/videos/${hash}.mp4`;
      url = `${publicUrl}/${key}`;
    } else {
      url = imageMap[`/All Projects Images/${file.path}`];
      if (!url?.startsWith(`${publicUrl}/`)) throw new Error(`Image has no verified R2 copy: ${file.path}`);
      key = url.slice(publicUrl.length + 1);
    }
    let exists = false;
    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
      if (head.Metadata?.sha256 !== hash || head.ContentLength !== file.bytes) throw new Error(`R2 copy differs from its source: ${file.path}`);
      exists = true;
    } catch (error) { if (error.$metadata?.httpStatusCode !== 404) throw error; }
    if (!exists && !video) throw new Error(`Image copy is missing: ${file.path}`);

    if (!exists) {
      let upload = progress.uploads[file.path];
      if (upload && (upload.sha256 !== hash || upload.key !== key)) throw new Error(`Source changed during multipart backup: ${file.path}`);
      if (!upload) {
        const started = await client.send(new CreateMultipartUploadCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: contentType, Metadata: { sha256: hash }, CacheControl: "public, max-age=31536000, immutable" }));
        upload = progress.uploads[file.path] = { uploadId: started.UploadId, key, sha256: hash, parts: {} };
        await saveProgress();
      }
      const partSize = 32 * 1024 * 1024;
      const partCount = Math.ceil(file.bytes / partSize);
      const handle = await fs.open(filename, "r");
      let nextPart = 1;
      try {
        const workers = await Promise.allSettled(Array.from({ length: 2 }, async () => {
          while (nextPart <= partCount) {
            const number = nextPart++;
            if (upload.parts[number]) continue;
            const length = Math.min(partSize, file.bytes - (number - 1) * partSize);
            const bytes = Buffer.allocUnsafe(length);
            let read = 0;
            while (read < length) {
              const result = await handle.read(bytes, read, length - read, (number - 1) * partSize + read);
              if (!result.bytesRead) throw new Error(`Unexpected end of video: ${file.path}`);
              read += result.bytesRead;
            }
            const part = await client.send(new UploadPartCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, UploadId: upload.uploadId, PartNumber: number, Body: bytes, ContentLength: length }));
            upload.parts[number] = { ETag: part.ETag, PartNumber: number };
            await saveProgress();
            console.log(`Video backup: ${file.path} — ${Object.keys(upload.parts).length}/${partCount} parts`);
          }
        }));
        const failure = workers.find((worker) => worker.status === "rejected");
        if (failure) throw failure.reason;
        await client.send(new CompleteMultipartUploadCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, UploadId: upload.uploadId, MultipartUpload: { Parts: Object.values(upload.parts).sort((a, b) => a.PartNumber - b.PartNumber) } }));
      } catch (error) {
        await client.send(new AbortMultipartUploadCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, UploadId: upload.uploadId })).catch(() => {});
        delete progress.uploads[file.path];
        await saveProgress();
        throw error;
      } finally { await handle.close(); }
    }
    if (video && progress.completed[file.path]?.sha256 !== hash) {
      const copy = await client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
      if (await digest(copy.Body) !== hash) throw new Error(`Video SHA-256 verification failed: ${file.path}`);
      progress.completed[file.path] = { sha256: hash, bytes: file.bytes, url };
      delete progress.uploads[file.path];
      await saveProgress();
      console.log(`Video verified against source SHA-256: ${file.path}`);
    }
    results.push({ path: file.path, sha256: hash, bytes: file.bytes, contentType, url });
    const count = ++checked;
    if (count % 50 === 0 || count === files.length) console.log(`Verified ${count}/${files.length} source assets.`);
  }

  try {
    const workers = await Promise.allSettled(Array.from({ length: 3 }, async () => { while (cursor < files.length) await archive(files[cursor++]); }));
    const failure = workers.find((worker) => worker.status === "rejected");
    if (failure) throw failure.reason;
    await saves;
    const manifest = { sourceDirectory: root, bucket: env.R2_BUCKET_NAME, publicUrl, verifiedAt: new Date().toISOString(), totalBytes, assets: results.sort((a, b) => a.path.localeCompare(b.path)) };
    await writeJson(manifestFile, manifest);
    console.log(`Archive complete: ${results.length} verified assets. Recovery manifest: ${manifestFile}`);
    if (remove) {
      if (JSON.stringify(await inventory(root)) !== JSON.stringify(files)) throw new Error("The source folder changed during backup; it has been retained.");
      await fs.rm(root, { recursive: true });
      console.log(`Removed only ${root} (${(totalBytes / 1024 ** 3).toFixed(2)} GiB of local source files).`);
    }
  } finally { client.destroy(); }
}

try { await main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
