export type CatalogImage = { url: string; alt_text: string | null; sort_order?: number };

// A known walnut photograph is used only when the live catalogue has no usable product image.
export const WALNUT_PRODUCT_FALLBACK =
  "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg?auto=compress&cs=tinysrgb&w=1400";

export function getProductImages(images: CatalogImage[] | null | undefined, productName = "Kashmiri walnuts"): CatalogImage[] {
  const usable = (images || []).filter((image) => {
    const description = `${image.url} ${image.alt_text || ""}`.toLowerCase();
    // This known catalogue asset is a mountain landscape, not a product photo.
    return !/\/(17131011|14627184|16089996)\//.test(description) && !/mountain landscape|scenic panorama|landscape artwork|cartoon|emoji overlay/.test(description);
  });

  return usable.length
    ? usable
    : [{ url: WALNUT_PRODUCT_FALLBACK, alt_text: `${productName} in their natural shells`, sort_order: 0 }];
}
