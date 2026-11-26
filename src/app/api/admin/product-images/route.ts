import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import sharp from "sharp";
import { requireAdminSession } from "@/lib/auth-checks";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: "Sign in as an administrator to upload images." }, { status: 403 });
  }
  if (request.headers.get("x-product-upload") !== "1") {
    return Response.json({ error: "Use the product editor to upload images." }, { status: 400 });
  }
  const maxBytes = 4 * 1024 * 1024;
  if (Number(request.headers.get("content-length")) > maxBytes) {
    return Response.json({ error: "Choose an image of 4 MB or less." }, { status: 413 });
  }
  const buffer = await request.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength > maxBytes) {
    return Response.json({ error: "Choose an image of 4 MB or less." }, { status: 400 });
  }
  let image: Buffer;
  try {
    const pipeline = sharp(Buffer.from(buffer), { limitInputPixels: 40000000 });
    const { format } = await pipeline.metadata();
    if (!format || !["jpeg", "png", "webp", "heif", "avif"].includes(format)) throw new Error();
    image = await pipeline.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 }).toBuffer();
  } catch {
    return Response.json({ error: "Choose a readable JPEG, PNG, WebP or AVIF photo up to 40 megapixels." }, { status: 400 });
  }
  const key = createHash("sha256").update(image).digest("hex") + ".webp";
  await getStore("product-images").set(key, Uint8Array.from(image).buffer);
  return Response.json({ url: `/media/products/${key}` }, { status: 201 });
}
