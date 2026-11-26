export function isProductImage(value: string) {
  if (/^\/images\/[\w./-]+$/.test(value) && !value.includes("..")) return true;
  if (/^\/media\/products\/[a-f0-9]{64}\.webp$/.test(value)) return true;
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.port &&
    ["res.cloudinary.com", "images.unsplash.com"].includes(url.hostname);
}
