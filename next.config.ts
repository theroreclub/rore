import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  ...(process.env.RORE_STATIC_PREVIEW === "1"
    ? { output: "export" as const }
    : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
