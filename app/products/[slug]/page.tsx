import ProductDetailClient from "./product-detail-client";
import { fetchProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    return <ProductDetailClient initialProduct={product} />;
  } catch (error) {
    console.error("Unable to render live product details:", error);
    return <ProductDetailClient initialProduct={null} initialLoadError />;
  }
}
