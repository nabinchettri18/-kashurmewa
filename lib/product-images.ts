export type CatalogImage = { url: string; alt_text: string | null; sort_order?: number };

// Neutral, clean-background image for catalogue cards; illustrative stock photography only.
export const WALNUT_PRODUCT_FALLBACK =
  "https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Richer still-life image for the campaign hero when the live catalogue has no usable image.
export const WALNUT_HERO_FALLBACK =
  "https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1600";

function usableImages(images: CatalogImage[] | null | undefined): CatalogImage[] {
  return (images || []).filter((image) => {
    const description = `${image.url} ${image.alt_text || ""}`.toLowerCase();
    // Exclude known non-product catalogue assets such as the mountain landscape.
    return !/\/(17131011|14627184|16089996)\//.test(description) &&
      !/mountain landscape|scenic panorama|landscape artwork|cartoon|emoji overlay/.test(description);
  });
}

export function getProductImages(images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage[] {
  const usable = usableImages(images);
  return usable.length
    ? usable
    : [{ url: WALNUT_PRODUCT_FALLBACK, alt_text: `${productName} on a clean light background`, sort_order: 0 }];
}

export function getHeroProductImage(images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage {
  const usable = usableImages(images);
  return usable[0] || {
    url: WALNUT_HERO_FALLBACK,
    alt_text: `${productName} in a warm editorial still life`,
    sort_order: 0,
  };
}
