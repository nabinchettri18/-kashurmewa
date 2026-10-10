import { supabase, isSupabaseConfigured } from "./supabase";

export type ProductVariant = {
  id: string;
  size: string;
  price_inr: number;
  stock: number;
  sku?: string;
};

export type ProductImage = {
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  origin: string;
  ingredients: string;
  storage_instructions?: string;
  shelf_life?: string;
  variants: ProductVariant[];
  images: ProductImage[];
};

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
    slug: "kashmiri-walnuts",
    name: "Kashmiri In-Shell Walnuts",
    description: "Handpicked premium Kashmiri walnuts with natural hard shells, grown in high-altitude orchards of Kashmir. Known for rich oil content, thin shells, crunchy kernels, and authentic natural flavor.",
    origin: "Kashmir, India",
    ingredients: "100% Kashmiri In-Shell Walnuts. No preservatives, bleach, or artificial coating.",
    storage_instructions: "Store in a cool, dry place away from direct heat and humidity. Keep sealed after opening.",
    shelf_life: "6 Months from packaging date",
    variants: [
      { id: "v1111111-1111-1111-1111-111111111111", size: "250 g", price_inr: 349, stock: 100, sku: "KM-WAL-250G" },
      { id: "v2222222-2222-2222-2222-222222222222", size: "500 g", price_inr: 649, stock: 75, sku: "KM-WAL-500G" },
      { id: "v3333333-3333-3333-3333-333333333333", size: "1 kg", price_inr: 1199, stock: 50, sku: "KM-WAL-1KG" }
    ],
    images: [
      { url: "https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg", alt_text: "Whole Kashmiri Walnuts in Shell", sort_order: 1 },
      { url: "https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg", alt_text: "Fresh Kashmiri Walnut Harvest", sort_order: 2 },
      { url: "https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg", alt_text: "Kashurmewa Walnut Presentation", sort_order: 3 }
    ]
  }
];

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("km_products")
      .select("id,slug,name,description,origin,ingredients,storage_instructions,shelf_life,km_product_variants(id,size,price_inr,stock,sku),km_product_images(url,alt_text,sort_order)")
      .eq("active", true);

    if (error || !data || data.length === 0) {
      return FALLBACK_PRODUCTS;
    }

    return data.map((p: any) => {
      const variants = (p.km_product_variants || [])
        .map((v: any) => ({
          id: v.id,
          size: v.size,
          price_inr: Number(v.price_inr),
          stock: Number(v.stock || 0),
          sku: v.sku
        }))
        .sort((a: ProductVariant, b: ProductVariant) => a.price_inr - b.price_inr);

      const images = (p.km_product_images || [])
        .map((img: any) => ({
          url: img.url,
          alt_text: img.alt_text || null,
          sort_order: Number(img.sort_order || 0)
        }))
        .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order);

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description || "",
        origin: p.origin || "Kashmir, India",
        ingredients: p.ingredients || "100% Walnuts",
        storage_instructions: p.storage_instructions,
        shelf_life: p.shelf_life,
        variants,
        images: images.length ? images : FALLBACK_PRODUCTS[0].images
      };
    });
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("km_products")
      .select("id,slug,name,description,origin,ingredients,storage_instructions,shelf_life,km_product_variants(id,size,price_inr,stock,sku),km_product_images(url,alt_text,sort_order)")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      return FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
    }

    const p = data as any;
    const variants = (p.km_product_variants || [])
      .map((v: any) => ({
        id: v.id,
        size: v.size,
        price_inr: Number(v.price_inr),
        stock: Number(v.stock || 0),
        sku: v.sku
      }))
      .sort((a: ProductVariant, b: ProductVariant) => a.price_inr - b.price_inr);

    const images = (p.km_product_images || [])
      .map((img: any) => ({
        url: img.url,
        alt_text: img.alt_text || null,
        sort_order: Number(img.sort_order || 0)
      }))
      .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || "",
      origin: p.origin || "Kashmir, India",
      ingredients: p.ingredients || "100% Walnuts",
      storage_instructions: p.storage_instructions,
      shelf_life: p.shelf_life,
      variants,
      images: images.length ? images : FALLBACK_PRODUCTS[0].images
    };
  } catch {
    return FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
  }
}
