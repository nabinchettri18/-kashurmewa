"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { Product } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import { KashurmewLogo } from "@/components/brand/Logo";
import { getProductImages, WALNUT_PRODUCT_FALLBACK, WALNUT_HERO_FALLBACK } from "@/lib/product-images";
import "../kashurmewa-storefront.css";
import "../kashurmewa-brand.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

type ShopClientProps = { initialProducts: Product[]; catalogueError?: boolean };

export default function ShopPage({ initialProducts, catalogueError = false }: ShopClientProps) {
  const [items] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading] = useState(false);
  const [loadError] = useState(catalogueError);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(saved.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
    } catch { setCartCount(0); }
  }, []);

  const filtered = items
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const minA = a.variants.length ? Math.min(...a.variants.map((v) => v.price_inr)) : 0;
      const minB = b.variants.length ? Math.min(...b.variants.map((v) => v.price_inr)) : 0;
      if (sort === "low") return minA - minB;
      if (sort === "high") return minB - minA;
      return 0;
    });

  return (
    <main className="km-store ks-v2-shop-page">
      <div className="ks-announcement"><span>THE TASTE OF KASHMIR</span><span>Thoughtfully chosen. Beautifully brought home. <ArrowRight size={12} /></span></div>
      <NavigationHeader cartCount={cartCount} />

      <section className="ks-v2-shop-hero">
        <img src={WALNUT_HERO_FALLBACK} alt="Premium walnut still life for the KASHURMEWA collection" fetchPriority="high" />
        <div className="ks-v2-shop-hero-shade" />
        <div className="ks-v2-shop-hero-copy"><span className="ks-v2-eyebrow">THE KASHURMEWA COLLECTION</span><h1>Good things<br /><em>start here.</em></h1><p>Explore the products available today, with live prices and clear product details.</p><div className="ks-v2-shop-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></div></div>
        <span className="ks-v2-shop-hero-label">THE KASHURMEWA COLLECTION</span>
      </section>

      <section className="ks-v2-catalogue">
        <div className="ks-v2-catalogue-head"><div><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">SHOP THE SIGNATURE</span><h2>Our current <em>collection.</em></h2><p>Live products, current prices and available pack sizes.</p></div><span className="ks-v2-result-count">{loading ? "Loading catalogue" : loadError ? "Catalogue unavailable" : <>{items.length} {items.length === 1 ? "product" : "products"}</>}</span></div>
        <div className="ks-v2-catalogue-toolbar"><label className="ks-v2-search"><Search size={17} /><input placeholder="Search the collection" aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} /></label><label className="ks-v2-sort"><SlidersHorizontal size={15} /><span>Sort</span><select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></label></div>
        {loading ? <div className="ks-v2-shop-state">Loading the current collection…</div> :
          loadError ? <div className="ks-v2-shop-state" role="alert">We couldn’t load the catalogue right now. Please refresh or return shortly.</div> :
          !filtered.length ? <div className="ks-v2-shop-state"><h3>No matching products</h3><p>Try another search or clear the search field to explore the available collection.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div> :
          <div className="ks-v2-shop-grid">{filtered.map((p, index) => {
            const vs = [...p.variants].sort((a, b) => a.price_inr - b.price_inr);
            const minPrice = vs.length ? vs[0].price_inr : null;
            const image = getProductImages(p.images, p.name)[0];
            return <Link className="ks-v2-shop-card" href={`/products/${p.slug}`} key={p.id}>
              <div className="ks-v2-shop-card-image"><img src={image.url} alt={image.alt_text || p.name} loading={index > 2 ? "lazy" : "eager"} onError={(event) => { if (!event.currentTarget.src.includes("34415576")) event.currentTarget.src = WALNUT_PRODUCT_FALLBACK; }} /><span className="ks-v2-shop-card-tag">{index === 0 ? "THE SIGNATURE" : "FROM OUR COLLECTION"}</span><span className="ks-v2-shop-card-arrow"><ArrowUpRight size={18} /></span></div>
              <div className="ks-v2-shop-card-copy"><div className="ks-v2-shop-card-kicker"><span>THE PANTRY EDIT</span><span>{vs.length} {vs.length === 1 ? "pack option" : "pack options"}</span></div><div className="ks-v2-shop-card-title"><h3>{p.name}</h3><strong>{minPrice === null ? "Price unavailable" : `From ${money(minPrice)}`}</strong></div><p>{vs.map((v) => v.size).join(" · ") || "See product details"}</p><span className="ks-v2-shop-card-link">Explore product <ArrowRight size={14} /></span></div>
            </Link>;
          })}</div>}
        <div className="ks-v2-shop-note"><span>GOOD TO KNOW</span><p>Product availability and pricing are loaded from our live catalogue. Your final total, including applicable delivery charges, is shown before order confirmation.</p></div>
      </section>

      <footer className="ks-v2-footer"><div className="ks-v2-footer-main"><div className="ks-v2-footer-brand"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Get in touch <ArrowUpRight size={14} /></Link></div><div><small>SHOP</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/">Home</Link><Link href="/contact">Contact us</Link></div><div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div></div><div className="ks-v2-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div></footer>
    </main>
  );
}
