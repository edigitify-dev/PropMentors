import type { NextConfig } from "next";
import imageMapJson from "./r2-map.json";

const imageMap: Record<string, string> = imageMapJson;

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async rewrites() {
    // CSS masks need same-origin access. Proxy their verified R2 copies so the
    // design works even when storage credentials cannot change bucket CORS.
    return { beforeFiles: Object.entries(imageMap)
      .filter(([src]) => src.startsWith("/") && /^\/[a-zA-Z0-9/_.-]+$/.test(src) && (src.endsWith(".svg") || src.includes("-mask.") || src === "/images/hero-office-full.png" || src === "/favicon.ico"))
      .map(([source, destination]) => ({ source, destination })) };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-72e43fc9335a4eb6bfba0e0d6ea8b6a6.r2.dev",
        pathname: "/propmentors/images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
