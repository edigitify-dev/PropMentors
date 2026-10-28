import imageMapJson from "../../r2-map.json";

const imageMap: Record<string, string> = imageMapJson;

/** Only verified migrations appear in this manifest; unknown URLs stay intact. */
export function imageUrl(src: string): string {
  if (Object.hasOwn(imageMap, src)) return imageMap[src];
  try {
    const decoded = decodeURIComponent(src);
    if (Object.hasOwn(imageMap, decoded)) return imageMap[decoded];
  } catch { /* Preserve malformed or external URLs for the normal image handler. */ }
  return src;
}
