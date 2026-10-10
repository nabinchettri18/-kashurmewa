import { supabase } from "./supabase";

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

const PRODUCT_SELECT =
  "id,slug,name,description,origin,ingredients,storage_instructions,shelf_life,km_product_variants!inner(id,size,price_inr,stock,sku),km_product_images(url,alt_text,sort_order)";

function normalizeProduct(p: any): Product {
  const variants = (p.km_product_variants || [])
    .map((v: any) => ({
      id: v.id,
      size: v.size,
      price_inr: Number(v.price_inr),
      stock: Number(v.stock ?? 0),
      sku: v.sku ?? undefined,
    }))
    .sort((a: ProductVariant, b: ProductVariant) => a.price_inr - b.price_inr);

  const images = (p.km_product_images || [])
    .map((img: any) => ({
      url: img.url,
      alt_text: img.alt_text || null,
      sort_order: Number(img.sort_order || 0),
    }))
    .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || "",
    origin: p.origin || "Kashmir, India",
    ingredients: p.ingredients || "100% Walnuts",
    storage_instructions: p.storage_instructions || undefined,
    shelf_life: p.shelf_life || undefined,
    variants,
    images,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("km_products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("km_product_variants.active", true);

  if (error) {
    console.error("Unable to load Kashurmewa products from Supabase:", error.message);
    throw error;
  }

  return (data || []).map(normalizeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("km_products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .eq("km_product_variants.active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Unable to load Kashurmewa product from Supabase:", error.message);
    throw error;
  }

  return data ? normalizeProduct(data) : null;
}
