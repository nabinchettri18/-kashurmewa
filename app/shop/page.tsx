"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllProducts, Product } from "@/lib/catalog";
import { KashurmewLogo } from "@/components/brand/Logo";

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
    <main className="commerce-page">
      <header className="commerce-header">
        <KashurmewLogo variant="dark" size="sm" />
        <nav>
          <Link className="active" href="/shop">Shop</Link>
          <Link href="/about">About Us</Link>
          <Link href="/account">Account</Link>
        </nav>
        <Link className="commerce-bag" href="/cart">Bag ↗</Link>
      </header>

      <section className="shop-banner">
        <div>
          <span className="commerce-eyebrow">THE KASHURMEWA CATALOGUE</span>
          <h1>Good things<br /><i>start here.</i></h1>
          <p>Handpicked Kashmiri walnuts in shell. Sourced directly from mountain orchards and delivered fresh pan-India.</p>
        </div>
        <div className="shop-banner-image">
          <img src="https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg" alt="Walnuts arranged on a natural surface" />
        </div>
      </section>

      <section className="catalogue">
        <div className="catalogue-top">
          <div>
            <span className="commerce-eyebrow">SIGNATURE HARVEST</span>
            <h2>Shop All Products</h2>
          </div>
          <div className="catalogue-controls">
            <input placeholder="Search products..." aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="commerce-muted">Loading collection from Supabase…</p>
        ) : loadError ? (
          <p className="commerce-muted" role="alert">We couldn’t load the catalogue. Check the Supabase connection and product-table permissions, then refresh.</p>
        ) : !filtered.length ? (
          <p className="commerce-muted">No active products match your search. Add or activate products in Supabase to display them here.</p>
        ) : (
          <div className="commerce-grid">
            {filtered.map((p) => {
              const vs = [...p.variants].sort((a, b) => a.price_inr - b.price_inr);
              const minPrice = vs.length ? vs[0].price_inr : null;
              const image = p.images[0]?.url;

              return (
                <Link className="commerce-product" href={`/products/${p.slug}`} key={p.id}>
                  <div className="commerce-product-image">
                    {image ? <img src={image} alt={p.name} /> : <div className="commerce-muted">Image coming soon</div>}
                    <span>EXPLORE ↗</span>
                  </div>
                  <div className="commerce-product-info">
                    <div>
                      <small>KASHMIRI IN-SHELL WALNUTS</small>
                      <h3>{p.name}</h3>
                      <p>{vs.map((v) => v.size).join(" · ")}</p>
                    </div>
                    <strong>{minPrice === null ? "Price unavailable" : `From ₹${minPrice.toLocaleString("en-IN")}`}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="commerce-footer">
        <KashurmewLogo variant="dark" size="sm" />
        <span>Authentic Kashmiri Produce.</span>
        <Link href="/about">About Us</Link>
        <Link href="/policies/shipping">Shipping Policy</Link>
        <Link href="/cart">Your Bag</Link>
      </footer>
    </main>
  );
}
