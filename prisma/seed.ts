import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for Rore Club...");

  const catStreetwear = await prisma.category.upsert({
    where: { slug: "streetwear" },
    update: {},
    create: {
      name: "Streetwear",
      slug: "streetwear",
      description: "Heavyweight silhouettes, raw textures, and everyday utilitarian streetwear drops.",
    },
  });

  const catAnime = await prisma.category.upsert({
    where: { slug: "anime-oversized" },
    update: {},
    create: {
      name: "Anime Oversized",
      slug: "anime-oversized",
      description: "Graphic oversized tees and hoodies inspired by classic cyber mecha and dark shonen aesthetics.",
    },
  });

  const catAccessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories & Headwear",
      slug: "accessories",
      description: "Tactical bags, distressed headwear, and brutalist industrial jewelry to complete your fit.",
    },
  });

  const catFandom = await prisma.category.upsert({
    where: { slug: "fandom" },
    update: {},
    create: { name: "Fandom", slug: "fandom", description: "Original designs inspired by gaming and fandom culture." },
  });

  const products = [
    // Streetwear
    {
      name: "Cyber Acid Wash Hoodie",
      slug: "cyber-acid-wash-hoodie",
      description: "450 GSM French Terry cotton hoodie with custom mineral acid wash finish. Dropped shoulders, seamless ribbed cuffs, and subtle distressed hem detailing tailored for an effortless oversized drape.",
      price: 249900, // ₹2,499.00
      stock: 35,
      images: ["/images/products/cyber-acid-wash-hoodie.svg"],
      categoryId: catStreetwear.id,
      isActive: true,
    },
    {
      name: "Obsidian Tactical Cargos",
      slug: "obsidian-cargo-pants",
      description: "Engineered from water-repellent ripstop fabric with 8 ergonomic modular pockets, adjustable ankle cinch-cords, and reinforced knee articulation for urban mobility.",
      price: 279900, // ₹2,799.00
      stock: 22,
      images: ["/images/products/obsidian-cargo-pants.svg"],
      categoryId: catStreetwear.id,
      isActive: true,
    },
    {
      name: "Raw Edge Vintage Boxy Tee",
      slug: "vintage-boxy-tee",
      description: "260 GSM single jersey cotton tee with a boxy cut, ribbed high-neck collar, and raw-cut hem finish. Pre-shrunk and silicone enzyme washed for a vintage broken-in hand feel.",
      price: 129900, // ₹1,299.00
      stock: 50,
      images: ["/images/products/vintage-boxy-tee.svg"],
      categoryId: catStreetwear.id,
      isActive: true,
    },
    {
      name: "Monolith Heavy Crewneck",
      slug: "heavyweight-crewneck",
      description: "Minimalist brutalist crewneck sweatshirt crafted from custom 400 GSM loopback cotton. Tonal micro-embroidered Rore Club insignia on chest and double-needle needlework throughout.",
      price: 199900, // ₹1,999.00
      stock: 18,
      images: ["/images/products/heavyweight-crewneck.svg"],
      categoryId: catStreetwear.id,
      isActive: true,
    },

    // Anime Oversized
    {
      name: "Shibuya Ghost Oversized Tee",
      slug: "shibuya-ghost-tee",
      description: "High-density puff and screen-printed cyberpunk graphic on 280 GSM combed cotton. Inspired by the neon drenched alleys and urban legends of nocturnal Shibuya.",
      price: 149900, // ₹1,499.00
      stock: 40,
      images: ["/images/products/shibuya-ghost-tee.webp"],
      categoryId: catAnime.id,
      isActive: true,
    },
    {
      name: "Neo-Tokyo Mecha Graphic Hoodie",
      slug: "neo-tokyo-mecha-hoodie",
      description: "Heavyweight 480 GSM fleece hoodie featuring prototype mecha schematics on back and warning hazard graphics along both forearms. Double-layered crossover hood without drawstrings.",
      price: 289900, // ₹2,899.00
      stock: 14,
      images: ["/images/products/neo-tokyo-mecha-hoodie.webp"],
      categoryId: catAnime.id,
      isActive: true,
    },
    {
      name: "Redline Division Oversized Tee",
      slug: "redline-division-tee",
      description: "Tribute to retro futuristic street racing. Screen-printed with cracked vintage plastisol ink on garment-dyed scarlet red heavyweight cotton.",
      price: 159900, // ₹1,599.00
      stock: 28,
      images: ["/images/products/redline-division-tee.svg"],
      categoryId: catAnime.id,
      isActive: true,
    },
    {
      name: "Hollow Mask Acid Wash Tee",
      slug: "hollow-mask-acid-wash-tee",
      description: "Supernatural battle anime inspiration featuring a fractured hollow mask printed across front and back shoulders. Hand-dyed vintage blue acid wash; no two pieces are identical.",
      price: 149900, // ₹1,499.00
      stock: 30,
      images: ["/images/products/hollow-mask-acid-wash-tee.webp"],
      categoryId: catAnime.id,
      isActive: true,
    },

    // Accessories & Headwear
    {
      name: "Utility Tactical Crossbody Bag",
      slug: "tactical-crossbody-bag",
      description: "Cordura ballistic nylon shoulder bag featuring quick-release cobra buckle, waterproof sealed YKK zippers, and interior mesh organizer compartments for everyday tech carry.",
      price: 119900, // ₹1,199.00
      stock: 19,
      images: ["/images/products/tactical-crossbody-bag.svg"],
      categoryId: catAccessories.id,
      isActive: true,
    },
    {
      name: "Rore Club Kanji Distressed Cap",
      slug: "kanji-distressed-cap",
      description: "Low-profile 6-panel unstructured dad hat with custom hand-distressed brim abrasions and high-relief Japanese kanji 3D embroidery.",
      price: 89900, // ₹899.00
      stock: 45,
      images: ["/images/products/kanji-distressed-cap.webp"],
      categoryId: catAccessories.id,
      isActive: true,
    },
    {
      name: "Industrial Curb Chain Choker",
      slug: "industrial-chain-choker",
      description: "High-grade 316L stainless steel curb link chain with engraved safety lock carabiner closure. Tarnish-free, hypoallergenic, and sweat resistant.",
      price: 79900, // ₹799.00
      stock: 25,
      images: ["/images/products/industrial-chain-choker.svg"],
      categoryId: catAccessories.id,
      isActive: true,
    },
    {
      name: "Folded Ribbed Knit Beanie",
      slug: "ribbed-knit-beanie",
      description: "Chunky ribbed knit acrylic beanie with double-folded cuff and woven rubberized Rore Club cyber badge. Keeps warmth locked in without losing its shape.",
      price: 69900, // ₹699.00
      stock: 50,
      images: ["/images/products/ribbed-knit-beanie.svg"],
      categoryId: catAccessories.id,
      isActive: true,
    },
    {
      name: "Arcade Night Oversized Tee",
      slug: "arcade-night-tee",
      description: "A pixel ship, a neon horizon, and a nod to late nights at the arcade.",
      price: 139900,
      stock: 0,
      images: ["/images/products/arcade-night-tee.webp"],
      categoryId: catFandom.id,
      isActive: true,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }

  console.log(`Sample catalog ready. Checked ${products.length} product slugs across four collections.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
