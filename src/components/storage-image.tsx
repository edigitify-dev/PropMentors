import NextImage, { type ImageProps } from "next/image";
import { imageUrl } from "@/lib/image-storage";

/** Resolve existing local and Cloudinary references to their verified R2 copies. */
export default function StorageImage({ src, ...props }: ImageProps) {
  return <NextImage {...props} src={typeof src === "string" ? imageUrl(src) : src} />;
}
