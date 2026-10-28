import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const script = path.resolve("scripts/archive-project-sources.mjs");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function fixture(t, { missingImage = false, changeSource = false, corruptVideo = false } = {}) {
  const directory = await fs.mkdtemp(path.join(tmpdir(), "propmentor-source-archive-test-"));
  const root = path.join(directory, "public/All Projects Images/Example");
  await fs.mkdir(root, { recursive: true });
  await fs.mkdir(path.join(directory, "src/data"), { recursive: true });
  const image = Buffer.from("fixture image bytes");
  const video = Buffer.from("fixture video bytes");
  await fs.writeFile(path.join(root, "photo.png"), image);
  await fs.writeFile(path.join(root, "video.MP4"), video);
  const imageKey = `propmentors/images/${hash(image)}.png`;
  const objects = new Map(missingImage ? [] : [[imageKey, { bytes: image, sha256: hash(image) }]]);
  const parts = new Map();
  let videoHash;
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const key = decodeURIComponent(url.pathname.replace(/^\/test-bucket\//, ""));
    if (request.method === "HEAD") {
      const object = objects.get(key);
      if (!object) { response.writeHead(404).end(); return; }
      response.writeHead(200, { "Content-Length": object.bytes.length, "x-amz-meta-sha256": object.sha256 }).end();
    } else if (request.method === "POST" && url.searchParams.has("uploads")) {
      videoHash = request.headers["x-amz-meta-sha256"];
      response.writeHead(200, { "Content-Type": "application/xml" }).end(`<InitiateMultipartUploadResult><Bucket>test-bucket</Bucket><Key>${key}</Key><UploadId>fixture-upload</UploadId></InitiateMultipartUploadResult>`);
    } else if (request.method === "PUT" && url.searchParams.has("partNumber")) {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      parts.set(Number(url.searchParams.get("partNumber")), Buffer.concat(chunks));
      response.writeHead(200, { ETag: '"fixture-part"' }).end();
    } else if (request.method === "POST" && url.searchParams.has("uploadId")) {
      for await (const chunk of request) void chunk;
      objects.set(key, { bytes: Buffer.concat([...parts.entries()].sort(([a], [b]) => a - b).map(([, bytes]) => bytes)), sha256: videoHash });
      response.writeHead(200, { "Content-Type": "application/xml" }).end(`<CompleteMultipartUploadResult><Bucket>test-bucket</Bucket><Key>${key}</Key><ETag>fixture-etag</ETag></CompleteMultipartUploadResult>`);
    } else if (request.method === "GET" && objects.has(key)) {
      if (changeSource) await fs.writeFile(path.join(root, "new-photo.png"), "arrived during backup");
      const object = objects.get(key);
      const bytes = Buffer.from(object.bytes);
      if (corruptVideo) bytes[0] ^= 1;
      response.writeHead(200, { "Content-Length": bytes.length }).end(bytes);
    } else { response.writeHead(400).end(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  await fs.writeFile(path.join(directory, "r2-map.json"), JSON.stringify({ "/All Projects Images/Example/photo.png": `https://archive.example.test/${imageKey}` }));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(directory, { recursive: true, force: true });
  });
  const result = await new Promise((resolve, reject) => {
    let output = "";
    const child = spawn(process.execPath, [script, "--apply", "--remove-local"], {
      cwd: directory,
      env: { ...process.env, R2_ENDPOINT: `http://127.0.0.1:${address.port}`, R2_BUCKET_NAME: "test-bucket", R2_PUBLIC_URL: "https://archive.example.test", R2_ACCESS_KEY_ID: "test-access-key", R2_SECRET_ACCESS_KEY: "test-secret-key" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (data) => { output += data; });
    child.stderr.on("data", (data) => { output += data; });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, output }));
  });
  return { directory, root, result, image, video, objects };
}

test("source cleanup removes files only after preserving and verifying images and videos", async (t) => {
  const { directory, root, result, image, video, objects } = await fixture(t);
  assert.equal(result.code, 0, result.output);
  await assert.rejects(fs.access(root), { code: "ENOENT" });
  const manifest = JSON.parse(await fs.readFile(path.join(directory, "src/data/project-source-backup.json"), "utf8"));
  assert.equal(manifest.assets.length, 2);
  assert.equal(manifest.totalBytes, image.length + video.length);
  const archived = manifest.assets.find((asset) => asset.contentType === "video/mp4");
  assert.equal(archived.sha256, hash(video));
  assert.deepEqual(objects.get(`propmentors/videos/${hash(video)}.mp4`).bytes, video);
});

test("source cleanup retains the folder when an image backup is missing", async (t) => {
  const { root, result, image } = await fixture(t, { missingImage: true });
  assert.equal(result.code, 1);
  assert.match(result.output, /Image copy is missing/);
  assert.deepEqual(await fs.readFile(path.join(root, "photo.png")), image);
});

test("source cleanup retains the folder when new files arrive during backup", async (t) => {
  const { root, result } = await fixture(t, { changeSource: true });
  assert.equal(result.code, 1);
  assert.match(result.output, /source folder changed during backup/);
  assert.equal(await fs.readFile(path.join(root, "new-photo.png"), "utf8"), "arrived during backup");
});

test("source cleanup retains the folder when the archived video bytes do not match", async (t) => {
  const { root, result, video } = await fixture(t, { corruptVideo: true });
  assert.equal(result.code, 1);
  assert.match(result.output, /Video SHA-256 verification failed/);
  assert.deepEqual(await fs.readFile(path.join(root, "video.MP4")), video);
});
