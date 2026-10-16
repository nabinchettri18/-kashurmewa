export type CatalogImage = { url: string; alt_text: string | null; sort_order?: number };

// AI-generated KASHURMEWA walnut imagery stored locally in the repository.
// Catalogue URLs from older records are deliberately ignored so stock photos do not return.
export const WALNUT_PRODUCT_FALLBACK = "/images/walnut-closeup.webp";
export const WALNUT_HERO_FALLBACK = "/images/walnut-hero.webp";
export const WALNUT_ORCHARD_IMAGE = "/images/walnut-orchard.webp";

export function getProductImages(_images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage[] {
  return [
    { url: WALNUT_PRODUCT_FALLBACK, alt_text: `${productName} in an AI-generated walnut still life`, sort_order: 0 },
    { url: WALNUT_HERO_FALLBACK, alt_text: `${productName} styled for KASHURMEWA`, sort_order: 1 },
    { url: WALNUT_ORCHARD_IMAGE, alt_text: `Walnuts growing in an orchard, for the KASHURMEWA brand story`, sort_order: 2 },
  ];
}

export function getHeroProductImage(_images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage {
  return { url: WALNUT_HERO_FALLBACK, alt_text: `${productName} styled for KASHURMEWA`, sort_order: 0 };
}
