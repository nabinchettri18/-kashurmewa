export type CatalogImage = { url: string; alt_text: string | null; sort_order?: number };

// Curated walnut still life for product cards. This is illustrative stock photography,
// not a representation of the exact pack or its packaging.
export const WALNUT_PRODUCT_FALLBACK =
  "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Warm walnut still life for editorial/campaign surfaces; never use a landscape image as a product photo.
export const WALNUT_HERO_FALLBACK =
  "https://images.pexels.com/photos/35581352/pexels-photo-35581352.jpeg?auto=compress&cs=tinysrgb&w=1600";

function usableImages(images: CatalogImage[] | null | undefined): CatalogImage[] {
  // Only allow vetted walnut still-life assets in product galleries. Catalogue entries
  // can contain legacy landscape URLs even when their alt text names the product.
  const approvedWalnutPhotoIds = ["8303558", "34415576", "35581352"];
  return (images || []).filter((image) => {
    const url = image.url.toLowerCase();
    const isApprovedWalnutPhoto = approvedWalnutPhotoIds.some((assetId) => url.includes(`/photos/${assetId}/`));
    const isKnownBadAsset = ["17131011", "14627184", "16089996"].some((assetId) => url.includes(assetId));
    return isApprovedWalnutPhoto && !isKnownBadAsset;
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
