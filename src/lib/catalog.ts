/** Storefront view model. IDs in a live catalogue should come from the merchant's database. */
export type Variant = { id: string; label: string };
export type Product = {
  id: string;
  name: string;
  slug: string;
  kind: "Tees" | "Hoodies" | "Desk mats";
  universe: "Manga" | "Comics";
  color: string;
  image: string;
  description: string;
  price: number;
  variants: Variant[];
};

function sizes(id: string): Variant[] {
  return ["S", "M", "L", "XL", "2XL"].map((label) => ({
    id: id + "-" + label,
    label,
  }));
}

// Editorial concept pieces for the preview. Never submit these variant IDs for fulfilment.
export const conceptCatalog: Product[] = [
  {
    id: "ronin",
    name: "Sun Dragon Tee",
    slug: "sun-dragon-tee",
    kind: "Tees",
    universe: "Manga",
    color: "Washed black",
    image: "ronin-tee.webp",
    price: 899,
    description:
      "A dragon breaks through a vermilion sun. The back print takes its cue from the double-page spread you stop and stare at.",
    variants: sizes("ronin"),
  },
  {
    id: "nightwatch",
    name: "Nightwatch Tee",
    slug: "nightwatch-tee",
    kind: "Tees",
    universe: "Comics",
    color: "Bone",
    image: "nightwatch-tee.webp",
    price: 849,
    description:
      "A masked vigilante in heavy black ink. A quiet front-row seat to the city after the last train home.",
    variants: sizes("nightwatch"),
  },
  {
    id: "moon",
    name: "Moonshift Hoodie",
    slug: "moonshift-hoodie",
    kind: "Hoodies",
    universe: "Manga",
    color: "Ink black",
    image: "moon-hoodie.webp",
    price: 1599,
    description:
      "Cold blue ink against a black field. Made for fans who remember the still frame just before the fight.",
    variants: sizes("moon"),
  },
  {
    id: "city",
    name: "Panel City Desk Mat",
    slug: "panel-city-desk-mat",
    kind: "Desk mats",
    universe: "Comics",
    color: "Vermilion",
    image: "city-deskmat.webp",
    price: 699,
    description:
      "A whole city in a single frame. Red accents and sweeping ink lines bring a little comic-book chaos to your desk.",
    variants: [{ id: "city-standard", label: "Standard" }],
  },
];
export const inr = (amount: number) => "₹" + amount.toLocaleString("en-IN");

export const productPath = (product: Product) =>
  "/products/" + product.slug + "/";
