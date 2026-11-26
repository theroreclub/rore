export const previewCategories = [
  { id: "preview-anime", slug: "anime-oversized", name: "Anime" },
  { id: "preview-streetwear", slug: "streetwear", name: "Streetwear" },
  { id: "preview-accessories", slug: "accessories", name: "Accessories" },
  { id: "preview-fandom", slug: "fandom", name: "Fandom" },
];

export const featuredSlugs = [
  "shibuya-ghost-tee",
  "neo-tokyo-mecha-hoodie",
  "hollow-mask-acid-wash-tee",
  "kanji-distressed-cap",
  "arcade-night-tee",
];

const samples = [
  { name: "Shibuya Ghost Oversized Tee", price: 149900, category: 0, description: "A wandering ghost against a red moon, printed on a washed charcoal oversized tee." },
  { name: "Neo-Tokyo Mecha Hoodie", price: 289900, category: 0, description: "A bone-white mech with violet accents on a relaxed black pullover." },
  { name: "Hollow Mask Acid Wash Tee", price: 149900, category: 1, description: "A cracked oni mask and red brushstrokes on acid-washed charcoal cotton." },
  { name: "Kanji Distressed Cap", price: 89900, category: 2, description: "Washed black canvas with a pale embroidered mark and an adjustable closure." },
  { name: "Arcade Night Oversized Tee", price: 139900, category: 3, description: "A pixel ship, a neon horizon, and a nod to late nights at the arcade." },
];

export const previewProducts = samples.map(({ name, price, category, description }, index) => ({
  id: `preview-${featuredSlugs[index]}`,
  slug: featuredSlugs[index],
  name,
  price,
  description,
  stock: 10,
  images: [`/images/products/${featuredSlugs[index]}.webp`],
  category: previewCategories[category],
  isActive: true,
  qikinkVariants: (category === 2 ? ["One size"] : ["S", "M", "L", "XL"])
    .map((label, option) => ({ label, sku: `preview-${index}-${option}` })),
}));
