import { createHash } from "node:crypto";
import { adminMutation, ApiError, apiResponse, rateLimit, readBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  return apiResponse(async () => {
    const admin = await adminMutation(request);
    await rateLimit(`uploads:${admin.id}`, 100, 60);
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !key || !secret) throw new ApiError(503, "Photo uploads need Cloudinary configuration. You can paste an existing image URL instead.");
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) throw new ApiError(415, "Choose an image file to upload.");
    const buffer = await readBody(request, 10_100_000);
    let form: FormData;
    try { form = await new Response(new Uint8Array(buffer), { headers: { "Content-Type": contentType } }).formData(); }
    catch { throw new ApiError(400, "The image upload could not be read."); }
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 10_000_000) throw new ApiError(400, "Choose an image smaller than 10 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const supported = (file.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      || (file.type === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      || (file.type === "image/webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
      || (file.type === "image/avif" && bytes.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(bytes.toString("ascii", 8, 32)));
    if (!supported) throw new ApiError(400, "Use a JPG, PNG, WebP, or AVIF image.");
    const folder = "propmentors/projects";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
    const data = new FormData();
    data.set("file", file); data.set("api_key", key); data.set("folder", folder); data.set("timestamp", timestamp); data.set("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: data, signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new ApiError(502, "The image service couldn’t complete the upload. Please try again.");
    const result = await response.json();
    return Response.json({ url: result.secure_url, width: result.width, height: result.height }, { status: 201 });
  });
}
