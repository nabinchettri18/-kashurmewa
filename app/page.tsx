"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import "./kashurmewa-storefront.css";

const WALNUT_HERO = "https://images.pexels.com/photos/36040913/pexels-photo-36040913.jpeg?auto=compress&cs=tinysrgb&w=1800";
const WALNUT_DETAIL = "https://images.pexels.com/photos/37309469/pexels-photo-37309469.jpeg?auto=compress&cs=tinysrgb&w=1200";
const ORCHARD_IMAGE = "https://images.pexels.com/photos/17131011/pexels-photo-17131011.jpeg?auto=compress&cs=tinysrgb&w=1400";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetchProductBySlug("kashmiri-walnuts")
      .then((result) => { if (alive) setProduct(result); })
      .catch((error) => { console.error("Unable to load Kashurmewa product", error); if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
    } catch {}
    return () => { alive = false; };
  }, []);

  function addToBag(variant: ProductVariant) {
    if (!product || variant.stock <= 0) { setNotice("This pack is currently unavailable."); return; }
    try {
      const cart = JSON.parse(localStorage.getItem("kashurmewa-cart") || "[]");
      const existing = cart.find((item: { variantId: string }) => item.variantId === variant.id);
      if (existing) {
        if (Number(existing.qty) >= variant.stock) { setNotice("Your bag already has the available quantity for this pack."); return; }
        existing.qty = Number(existing.qty) + 1;
      } else cart.push({ productId: product.id, variantId: variant.id, qty: 1 });
      localStorage.setItem("kashurmewa-cart", JSON.stringify(cart));
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + Number(item.qty || 0), 0));
      setNotice(variant.size + " added to your bag");
      window.setTimeout(() => setNotice(""), 2600);
    } catch { setNotice("We couldn't update your bag. Please try again."); }
  }

  return (
    <main className="km-store">
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="ks-toast" role="status">{notice}</div>}

      <section className="ks-hero">
        <div className="ks-hero-copy">
          <span className="ks-kicker"><i /> THE WALNUT, RECONSIDERED</span>
          <h1>A better kind of<br /><em>everyday good.</em></h1>
          <p>Discover Kashmiri walnuts in shell, thoughtfully packed for your everyday pantry, family tables and moments worth sharing.</p>
          <div className="ks-actions">
            <Link className="ks-button" href="#shop">Shop walnuts <ArrowRight size={17} /></Link>
            <span className="ks-price-note">{loading ? "Discover the collection" : product?.variants?.length ? `Packs from ${money(Math.min(...product.variants.map(v => v.price_inr)))}` : "Explore the collection"}</span>
          </div>
          <div className="ks-proof">
            <span><Leaf size={18}/><b>Walnuts in shell</b></span>
            <span><PackageCheck size={18}/><b>Packed with care</b></span>
            <span><Truck size={18}/><b>Pan-India shopping</b></span>
          </div>
        </div>
        <div className="ks-hero-media">
          <img src={WALNUT_HERO} alt="Close-up of whole walnuts in their natural shells" />
          <div className="ks-image-label"><span>THE SIGNATURE COLLECTION</span><b>Simple by nature.</b></div>
          <div className="ks-round-label">NATURAL<br/><strong>GOODNESS</strong><br/>IN EVERYDAY LIFE</div>
        </div>
      </section>

      <section className="ks-benefit-bar" aria-label="Shopping benefits">
        <div><ShieldCheck/><span><b>Clear pack options</b><small>Choose the size that suits you</small></span></div>
        <div><PackageCheck/><span><b>Considered packaging</b><small>Made for your pantry</small></span></div>
        <div><Truck/><span><b>Delivery across India</b><small>Review delivery at checkout</small></span></div>
        <div><ShoppingBag/><span><b>Easy to shop</b><small>Choose, add to bag, checkout</small></span></div>
      </section>

      <section className="ks-shop" id="shop">
        <div className="ks-heading">
          <div><span className="ks-kicker">SHOP THE COLLECTION</span><h2>Your pantry’s new <em>favourite.</em></h2><p>One signature product. Find the pack size that works for you.</p></div>
          <Link className="ks-inline-link" href="/shop">View shop <ArrowUpRight size={16}/></Link>
        </div>
        {loading ? <div className="ks-state">Loading current pack sizes and prices…</div> :
          loadError ? <div className="ks-state">We couldn’t load the current catalogue. Please visit the <Link href="/shop">shop</Link>.</div> :
          product?.variants?.length ? (
            <div className="ks-products">
              {product.variants.map((variant, index) => (
                <article className="ks-product-card" key={variant.id}>
                  <Link className="ks-product-image" href="/shop" aria-label={`View ${variant.size} Kashmiri walnuts`}>
                    <img src={product.images?.[0]?.url || (index === 0 ? WALNUT_DETAIL : WALNUT_HERO)} alt={product.name} loading="lazy" />
                    <span>{index === 0 ? "THE SIGNATURE" : "PANTRY ESSENTIAL"}</span>
                  </Link>
                  <div className="ks-product-info">
                    <div className="ks-product-title"><div><small>KASHURMEWA · WALNUTS</small><h3>Whole Kashmiri walnuts</h3></div><strong>{money(variant.price_inr)}</strong></div>
                    <p>{variant.size} pack <span>·</span> In-shell walnuts</p>
                    <button className="ks-add-button" disabled={variant.stock <= 0} onClick={() => addToBag(variant)}>
                      {variant.stock > 0 ? <>Add to bag <ShoppingBag size={16}/></> : <>Currently unavailable</>}
                    </button>
                    <div className="ks-stock"><span className={variant.stock > 0 ? "ks-stock-dot" : "ks-stock-dot ks-sold-out"}/>{variant.stock > 0 ? "Available to order" : "Out of stock"}</div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="ks-state">Our collection is being prepared. Please check back soon.</div>}
      </section>

      <section className="ks-story" id="story">
        <div className="ks-story-photo"><img src={ORCHARD_IMAGE} alt="Green walnuts growing on a tree in an orchard"/><span>FROM ORCHARD TO EVERYDAY</span></div>
        <div className="ks-story-copy"><span className="ks-kicker">A BRAND WITH ROOTS</span><h2>Good food starts<br/>with <em>good choices.</em></h2><p>Kashurmewa is built around one simple idea: make it easier to bring a distinctive harvest into everyday life. We focus on the product, clear pack choices and thoughtful presentation—without making shopping complicated.</p><Link className="ks-button ks-button-light" href="/about">Meet Kashurmewa <ArrowRight size={16}/></Link></div>
      </section>

      <section className="ks-why">
        <div className="ks-heading"><div><span className="ks-kicker">THE KASHURMEWA DIFFERENCE</span><h2>Thoughtful from <em>the start.</em></h2></div></div>
        <div className="ks-why-grid">
          <div><span>01</span><Sprout/><h3>A product-led approach</h3><p>We keep the focus on walnuts, not an endless catalogue of distractions.</p></div>
          <div><span>02</span><PackageCheck/><h3>Clear choices</h3><p>Compare available pack sizes and current prices before adding to your bag.</p></div>
          <div><span>03</span><ShoppingBag/><h3>A simple experience</h3><p>Browse the collection, choose your pack and review your order in the cart.</p></div>
        </div>
      </section>

      <section className="ks-final-cta"><div><span className="ks-kicker">READY WHEN YOU ARE</span><h2>Make room for <em>something good.</em></h2></div><Link className="ks-button" href="#shop">Find your pack <ArrowRight size={17}/></Link></section>

      <footer className="ks-footer">
        <div className="ks-footer-main"><div className="ks-footer-brand"><span className="ks-wordmark">kashur<span>mewa</span></span><p>Kashmiri walnuts, thoughtfully brought to your everyday.</p></div><div><small>SHOP</small><Link href="/shop">All walnuts</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div><div><small>DISCOVER</small><Link href="/about">Our story</Link><a href="#shop">Pack sizes</a><a href="#shop">The collection</a></div><div className="ks-footer-note"><b>Goodness, grown naturally.</b><p>Thank you for shopping Kashurmewa.</p></div></div>
        <div className="ks-footer-bottom"><span>© {new Date().getFullYear()} Kashurmewa</span><span>Made for everyday rituals.</span></div>
      </footer>
    </main>
  );
}
