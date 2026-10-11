"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sprout, Truck } from "lucide-react";
import { fetchProductBySlug, Product, ProductVariant } from "@/lib/catalog";
import { NavigationHeader } from "@/components/navigation/Header";
import { KashurmewLogo } from "@/components/brand/Logo";
import "./kashurmewa-storefront.css";

const WALNUT_HERO = "https://images.pexels.com/photos/36040913/pexels-photo-36040913.jpeg?auto=compress&cs=tinysrgb&w=2000";
const WALNUT_DETAIL = "https://images.pexels.com/photos/37309469/pexels-photo-37309469.jpeg?auto=compress&cs=tinysrgb&w=1200";
const ORCHARD_IMAGE = "https://images.pexels.com/photos/17131011/pexels-photo-17131011.jpeg?auto=compress&cs=tinysrgb&w=1400";
const VALLEY_IMAGE = "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1600";
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
    <main className="km-store ks-visual-store">
      <div className="ks-announcement"><span>THE TASTE OF KASHMIR</span><span>Thoughtfully chosen. Beautifully brought home. <ArrowRight size={12} /></span></div>
      <NavigationHeader cartCount={cartCount} />
      {notice && <div className="ks-toast" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}

      <section className="ks-v2-hero" aria-label="Kashurmewa signature collection">
        <img className="ks-v2-hero-image" src={WALNUT_HERO} alt="A close, natural view of whole walnuts" fetchPriority="high" />
        <div className="ks-v2-hero-shade" />
        <div className="ks-v2-hero-content">
          <span className="ks-v2-eyebrow"><i /> KASHURMEWA · THE SIGNATURE COLLECTION</span>
          <h1>A little of the valley.<br /><em>A lot of home.</em></h1>
          <p>Familiar harvests, thoughtfully brought into everyday life. Discover our signature walnuts, chosen for the moments and tables that bring us together.</p>
          <div className="ks-v2-actions">
            <Link className="ks-v2-button" href="#shop">Explore the collection <ArrowRight size={17} /></Link>
            <Link className="ks-v2-story-link" href="/about">Our story <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="ks-v2-hero-caption"><span>ROOTED IN PLACE</span><span>MADE FOR EVERYDAY RITUALS</span></div>
        <div className="ks-v2-hero-index">01 <i /> 03</div>
      </section>

      <section className="ks-v2-service-row" aria-label="Shopping details">
        <div><ShieldCheck /><span><b>Thoughtfully selected</b><small>Clear product details</small></span></div>
        <div><PackageCheck /><span><b>Considered packaging</b><small>Ready for your pantry</small></span></div>
        <div><Truck /><span><b>Delivery details upfront</b><small>Review before checkout</small></span></div>
        <div><ShoppingBag /><span><b>Secure shopping</b><small>A clear checkout journey</small></span></div>
      </section>

      <section className="ks-v2-collections" aria-labelledby="ks-v2-collection-title">
        <div className="ks-v2-section-head">
          <div><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">A GOOD PLACE TO BEGIN</span><h2 id="ks-v2-collection-title">Discover the <em>signature.</em></h2></div>
          <p>One considered collection, made easier to explore. Find the pack that feels right for your table.</p>
        </div>
        <div className="ks-v2-collection-grid">
          <Link href="#shop" className="ks-v2-collection-feature">
            <img src={WALNUT_DETAIL} alt="Whole walnuts in their natural shells" loading="lazy" />
            <span className="ks-v2-image-shade" />
            <span className="ks-v2-collection-copy"><small>THE SIGNATURE</small><strong>Whole Kashmiri<br />walnuts</strong><span>Explore the collection <ArrowRight size={15} /></span></span>
            <span className="ks-v2-collection-number">01 / 01</span>
          </Link>
          <Link href="/about" className="ks-v2-collection-story">
            <img src={VALLEY_IMAGE} alt="A mountain landscape in the Himalayan region" loading="lazy" />
            <span className="ks-v2-story-shade" />
            <span className="ks-v2-story-card"><small>THE KASHURMEWA STORY</small><strong>Inspired by a place.<br /><em>Made for home.</em></strong><span>Meet our approach <ArrowUpRight size={15} /></span></span>
          </Link>
        </div>
      </section>

      <section className="ks-v2-shop" id="shop">
        <div className="ks-v2-section-head">
          <div><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">THE PANTRY EDIT</span><h2>Find your <em>everyday.</em></h2></div>
          <Link className="ks-v2-view-all" href="/shop">View the shop <ArrowUpRight size={16} /></Link>
        </div>
        {loading ? <div className="ks-state"><span className="ks-loading-dot" /> Loading current pack sizes and prices…</div> :
          loadError ? <div className="ks-state" role="alert">We couldn’t load the live catalogue. Please try the <Link href="/shop">shop page</Link> or come back shortly.</div> :
          product?.variants?.length ? (
            <div className="ks-v2-products">
              {product.variants.map((variant, index) => (
                <article className="ks-v2-product-card" key={variant.id}>
                  <Link className="ks-v2-product-visual" href={"/products/" + product.slug} aria-label={"View " + variant.size + " Kashmiri walnuts"}>
                    <img src={product.images?.[index % Math.max(product.images.length, 1)]?.url || (index === 0 ? WALNUT_DETAIL : WALNUT_HERO)} alt={product.images?.[index % Math.max(product.images.length, 1)]?.alt_text || product.name} loading="lazy" />
                    <span className="ks-v2-product-tag">{index === 0 ? "A GOOD PLACE TO START" : index === 1 ? "FOR THE PANTRY" : "MADE FOR SHARING"}</span>
                    <span className="ks-v2-product-open"><ArrowUpRight size={18} /></span>
                  </Link>
                  <div className="ks-v2-product-details">
                    <div className="ks-v2-product-meta"><span>THE SIGNATURE COLLECTION</span><span>{variant.size}</span></div>
                    <div className="ks-v2-product-name-price"><Link href={"/products/" + product.slug}><h3>Whole Kashmiri walnuts</h3></Link><strong>{money(variant.price_inr)}</strong></div>
                    <p>In-shell walnuts · {variant.size} pack</p>
                    <button className="ks-v2-add" type="button" disabled={variant.stock <= 0} onClick={() => addToBag(variant)}>{variant.stock > 0 ? <>Add to bag <ShoppingBag size={15} /></> : <>Currently unavailable</>}</button>
                    <span className={"ks-v2-stock " + (variant.stock <= 0 ? "is-out" : "")}><i />{variant.stock > 0 ? "Available to order" : "Out of stock"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="ks-state">The collection is being prepared. Please check back soon or <Link href="/contact">contact us</Link>.</div>}
        <p className="ks-v2-live-note"><Check size={14} /> Live catalogue pricing and availability. Delivery charges are shown before you place an order.</p>
      </section>

      <section className="ks-v2-editorial">
        <div className="ks-v2-editorial-image"><img src={ORCHARD_IMAGE} alt="Natural orchard textures and leafy branches" loading="lazy" /><span>SMALL MOMENTS. GOOD THINGS.</span></div>
        <div className="ks-v2-editorial-copy"><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">A LITTLE MORE MEANING</span><h2>Some things are best when they’re <em>shared.</em></h2><p>A bowl on the table. A familiar taste. A little pause in a busy day. Kashurmewa celebrates the simple rituals that make a place feel close, wherever home happens to be.</p><Link className="ks-v2-text-link" href="/about">Discover our story <ArrowRight size={16} /></Link></div>
      </section>

      <section className="ks-v2-values">
        <div className="ks-v2-values-heading"><span className="ks-v2-eyebrow ks-v2-eyebrow-dark">THE KASHURMEWA WAY</span><h2>Less noise.<br /><em>More meaning.</em></h2><p>A shopping experience built around clear choices, considered details and products that earn their place in your home.</p></div>
        <div className="ks-v2-value-list">
          <div><span>01</span><Sprout /><div><h3>Rooted in a sense of place</h3><p>A brand inspired by regional character, familiar flavours and the feeling of home.</p></div></div>
          <div><span>02</span><Leaf /><div><h3>Simple, clear choices</h3><p>Product information, pack sizes and current prices shown before you buy.</p></div></div>
          <div><span>03</span><PackageCheck /><div><h3>Considered in the details</h3><p>From browsing to checkout, the experience should feel calm, clear and dependable.</p></div></div>
        </div>
      </section>

      <section className="ks-v2-final">
        <img src={WALNUT_HERO} alt="" loading="lazy" />
        <div><span className="ks-v2-eyebrow">THE TASTE OF KASHMIR</span><h2>Bring a little<br /><em>closer to home.</em></h2><Link className="ks-v2-button ks-v2-button-light" href="#shop">Shop the signature <ArrowRight size={17} /></Link></div>
      </section>

      <footer className="ks-v2-footer">
        <div className="ks-v2-footer-main">
          <div className="ks-v2-footer-brand"><KashurmewLogo variant="light" size="lg" /><p>A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.</p><Link href="/contact">Questions? Get in touch <ArrowUpRight size={14} /></Link></div>
          <div><small>SHOP</small><Link href="/shop">Shop the collection</Link><Link href="/cart">Your bag</Link><Link href="/account">My account</Link></div>
          <div><small>THE BRAND</small><Link href="/about">Our story</Link><Link href="/#shop">The signature collection</Link><Link href="/contact">Contact us</Link></div>
          <div><small>HELP & POLICIES</small><Link href="/policies/shipping">Shipping</Link><Link href="/policies/refund">Returns & refunds</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link></div>
        </div>
        <div className="ks-v2-footer-bottom"><span>© Kashurmewa</span><span>THE TASTE OF KASHMIR.</span><Link href="/policies/food-safety">Food safety information</Link></div>
      </footer>
    </main>
  );
}
