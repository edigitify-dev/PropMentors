import sharp from "sharp";
import { adminMutation, ApiError, apiResponse, rateLimit, readBody } from "@/lib/api-utils";
import { hasR2Configuration, uploadImage } from "@/lib/r2-storage";

export async function POST(request: Request) {
  return apiResponse(async () => {
    const admin = await adminMutation(request);
    await rateLimit(`uploads:${admin.id}`, 100, 60);
    if (!hasR2Configuration()) throw new ApiError(503, "Photo uploads need storage configuration. You can paste an existing image URL instead.");
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
    let dimensions;
    try { dimensions = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata(); }
    catch { throw new ApiError(400, "Choose a valid image with no more than 40 million pixels."); }
    const { width, height } = dimensions;
    if (!width || !height || width > 20000 || height > 20000) throw new ApiError(400, "Choose an image with dimensions below 20,000 pixels.");
    let url;
    try { url = await uploadImage(bytes, file.type); }
    catch { throw new ApiError(502, "The image service couldn’t complete the upload. Please try again."); }
    return Response.json({ url, width, height }, { status: 201 });
  });
}
