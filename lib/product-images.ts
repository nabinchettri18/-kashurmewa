export type CatalogImage = { url: string; alt_text: string | null; sort_order?: number };

// Curated walnut still life for product cards. This is illustrative stock photography,
// not a representation of the exact pack or its packaging.
export const WALNUT_PRODUCT_FALLBACK =
  "https://images.pexels.com/photos/34415576/pexels-photo-34415576.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Warm walnut still life for editorial/campaign surfaces; never use a landscape image as a product photo.
export const WALNUT_HERO_FALLBACK =
  "https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1600";

function usableImages(images: CatalogImage[] | null | undefined): CatalogImage[] {
  return (images || []).filter((image) => {
    const description = `${image.url} ${image.alt_text || ""}`.toLowerCase();
    const isKnownBadAsset = ["17131011", "14627184", "16089996"].some((assetId) => description.includes(assetId));
    const isLandscapeOrIllustration = /mountain|landscape|scenic panorama|valley panorama|cartoon|emoji overlay|illustration/.test(description);
    const isClearlyWalnutRelated = /walnut|walnuts|akhrot|in-shell/.test(description);
    return !isKnownBadAsset && !isLandscapeOrIllustration && isClearlyWalnutRelated;
  });
}

export function getProductImages(images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage[] {
  const usable = usableImages(images);
  return usable.length
    ? usable
    : [{ url: WALNUT_PRODUCT_FALLBACK, alt_text: `${productName} photographed as a walnut still life`, sort_order: 0 }];
}

export function getHeroProductImage(images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage {
  const usable = usableImages(images);
  return usable[0] || {
    url: WALNUT_PRODUCT_FALLBACK,
    alt_text: `${productName} photographed as a walnut still life`,
    sort_order: 0,
  };
}
