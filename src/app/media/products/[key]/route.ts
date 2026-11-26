import { getStore } from "@netlify/blobs";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[a-f0-9]{64}\.webp$/.test(key)) return new Response(null, { status: 404 });
  const image = await getStore({ name: "product-images", consistency: "strong" }).get(key, { type: "stream" });
  if (!image) return new Response(null, { status: 404 });
  return new Response(image, { headers: {
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  } });
}
