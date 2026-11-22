export type Category = "Tees" | "Hoodies" | "Desk mats";
export type Variant = { id: string; label: string; color: string };
export type Colorway = {
  name: string;
  swatch: string;
  image: string;
  detail: string;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  kind: Category;
  universe: "Manga" | "Comics";
  color: string;
  image: string;
  description: string;
  price: number;
  colors: Colorway[];
  variants: Variant[];
  archived?: boolean;
};
export type CartItem = { variantId: string; quantity: number };
export type CartLine = CartItem & {
  p: Product;
  label: string;
  color: string;
  image: string;
};
export const sizes = ["S", "M", "L", "XL", "2XL"] as const;
export const inr = (amount: number) => "₹" + amount.toLocaleString("en-IN");
export const productPath = (p: Product) => "/products/" + p.slug + "/";

// IMAGE SLOTS: replace each neutral studio placeholder and detail image (the preview crops the same still) with licensed,
// colour-matched garment cutouts with transparent backgrounds and new file names. Prices and IDs below are preview data.
function color(name: string, swatch: string, file: string): Colorway {
  return {
    name,
    swatch,
    image: "/atelier/" + file + ".webp",
    detail: "/atelier/" + file + ".webp",
  };
}
const ink = color("Washed black", "var(--rc-product-stage)", "black-tee"),
  bone = color("Bone", "var(--rc-text)", "ivory-tee");
const black = color("Ink black", "var(--rc-background)", "black-hoodie"),
  grey = color("Charcoal", "var(--rc-muted-text)", "grey-hoodie");
function apparel(
  id: string,
  slug: string,
  name: string,
  kind: "Tees" | "Hoodies",
  universe: Product["universe"],
  price: number,
  colors: Colorway[],
  description: string,
): Product {
  return {
    id,
    slug,
    name,
    kind,
    universe,
    price,
    colors,
    color: colors[0].name,
    image: colors[0].image,
    description,
    variants: colors.flatMap((c, index) =>
      sizes.map((label) => ({
        id: index === 0 ? id + "-" + label : id + "-" + index + "-" + label,
        label,
        color: c.name,
      })),
    ),
  };
}
export const conceptCatalog: Product[] = [
  apparel(
    "ronin",
    "sun-dragon-tee",
    "Sun Dragon Tee",
    "Tees",
    "Manga",
    899,
    [ink, bone],
    "The opening silhouette in Afterhours. A quiet front and a wide canvas for the ink work that gives this piece its name.",
  ),
  apparel(
    "nightwatch",
    "nightwatch-tee",
    "Nightwatch Tee",
    "Tees",
    "Comics",
    849,
    [bone, ink],
    "Drawn from the long shadows of a city at night. An easy tee conceived in bone and washed black.",
  ),
  apparel(
    "moon",
    "moonshift-hoodie",
    "Moonshift Hoodie",
    "Hoodies",
    "Manga",
    1599,
    [black, grey],
    "A hooded layer for the walk home after the last screening. Its darker palette follows the night scenes behind the collection.",
  ),
  apparel(
    "frame",
    "still-frame-hoodie",
    "Still Frame Hoodie",
    "Hoodies",
    "Comics",
    1699,
    [grey, black],
    "An off-duty silhouette inspired by the pause between panels. Charcoal sets the tone for this edition.",
  ),
  // Preserve older saved links and preview bags.
  {
    id: "city",
    slug: "panel-city-desk-mat",
    name: "Panel City Desk Mat",
    kind: "Desk mats",
    universe: "Comics",
    color: "Vermilion",
    price: 699,
    image: "/atelier/campaign-placeholder.webp",
    description: "An archived accessory from the earlier concept collection.",
    archived: true,
    colors: [],
    variants: [{ id: "city-standard", label: "Standard", color: "Vermilion" }],
  },
];
export const collection = conceptCatalog.filter((p) => !p.archived);
