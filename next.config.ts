import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // remotePatterns intentionally omitted: images render via plain <img> tags
  // (components/ImageInput.tsx etc.), not next/image, so no allowlist is needed.
  // Uploaded images are public Vercel Blob URLs (*.public.blob.vercel-storage.com).
};
export default nextConfig;
