"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAllProducts, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-editorial-v2.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value);

type CartLine = { productId: string; variantId: string; qty: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchAllProducts()
      .then((rows) => { if (alive) setProducts(rows); })
      .catch((error) => {
        console.error("Unable to load Kashurmewa catalogue", error);
        if (alive) setLoadError(true);
      })
      .finally(() => { if (alive) setLoading(false); });

    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch { /* An unreadable cart should not block the storefront. */ }

    return () => { alive = false; };
  }, []);

  const packs = useMemo(
    () => products.flatMap((product) =>
      product.variants.map((variant, index) => ({
        product,
        variant,
        image: product.images[index % Math.max(product.images.length, 1)],
      })),
    ),
    [products],
  );

  const leadProduct = products[0] ?? null;
  const heroImage = leadProduct?.images[0]?.url;
  const storyImage = leadProduct?.images[1]?.url || heroImage;
  const startingPrice = packs.length ? Math.min(...packs.map(({ variant }) => variant.price_inr)) : null;

  function addToBag(product: Product, variant: ProductVariant) {
    if (variant.stock <= 0) {
      setNotice("This pack is currently unavailable.");
      return;
    }

    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]") as CartLine[];
      const existing = cart.find((item) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) {
          setNotice("Your bag already has the available quantity for this pack.");
          return;
        }
        existing.qty = Number(existing.qty) + 1;
      } else {
        cart.push({ productId: product.id, variantId: variant.id, qty: 1 });
      }
      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      setCartCount(cart.reduce((sum, item) => sum + Number(item.qty || 0), 0));
      setNotice(`${variant.size} · ${product.name} added to your bag`);
      window.setTimeout(() => setNotice(""), 2800);
    } catch {
      setNotice("We couldn't update your bag. Please try again.");
    }
  }

  return (
    <main className="km-store kv2">
      <div className="kv2-ribbon">
        <span>THE TASTE OF KASHMIR</span>
        <span className="kv2-ribbon-center"> A LITTLE CLOSER TO NATURE</span>
        <span>THOUGHTFULLY BROUGHT TO YOUR TABLE</span>
      </div>
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="kv2-toast" role="status">{notice}<Link href="/cart">View bag ↗</Link><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}

      <section className="kv2-hero" aria-label="Kashurmewa ·  The Taste of Kashmir">
        <div className="kv2-hero-copy">
          <div className="kv2-eyebrow"><span /> THE ORCHARD, REIMAGINED</div>
          <p className="kv2-hero-overline">KASHURMEWA PRESENTS</p>
          <h1>A little of<br />the valley.<br /><em>A lot of home.</em></h1>
          <p className="kv2-hero-description">A familiar harvest, thoughtfully brought into everyday life. Discover Kashmiri walnuts with a sense of place, presented for the tables and rituals that bring us together.</p>
          <div className="kv2-hero-actions">
            <Link href="#collection" className="kv2-primary">Explore the collection →</Link>
            <Link href="/about" className="kv2-underlink">Our story ↗</Link>
          </div>
          <div className="kv2-hero-foot">
            <span className="kv2-seal"></span>
            <span><b>Rooted in a distinctive harvest.</b><small>The Taste of Kashmir · Since the first crack.</small></span>
          </div>
          <span className="kv2-hero-index">01 ·  04 / THE KASHURMEWA EDIT</span>
        </div>

        <div className={`kv2-hero-art ${heroImage ? "" : "kv2-no-image"}`}>
          {heroImage
            ? <img className="kv2-hero-photo" src={heroImage} alt={leadProduct?.images[0]?.alt_text || leadProduct?.name || "Kashurmewa product"} />
            : <div className="kv2-image-placeholder"><span>KASHURMEWA</span><b>The Taste of Kashmir</b><small>Add your product photography in the admin catalogue to bring this frame to life.</small></div>}
          <div className="kv2-art-wash" />
          <div className="kv2-photo-caption"><span>THE SIGNATURE HARVEST</span><span>01 / KASHURMEWA</span></div>
          <div className="kv2-art-card">
            <span>MEET THE COLLECTION</span>
            <b>{leadProduct?.name || "A considered kind of good."}</b>
            <small>{startingPrice !== null ? `Packs from ${money(startingPrice)}` : "Explore the current collection"}</small>
            <Link href="#collection" aria-label="Explore the collection">↘</Link>
          </div>
          <div className="kv2-vertical-note">HARVEST · HOME · HERITAGE</div>
        </div>
      </section>

      <section className="kv2-marquee" aria-label="Brand values">
        <span>THE TASTE OF KASHMIR</span><i></i><span>MADE FOR SHARING</span><i></i><span>ROOTED IN NATURE</span><i></i><span>THE TASTE OF KASHMIR</span>
      </section>

      <section className="kv2-collection" id="collection">
        <div className="kv2-section-head">
          <div>
            <span className="kv2-eyebrow"><span /> YOUR EVERYDAY, ELEVATED</span>
            <h2>Good things<br /><em>come in good company.</em></h2>
          </div>
          <div className="kv2-section-aside">
            <p>A considered collection for everyday rituals, shared tables and thoughtful gifting. Choose the pack that feels right for you.</p>
            <Link href="/shop" className="kv2-underlink">View the full shop ↗</Link>
          </div>
        </div>

        {loading ? (
          <div className="kv2-state"><span className="kv2-spinner" /> Gathering the collection…</div>
        ) : loadError ? (
          <div className="kv2-state" role="alert">We couldn’t load the live collection. Please visit the <Link href="/shop">shop</Link> or try again shortly.</div>
        ) : !packs.length ? (
          <div className="kv2-empty"><span>THE COLLECTION IS TAKING SHAPE</span><h3>Something good is growing.</h3><p>Published products, pack sizes, prices and photographs will appear here from the live catalogue.</p><Link href="/contact" className="kv2-underlink">Speak with us →</Link></div>
        ) : (
          <div className="kv2-product-grid">
            {packs.slice(0, 6).map(({ product, variant, image }, index) => (
              <article className={`kv2-product ${index === 1 ? "kv2-product-offset" : ""}`} key={variant.id}>
                <Link href={`/products/${product.slug}`} className="kv2-product-image" aria-label={`View ${product.name}, ${variant.size}`}>
                  {image?.url
                    ? <img src={image.url} alt={image.alt_text || product.name} loading="lazy" />
                    : <div className="kv2-product-placeholder"><span>KASHURMEWA</span><small>THE TASTE OF KASHMIR</small></div>}
                  <span className="kv2-product-number">0{index + 1}</span>
                  <span className="kv2-product-size">{variant.size}</span>
                  <i>↗</i>
                </Link>
                <div className="kv2-product-meta">
                  <div className="kv2-product-title"><div><span>{product.name}</span><small>{variant.size} · WALNUTS IN SHELL</small></div><strong>{money(variant.price_inr)}</strong></div>
                  <p>{product.description || "A thoughtful pantry staple, ready for your table."}</p>
                  <div className="kv2-product-actions">
                    <button type="button" onClick={() => addToBag(product, variant)} disabled={variant.stock <= 0}>{variant.stock > 0 ? <>Add to bag →</> : "Currently unavailable"}</button>
                    <span className={variant.stock > 0 ? "kv2-stock" : "kv2-stock kv2-stock-empty"}><i />{variant.stock > 0 ? "In stock" : "Sold out"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="kv2-catalogue-note"><span>Live catalogue pricing and availability</span><span className="kv2-note-divider" /><span>Pack details before you buy</span><span className="kv2-note-divider" /><span>Delivery information at checkout</span></div>
      </section>

      <section className="kv2-manifesto">
        <div className="kv2-manifesto-photo">
          {storyImage ? <img src={storyImage} alt={leadProduct?.images[1]?.alt_text || leadProduct?.name || "Kashurmewa walnuts"} loading="lazy" /> : <div className="kv2-image-placeholder"><span>KASHURMEWA</span><b>A harvest with a story.</b></div>}
          <span className="kv2-photo-stamp">K / M<br /><i></i><br />EST. WITH CARE</span>
          <span className="kv2-manifesto-photo-label">A SENSE OF PLACE, AT YOUR TABLE.</span>
        </div>
        <div className="kv2-manifesto-copy">
          <span className="kv2-eyebrow"><span /> A STORY IN EVERY DETAIL</span>
          <h2>Some flavours<br />take you <em>somewhere.</em></h2>
          <p>To the warmth of a table with room for everyone. To the small pause between a busy day and a good evening. To the pleasure of something simple, shared slowly.</p>
          <p>Kashurmewa celebrates the character of Kashmiri walnuts with a thoughtful, modern approach to the everyday pantry.</p>
          <Link href="/about" className="kv2-dark-link">Discover our point of view →</Link>
          <div className="kv2-manifesto-signature">Kashurmewa <span>,  The Taste of Kashmir</span></div>
        </div>
      </section>

      <section className="kv2-values">
        <div className="kv2-values-head"><span className="kv2-eyebrow"><span /> THE KASHURMEWA STANDARD</span><h2>Less noise.<br /><em>More meaning.</em></h2></div>
        <div className="kv2-value-list">
          <article><span>01</span><div><h3>A focused collection</h3><p>Clear choices, useful pack sizes and a product story that stays close to its roots.</p></div></article>
          <article><span>02</span><div><h3>Honest details</h3><p>Prices, available quantities and product photographs come from the live catalogue.</p></div></article>
          <article><span>03</span><div><h3>Considered shopping</h3><p>A simple path from choosing your pack to reviewing the details before ordering.</p></div></article>
        </div>
      </section>

      <section className="kv2-final">
        <div className="kv2-final-orbit">K<br /><i></i><br />M</div>
        <span>THE TASTE OF KASHMIR</span>
        <h2>Bring a little<br /><em>more meaning</em> to the table.</h2>
        <Link href="#collection" className="kv2-primary kv2-primary-light">Find your favourite →</Link>
      </section>

      <footer className="kv2-footer">
        <div className="kv2-footer-top">
          <div className="kv2-footer-brand"><Link href="/" className="kv2-wordmark">kashur<span>mewa</span><i>®</i></Link><p>A familiar harvest. A thoughtful new ritual.</p><span className="kv2-footer-tagline">THE TASTE OF KASHMIR</span></div>
          <div><small>EXPLORE</small><Link href="/shop">Shop all</Link><Link href="/about">Our story</Link><Link href="/contact">Contact</Link></div>
          <div><small>YOUR ACCOUNT</small><Link href="/account">Sign in</Link><Link href="/cart">Your bag</Link></div>
          <div><small>HERE TO HELP</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div>
        </div>
        <div className="kv2-footer-bottom"><span>© {new Date().getFullYear()} Kashurmewa</span><span>MADE TO BE SHARED.</span><Link href="/policies/food-safety">Food safety information</Link></div>
      </footer>
    </main>
  );
}
