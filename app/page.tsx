"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Leaf, ShoppingBag, Sparkles } from "lucide-react";
import { fetchAllProducts, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import { KashurmewLogo } from "@/components/brand/Logo";
import "./kashurmewa-storefront.css";
import "./kashurmewa-brand.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchAllProducts()
      .then((items) => { if (alive) setProducts(items); })
      .catch((error) => { console.error("Unable to load the live catalogue", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(saved.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

  function addToBag(product: Product, variant: ProductVariant) {
    if (variant.stock <= 0) { setNotice("This option is currently unavailable."); return; }
    try {
      const saved = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = saved.find((item: { variantId: string }) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) { setNotice("Your bag already contains the available quantity."); return; }
        existing.qty = Number(existing.qty) + 1;
      } else {
        saved.push({ productId: product.id, variantId: variant.id, qty: 1 });
      }
      localStorage.setItem("kashurmewa-cart", JSON.stringify(saved));
      setCartCount(saved.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty || 0), 0));
      setNotice(product.name + " added to your bag.");
      window.setTimeout(() => setNotice(""), 2800);
    } catch {
      setNotice("We couldn't update your bag. Please try again.");
    }
  }

  return (
    <main className="km-store km-brand-home">
      <div className="km-brand-announcement"><span>THE TASTE OF KASHMIR</span><span>A sense of place. A place at your table.</span></div>
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="km-brand-toast" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}

      <section className="km-brand-hero">
        <img className="km-brand-hero-art" src="/kashurmewa-heritage-landscape.svg" alt="" fetchPriority="high" />
        <div className="km-brand-hero-grain" />
        <div className="km-brand-hero-copy">
          <span className="km-brand-eyebrow"><i /> KASHURMEWA · A TASTE OF PLACE</span>
          <h1>The Taste<br />of <em>Kashmir.</em></h1>
          <p>A thoughtful world of regional flavours, pantry favourites and meaningful gifts — inspired by a place, made to feel at home.</p>
          <div className="km-brand-hero-actions">
            <Link href="/shop" className="km-brand-button">Explore the collection <ArrowRight size={16} /></Link>
            <Link href="/about" className="km-brand-text-link">Our story <ArrowUpRight size={15} /></Link>
          </div>
          <div className="km-brand-hero-foot"><span>ROOTED IN HERITAGE</span><span>MADE FOR MODERN HOMES</span></div>
        </div>
        <div className="km-brand-hero-side">
          <div className="km-brand-seal"><span>KM</span><i /><small>THE TASTE OF KASHMIR</small></div>
          <p>Not just a product.<br /><em>A sense of place.</em></p>
          <ArrowDownRight size={22} />
        </div>
      </section>

      <section className="km-brand-assurances" aria-label="Shopping information">
        <div><Check /><span><b>Clear product details</b><small>Know what you’re choosing</small></span></div>
        <div><ShoppingBag /><span><b>Live catalogue</b><small>Current prices and pack options</small></span></div>
        <div><Leaf /><span><b>Rooted in a sense of place</b><small>Inspired by regional character</small></span></div>
        <div><Sparkles /><span><b>Thoughtful by design</b><small>A calm, considered experience</small></span></div>
      </section>

      <section className="km-brand-intro">
        <span className="km-brand-eyebrow km-brand-eyebrow-dark">MORE THAN WHAT’S IN THE BAG</span>
        <h2>A little heritage.<br /><em>A lot of heart.</em></h2>
        <p>Kashurmewa is being built as a premium regional pantry brand — a place for flavours, traditions and thoughtful finds that bring a little of Kashmir closer to home.</p>
        <Link href="/about" className="km-brand-underlink">Get to know Kashurmewa <ArrowUpRight size={15} /></Link>
      </section>

      <section className="km-brand-discovery">
        <div className="km-brand-discovery-card km-brand-discovery-story">
          <img src="/kashurmewa-heritage-landscape.svg" alt="" loading="lazy" />
          <div><span className="km-brand-eyebrow">OUR POINT OF VIEW</span><h2>Inspired by a place.<br /><em>Made for home.</em></h2><Link href="/about">Discover our story <ArrowRight size={15} /></Link></div>
          <span className="km-brand-discovery-index">01 / THE BRAND</span>
        </div>
        <div className="km-brand-discovery-card km-brand-discovery-shop">
          <div className="km-brand-discovery-mark">K<span>M</span></div>
          <div><span className="km-brand-eyebrow km-brand-eyebrow-dark">WHAT’S HERE TODAY</span><h2>Meet the<br /><em>current collection.</em></h2><p>Explore the products currently available, with live prices and pack options.</p><Link href="/shop">Shop the collection <ArrowRight size={15} /></Link></div>
          <span className="km-brand-discovery-index">02 / THE COLLECTION</span>
        </div>
      </section>

      <section className="km-brand-products" id="featured">
        <div className="km-brand-section-heading">
          <div><span className="km-brand-eyebrow km-brand-eyebrow-dark">THE PANTRY, AS IT GROWS</span><h2>Discover what’s <em>on the table.</em></h2></div>
          <Link href="/shop" className="km-brand-underlink">View all products <ArrowUpRight size={15} /></Link>
        </div>
        {loading ? <div className="km-brand-state">Loading the current collection…</div> :
          loadError ? <div className="km-brand-state" role="alert">We couldn’t load the live catalogue. Please visit the <Link href="/shop">shop</Link> or try again shortly.</div> :
          products.length === 0 ? <div className="km-brand-state">Our first collection is being prepared. <Link href="/contact">Get in touch</Link> if you have a question.</div> :
          <div className="km-brand-product-grid">
            {products.slice(0, 4).map((product) => {
              const variants = [...product.variants].sort((a, b) => a.price_inr - b.price_inr);
              const available = variants.filter((variant) => variant.stock > 0);
              const firstVariant = available[0] || variants[0];
              const minPrice = variants.length ? variants[0].price_inr : null;
              const image = product.images[0];
              return <article className="km-brand-product-card" key={product.id}>
                <Link className="km-brand-product-image" href={"/products/" + product.slug}>
                  {image ? <img src={image.url} alt={image.alt_text || product.name} loading="lazy" /> : <div className="km-brand-image-placeholder"><span>KASHURMEWA</span><small>THE TASTE OF KASHMIR</small></div>}
                  <span className="km-brand-product-open"><ArrowUpRight size={17} /></span>
                </Link>
                <div className="km-brand-product-info">
                  <div className="km-brand-product-meta"><span>THE COLLECTION</span><span>{variants.length} {variants.length === 1 ? "option" : "options"}</span></div>
                  <Link href={"/products/" + product.slug}><h3>{product.name}</h3></Link>
                  <div className="km-brand-product-price"><span>{minPrice === null ? "Price unavailable" : "From " + money(minPrice)}</span><small>{variants.map((variant) => variant.size).join(" · ")}</small></div>
                  {firstVariant && firstVariant.stock > 0
                    ? <button type="button" onClick={() => addToBag(product, firstVariant)}>Add {firstVariant.size} to bag <ShoppingBag size={14} /></button>
                    : <Link className="km-brand-product-unavailable" href={"/products/" + product.slug}>View product options <ArrowRight size={14} /></Link>}
                </div>
              </article>;
            })}
          </div>}
        <p className="km-brand-live-note"><Check size={14} /> Prices and availability are taken from the live catalogue. Delivery details are shown before you place an order.</p>
      </section>

      <section className="km-brand-manifesto">
        <div className="km-brand-manifesto-art"><img src="/kashurmewa-heritage-landscape.svg" alt="" loading="lazy" /><span>THE TASTE OF KASHMIR</span></div>
        <div className="km-brand-manifesto-copy"><span className="km-brand-eyebrow km-brand-eyebrow-dark">THE KASHURMEWA WAY</span><h2>Good things carry<br /><em>a sense of place.</em></h2><p>We believe the things we bring home can mean more than what’s on the label. Our aim is to build a considered collection that honours regional character while fitting naturally into modern everyday life.</p><Link href="/about" className="km-brand-underlink">Read our story <ArrowRight size={15} /></Link></div>
      </section>

      <section className="km-brand-last-call">
        <span className="km-brand-eyebrow">KASHURMEWA · THE TASTE OF KASHMIR</span>
        <h2>Find something<br /><em>that feels like home.</em></h2>
        <Link href="/shop" className="km-brand-button km-brand-button-light">Explore what’s available <ArrowRight size={16} /></Link>
      </section>

      <footer className="km-brand-footer">
        <div className="km-brand-footer-main">
          <div className="km-brand-footer-about"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Talk to us <ArrowUpRight size={14} /></Link></div>
          <div><small>EXPLORE</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div>
          <div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/contact">Contact us</Link></div>
          <div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div>
        </div>
        <div className="km-brand-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div>
      </footer>
    </main>
  );
}
