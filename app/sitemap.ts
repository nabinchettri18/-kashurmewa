import type { MetadataRoute } from "next";
import { fetchAllProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  // A custom domain has not been configured yet. Avoid publishing localhost or a guessed domain.
  if (!siteUrl) return [];

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/policies/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/policies/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const products = await fetchAllProducts();
    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    console.error("Unable to include catalogue products in sitemap:", error);
    return staticRoutes;
  }
}
