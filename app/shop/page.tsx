"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { fetchAllProducts, Product } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-shop-v2.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    let cancelled = false;
    fetchAllProducts()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => items
    .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const priceA = a.variants.length ? Math.min(...a.variants.map((variant) => variant.price_inr)) : 0;
      const priceB = b.variants.length ? Math.min(...b.variants.map((variant) => variant.price_inr)) : 0;
      return sort === "low" ? priceA - priceB : sort === "high" ? priceB - priceA : 0;
    }), [items, query, sort]);

  const totalPacks = items.reduce((count, product) => count + product.variants.length, 0);
  const heroImage = items.find((product) => product.images[0]?.url)?.images[0];

  return (
    <main className="km-shop-v2">
      <div className="kshop-ribbon"><span>THE TASTE OF KASHMIR</span><span className="kshop-ribbon-center"><Sparkles size={12} /> A CONSIDERED KIND OF GOOD</span><span>THE KASHURMEWA EDIT</span></div>
      <NavigationHeader cartCount={cartCount} />

      <section className="kshop-hero">
        <div className="kshop-copy">
          <span className="kshop-eyebrow">THE KASHURMEWA COLLECTION</span>
          <p className="kshop-overline">A LITTLE MORE MEANING, IN EVERY PACK</p>
          <h1>Good things<br />start <em>here.</em></h1>
          <p className="kshop-intro">Discover the character of Kashmiri walnuts, thoughtfully brought to your table. Choose a pack for your everyday ritual, your family table or a little something to share.</p>
          <div className="kshop-facts"><span><b>{String(items.length).padStart(2, "0")}</b> PRODUCTS</span><i /><span><b>{String(totalPacks).padStart(2, "0")}</b> PACK OPTIONS</span><i /><span>LIVE CATALOGUE</span></div>
        </div>
        <div className="kshop-art">
          {heroImage?.url ? <img src={heroImage.url} alt={heroImage.alt_text || "Kashurmewa walnut product"} /> : <div className="kshop-placeholder"><span>KASHURMEWA</span><b>The Taste of Kashmir</b><small>Product photography from your live catalogue will appear here.</small></div>}
          <div className="kshop-art-shade" />
          <span className="kshop-art-top">THE SIGNATURE HARVEST <i>01 / KM</i></span>
          <div className="kshop-art-note"><small>THE COLLECTION</small><b>Find your everyday favourite.</b><span>Thoughtfully chosen. Simply presented.</span></div>
        </div>
      </section>

      <div className="kshop-ticker"><span>ROOTED IN NATURE</span><i>✳</i><span>MADE FOR SHARING</span><i>✳</i><span>THE TASTE OF KASHMIR</span><i>✳</i><span>ROOTED IN NATURE</span></div>

      <section className="kshop-catalogue" id="collection">
        <div className="kshop-heading"><div><span className="kshop-eyebrow">SHOP THE COLLECTION</span><h2>Choose your <em>good thing.</em></h2><p>Clear pack options. Current prices. No guesswork.</p></div><span className="kshop-count">{String(filtered.length).padStart(2, "0")} ITEMS</span></div>
        <div className="kshop-toolbar">
          <label><Search size={16} /><input placeholder="Search the collection" aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
          <div><SlidersHorizontal size={15} /><span>SORT BY</span><select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></div>
        </div>
        {loading ? <div className="kshop-state"><span className="kshop-spinner" /> Gathering the current collection…</div>
          : loadError ? <div className="kshop-state" role="alert">We couldn’t load the catalogue. Please refresh or try again shortly.</div>
          : !filtered.length ? <div className="kshop-empty"><span>THE KASHURMEWA COLLECTION</span><h3>{query ? "Nothing found just yet." : "The next good thing is on its way."}</h3><p>{query ? "Try another search or clear the search field to see all available products." : "Products will appear here when they are published in the live catalogue."}</p>{query && <button type="button" onClick={() => setQuery("")}>CLEAR SEARCH <ArrowRight size={14} /></button>}</div>
          : <div className="kshop-grid">{filtered.map((product, index) => {
            const variants = [...product.variants].sort((a, b) => a.price_inr - b.price_inr);
            const minPrice = variants.length ? variants[0].price_inr : null;
            const image = product.images[0];
            const available = variants.some((variant) => variant.stock > 0);
            return <Link className="kshop-card" href={"/products/" + product.slug} key={product.id}>
              <div className="kshop-card-image">{image?.url ? <img src={image.url} alt={image.alt_text || product.name} loading="lazy" /> : <div className="kshop-placeholder"><span>KASHURMEWA</span><small>THE TASTE OF KASHMIR</small></div>}<span className="kshop-index">{String(index + 1).padStart(2, "0")}</span><span className="kshop-pack-count">{variants.length} PACK OPTIONS</span><i><ArrowUpRight size={18} /></i></div>
              <div className="kshop-card-info"><div><small>THE SIGNATURE COLLECTION</small><h3>{product.name}</h3><p>{variants.map((variant) => variant.size).join(" · ") || "Details coming soon"}</p></div><strong>{minPrice === null ? "Price on request" : "From " + money(minPrice)}</strong></div>
              <div className="kshop-card-bottom"><span>{available ? "Explore the product" : "View product details"}</span><span className={available ? "kshop-stock" : "kshop-stock kshop-stock-out"}><i />{available ? "IN STOCK" : "CHECK AVAILABILITY"}</span><ArrowRight size={16} /></div>
            </Link>;
          })}</div>}
        <div className="kshop-bottom-note"><span>✳</span> Prices and availability are taken from the live catalogue. Delivery details are shown before ordering.</div>
      </section>

      <section className="kshop-story"><div><span className="kshop-eyebrow">A THOUGHTFUL EVERYDAY</span><h2>From a distinctive harvest<br />to <em>your home.</em></h2></div><p>Kashurmewa is about keeping good things close: considered choices, honest product details and the pleasure of sharing something simple. Thank you for making a place for us at your table.</p><Link href="/about">OUR STORY <ArrowUpRight size={15} /></Link></section>
      <footer className="kshop-footer"><Link href="/" className="kshop-wordmark">kashur<span>mewa</span></Link><span>THE TASTE OF KASHMIR</span><div><Link href="/about">Our story</Link><Link href="/contact">Contact</Link><Link href="/policies/shipping">Shipping</Link><Link href="/cart">Your bag ({cartCount})</Link></div><small>© {new Date().getFullYear()} KASHURMEWA · MADE TO BE SHARED</small></footer>
    </main>
  );
}
